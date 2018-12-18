import axios from 'axios';
import dummyImpl from './dummyImpl';

/*
interface ApiImpl {
  login;
  signin;
  catchError;
};
interface LoginResult {
  token: string;
}
 */

/**
 * Access Control plugin
 */
class AccessControl {
  static STORAGE_KEY_TOKEN = '_token';
  static STORAGE_KEY_USER = '_user';

  /**
   * Class of the $ac Vue extension object, holding application-level states
   * and data related to access control functionalities.
   *
   * @param {Object} options - used to initialize $ac object
   */
  constructor(options) {
    if (!options) throw new Error('options is needed.');
    if (!options.router) {
      throw new Error('router is needed in options.');
    }
    if (!options.store) {
      throw new Error('vuex store is needed in options.');
    }
    this.router = options.router;
    this.store = options.store;

    // login/signin API implementation
    this.apiImpl = dummyImpl;

    /** menu for current user */
    // TODO multi menu trees?
    this.menus = [];

    /*
    // TODO axios instance for login/sign API call
    let authApiBase = process.env.VUE_APP_AUTH_API_BASE;
    if (!authApiBase) {
      authApiBase = process.env.VUE_APP_API_BASE;
    }
    this.axiosInstance = axios.create({
      baseURL: authApiBase,
      timeout: 10000,
    });
    */

    // name to extend Vue vm
    if (options.name) {
      this.name = options.name;
    } else {
      this.name = 'ac';
    }
    // setup msg function
    if (options.msg && typeof options.msg === 'function') {
      this.msg = options.msg;
    } else {
      // load a message provider
      this.msg = require('vue-m-message');
    }

    // pass in actual login/signin API implementation
    if (options.impl && typeof options === 'object') {
      // merge with dummy impl
      Object.assign(this.apiImpl, options.impl);
      // Attach a reference to self for impl to use
      this.apiImpl.ac = this;
    }

    // path -> route detail info item
    this.routePathDefMap = new Map();
    if (options.allRouteDefs) {
      for (let routeDef of options.allRouteDefs) {
        this.parseRouteDef(routeDef);
      }
    }

    if (options.baseRoutes) {
      this.baseRoutes = options.baseRoutes;
    } else {
      this.baseRoutes = [];
    }
    // route access control
    this.resetRoutePermissions();
    this.removeBeforeEachHandle = this.router.beforeEach((to, from, next) => {
      console.debug('router.beforeEach: from ' + from.path + ' to ' + to.path);
      //debugger;
      //TODO handle reload by sessionStorage data
      if (to.meta && to.meta.isControlled) {
        // permission needed
        if (!this.hasLoginToken) {
          next({ name: 'Login', query: { from: to.path } });
        } else {
          // if sessionStorage has full routes but routePermissions has only base,
          // then load full routes from sessionStorage
          if (this.routePermissions.has(to.path)) {
            next();
          } else {
            next({ name: 'Unauthorized' });
          }
        }
      } else {
        if (this.routePermissions.has(to.path)) {
          next();
        } else {
          next({ name: 'NotFound' });
        }
      }
    });

    // fill in route details, then add this.baseRoutes to router
    for (let routeNode of this.baseRoutes) {
      this.fillRouteDetails(routeNode);
    }
    this.router.addRoutes(this.baseRoutes);
    this.store.dispatch('addRoutes', { routes: this.baseRoutes });

    // make axios to fail unpermitted resource requests
    this.requestInterceptor = null;

    /** path->Set(of allowed actions on this route) */
    this.actionPermissions = new Map();
  }

  //NOTE not used on any occasion, might be removed
  destructor() {
    if (typeof this.removeBeforeEachHandle === 'function') {
      this.removeBeforeEachHandle();
    }
  }

  //#region public interface

  /**
   * Check if login token exists in sessionStorage
   */
  get hasLoginToken() {
    return typeof this.sessionGet(AccessControl.STORAGE_KEY_TOKEN) === 'string';
  }

  /**
   * Current logged in user info
   */
  get currentUser() {
    return this.sessionGet(AccessControl.STORAGE_KEY_USER);
  }

  /**
   * Establish signin state
   * @param {function} callback - optional, to be called after signin
   */
  signin(callback) {
    let cachedToken = this.sessionGet(AccessControl.STORAGE_KEY_TOKEN);
    if (!cachedToken) {
      // no token yet, redirect to login page
      return this.router.push({
        path: '/login',
        query: { from: this.router.currentRoute.path },
      });
    }
    // get authz info (optionally done during login)
    this.submitSignin().then(() => {
      typeof callback === 'function' && callback();
    });
  }

  /**
   * Clean up login user, clean up what signin() have done.
   * @param {function} callback - optional, to be called after signout
   */
  signout(callback) {
    // clean up things from signin phase
    this.store.dispatch('clearSession');
    // reset baseRoutes in vuex store
    this.store.dispatch('addRoutes', { routes: this.baseRoutes });

    this.actionPermissions.clear();
    if (this.requestInterceptor) {
      axios.interceptors.request.reject(this.requestInterceptor);
      this.requestInterceptor = null;
    }
    this.resetRoutePermissions();
    this.menus = [];

    // clean up things from login phase
    sessionStorage.removeItem(AccessControl.STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(AccessControl.STORAGE_KEY_USER);

    axios.defaults.headers.common['Authorization'] = undefined;

    typeof callback === 'function' && callback();
  }

  /**
   * Submit credentials to perform actual API call.
   * Call from your login form.
   * @returns {Promise}
   */
  async submitLogin(arg) {
    if (!this.apiImpl.login) {
      // login api not defined
      // continue in case that actual app has other authentication mechanism
      return Promise.resolve();
    }
    const result = await this.apiImpl.login(arg);
    this.onLoginSuccess(result);
    return result;
  }

  /**
   * Submit signin request with actual impl.
   * (when token exists but permissions lost?)
   * @returns {Promise}
   */
  async submitSignin() {
    if (!this.apiImpl.signin) {
      return Promise.resolve();
    }
    const result = await this.apiImpl.signin();
    this.onSigninSuccess(result);
    return result;
  }

  /**
   * Check if requried permissions are granted
   * @param entry - required permission entr(y|ies) for some UI element
   */
  hasPermission(entry) {
    // call project-specific impl first
    if (typeof this.apiImpl.hasPermission === 'function') {
      return this.apiImpl.hasPermission(entry);
    }
    // default impl
    const currentPath = this.router.app && this.router.app.$route.path;
    if (!currentPath) {
      // DEBUG could this be hit when router.app not set up?
      debugger;
      return true;
    }
    if (this.actionPermissions.has(currentPath)) {
      const actionSet = this.actionPermissions.get(currentPath);
      return actionSet && actionSet.has(entry);
    }
  }

  //#endregion public interface

  //#region procedures

  /**
   * Handle server response error info from interceptor
   * @param {*} error
   */
  catchError(error) {
    // TODO called by interceptor
    if (error.response) {
      // delegate to impl-specific procedure
      if (this.apiImpl.catchError) {
        return this.apiImpl.catchError(error.response);
      }
      // default procedure
      switch (error.response.status) {
        case 400:
          this.msg({
            message: error.response.data.message || 'Request invalid.',
            type: 'error',
          });
          break;
        case 401:
          sessionStorage.removeItem('user');
          this.msg({
            message: error.response.data.message || 'Authentication failed.',
            type: 'warning',
            onClose: function() {
              location.reload();
            },
          });
          break;
        case 403:
          this.msg({
            message: error.response.data.message || 'Access denied.',
            type: 'warning',
          });
          break;
        default:
          this.msg({
            message:
              error.response.data.message ||
              'Server returned ' + error.response.status + ' ' + error.response.statusText,
            type: 'error',
          });
      }
    }
    return Promise.reject(error);
  }

  /**
   * Base behaviors on successful login
   * @param LoginResult returned value from impl.login()
   */
  onLoginSuccess(loginResult) {
    if (loginResult.token) {
      this.sessionSet(AccessControl.STORAGE_KEY_TOKEN, loginResult.token);
      // TODO allow impl to override token usage
      // set up token header for subsequent requests
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginResult.token;
    }
    if (loginResult.user) {
      this.sessionSet(AccessControl.STORAGE_KEY_USER, loginResult.user);
      this.store.dispatch('setUser', { user: loginResult.user });
    }
    return Promise.resolve(loginResult);
  }

  /**
   * Receive signin result data
   * @param SigninResult signonResult
   */
  onSigninSuccess(signinResult) {
    // setup permitted routes
    let [dynamicRoutes, menus] = this.buildDynamicRoutesAndMenus(signinResult.modules);

    // fill route detail according to full routes map
    for (let routeNode of dynamicRoutes) {
      this.fillRouteDetails(routeNode);
    }
    for (let menuNode of menus) {
      this.fillMenuDetails(menuNode);
    }
    console.debug('routes:', dynamicRoutes);
    console.debug('menus:', menus);

    if (!this._routesAdded) {
      this.router.addRoutes(dynamicRoutes);
      this.store.dispatch('addRoutes', { routes: dynamicRoutes });
      this._routesAdded = true;
    }
    // setup router guards
    this.buildRoutePermissions(dynamicRoutes);

    // setup request control
    //this.setupRequestInterceptor(this.resourcePermissions);

    // setup menus
    this.menus = menus;

    return Promise.resolve(signinResult);
  }

  //#endregion procedures

  //#region private utils

  /**
   * Reset route permissions to allow only base routes
   */
  resetRoutePermissions() {
    this.routePermissions = new Set();
    this.buildRoutePermissions(this.baseRoutes);
  }

  /**
   * Setup axios interceptor:
   * 1) to watch response for error status, and act accordingly;
   * 2) (optional feature) to perform resource request control
   */
  /*
  setupRequestInterceptor(routesTree) {
    //
  }
  */
  /**
   * Build a multi-root tree-like structure as an array of top nodes.
   * Each node describes a route element, and could contain children nodes.
   * @param {Array} modules - flat array of route parts
   * [{
      id: string,
      parentId: string,
      path: '/absolute/path/' | './relative/to/parent' | 'relative/to/parent/on/ch',
      name: string,(optional, prefer name from fullMap)
      isMenuGroup: bool, (no route link generated)
      isMenu: bool, (generate route link)
      isPublic: bool, (allow anonymous access)
    }]
    @returns {Array} [routes, menus]
   */
  buildDynamicRoutesAndMenus(modules, parentField) {
    // result
    const dynamicRoutes = [];
    const menusTree = [];
    // short circuit empty input
    if (!Array.isArray(modules)) {
      return {
        routes: dynamicRoutes,
        menus: menusTree,
      };
    }
    // build route and menu node for each module
    const routeNodes = new Map();
    const menuNodes = new Map();
    for (let m of modules) {
      let path = m.path;

      // build route node
      if (m.path.length > 1 && m.path.endsWith('/')) {
        path = m.path.substring(0, m.path.length - 1);
      }
      const rn = { path };
      if (m.name) rn.name = m.name;
      if (m.isControlled) rn.meta = { isControlled: true };
      routeNodes.set(m.id, rn);

      // whether to include this node in menu
      if (m.isMenu || m.isMenuGroup) {
        // build menu node
        let mn = { path };
        if (m.isMenuGroup) {
          // have path but don't render link
          mn.meta = { noLink: true };
        } else if (m.isMenu) {
          if (m.meta) mn.meta = {};
        }
        if (m.name) mn.name = m.name;
        if (m.meta) Object.assign(mn.meta, m.meta);
        menuNodes.set(m.id, mn);
      }
    }
    // pick top level modules (no parent, or parent points to self or non-existing)
    const visitedIndices = new Set();
    parentField = parentField || 'parentId';
    for (let i1 = 0; i1 < modules.length; i1++) {
      let m1 = modules[i1];
      if (!m1[parentField] || m1[parentField] === m1.id || !routeNodes.has(m1[parentField])) {
        visitedIndices.add(i1);
        // create top-level route nodes
        let rn = routeNodes.get(m1.id);
        if (!rn.path.startsWith('/')) {
          rn.path = '/' + rn.path;
        }
        dynamicRoutes.push(rn);
        // create top-level menu nodes
        if (m1.isMenu || m1.isMenuGroup) {
          let mn = menuNodes.get(m1.id);
          if (mn.path && !mn.path.startsWith('/')) {
            mn.path = '/' + mn.path;
          }
          menusTree.push(mn);
        }
      }
    }
    // insert children nodes to their parents
    let visitedCount;
    do {
      visitedCount = visitedIndices.size;
      for (let i2 = 0; i2 < modules.length; i2++) {
        // pick next unvisited
        if (visitedIndices.has(i2)) continue;
        let m2 = modules[i2];
        // NOTE: for the procedure below correctly build paths of deep-down nodes,
        // higher-level nodes should appear before their children
        // TODO maybe save path parts during parent-matching, unshift parent path into head of array, then build full path at the end.

        // find parent route node, insert current node as its children
        let rnParent = routeNodes.get(m2[parentField]);
        if (!rnParent.children) {
          rnParent.children = [];
        }
        let rnChild = routeNodes.get(m2.id);
        // let rnChild.path be full path, to be matched later with allRouteDefs
        // if child node path doesn't start with '/', full path should be /parent.path/child.path
        if (!rnChild.path.startsWith('/')) {
          // #default_child_route: mark default child route by '/parent/#'
          rnChild.path = this.joinPath(rnParent.path, rnChild.path === '' ? '#' : rnChild.path);
        }
        rnParent.children.push(rnChild);

        if (menuNodes.has(m2.id) && menuNodes.has(m2[parentField])) {
          // find parent menu node, insert current node as is children
          let mnParent = menuNodes.get(m2[parentField]);
          if (!mnParent.children) {
            mnParent.children = [];
          }
          let mnChild = menuNodes.get(m2.id);
          if (!mnChild.path.startsWith('/')) {
            mnChild.path = this.joinPath(mnParent.path, mnChild.path);
          }
          mnParent.children.push(mnChild);
        }

        visitedIndices.add(i2);
      }
    } while (visitedIndices.size < modules.length && visitedIndices.size > visitedCount);

    return [dynamicRoutes, menusTree];
  }

  /**
   * Collect paths of permitted routes
   * @param {Object[]} routes - route to be collected
   * @param {string} [] parentPath
   */
  buildRoutePermissions(routes, parentPath) {
    for (let route of routes) {
      let fullPath = route.path;
      if (parentPath) {
        fullPath = this.joinPath(parentPath, fullPath);
      }
      this.routePermissions.add(fullPath);
      if (route.children) {
        this.buildRoutePermissions(route.children, fullPath);
      }
    }
  }

  /**
   * Get string or object from sessionStorage
   * @param {string} key
   * @returns {string} value
   */
  sessionGet(key) {
    var lsVal = sessionStorage.getItem(key);
    if (lsVal && lsVal.indexOf('autostringify-') === 0) {
      return JSON.parse(lsVal.split('autostringify-')[1]);
    } else {
      return lsVal;
    }
  }

  /**
   * Save string or object to sessionStorage
   * @param {*} key
   * @param {*} value
   */
  sessionSet(key, value) {
    if (typeof value === 'object' || Array.isArray(value)) {
      value = 'autostringify-' + JSON.stringify(value);
    }
    return sessionStorage.setItem(key, value);
  }

  /**
   * Join parent and child path with '/'.
   * If child starts with '/', treat it as full path
   */
  joinPath(parent, child) {
    if (child.startsWith('/')) {
      return child;
    }
    let result = '';
    if (parent) {
      result = parent.endsWith('/') ? parent : parent + '/';
    }
    return result + child;
  }

  /**
   * Initialize this.routePathDefMap by building one Map entry for a routeDef
   *  (path -> routeDef), then traverse its children.
   *
   * **NOTE** this.routePathDefMap should be empty before calling this.
   * @param {object} routeDef - route definition object, must have path property
   * @param {string} basePath - parent path of routeDef
   */
  parseRouteDef(routeDef, basePath) {
    if (this.routePathDefMap.constructor !== Map) {
      throw new Error('this.routePathDefMap must have been created');
    }
    if (!routeDef || typeof routeDef.path !== 'string') {
      return;
    }
    basePath = basePath || '/';
    // #default_child_route: mark default child route (path:'') by '/parent/#'
    let fullPath = this.joinPath(basePath, routeDef.path === '' ? '#' : routeDef.path);
    const routeItem = {
      path: routeDef.path,
      name: routeDef.name,
      component: routeDef.component,
      meta: routeDef.meta,
    };
    this.routePathDefMap.set(fullPath, routeItem);

    if (Array.isArray(routeDef.children)) {
      for (let rdChild of routeDef.children) {
        this.parseRouteDef(rdChild, fullPath);
      }
    }
  }

  /**
   * Fill details to routesTree nodes according to `this.routesPathMap`
   * @param {*} routeNode - a node from routesTree, to be filled with details
   */
  fillRouteDetails(routeNode, basePath) {
    let fullPath = routeNode.path;
    if (basePath) {
      fullPath = this.joinPath(basePath, routeNode.path === '' ? '#' : routeNode.path);
    }
    if (!fullPath || !this.routePathDefMap.has(fullPath)) {
      return;
    }
    // #default_child_route: restore path defined in allRouteDefs
    let matchingDef = this.routePathDefMap.get(fullPath);
    routeNode.path = matchingDef.path;
    if (matchingDef.name) routeNode.name = matchingDef.name;
    if (matchingDef.component) routeNode.component = matchingDef.component;
    if (matchingDef.meta) {
      if (!routeNode.meta) {
        routeNode.meta = {};
      }
      Object.assign(routeNode.meta, matchingDef.meta);
    }
    if (routeNode.children) {
      for (let childNode of routeNode.children) {
        this.fillRouteDetails(childNode, fullPath);
      }
    }
  }

  /**
   * Fill details to menusTree nodes according to routesPathMap
   */
  fillMenuDetails(menuNode) {
    if (!menuNode.path || !this.routePathDefMap.has(menuNode.path)) {
      return;
    }
    let matchingDef = this.routePathDefMap.get(menuNode.path);
    if (matchingDef.name) menuNode.name = matchingDef.name;
    if (matchingDef.meta) {
      if (!menuNode.meta) {
        menuNode.meta = {};
      }
      Object.assign(menuNode.meta, matchingDef.meta);
    }
    if (menuNode.children) {
      for (let childNode of menuNode.children) {
        this.fillMenuDetails(childNode);
      }
    }
  }
  //#endregion private utils
}

export default AccessControl;
