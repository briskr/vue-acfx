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

  constructor(options) {
    // login/signin API implementation
    this.apiImpl = dummyImpl;

    /** resource request control */
    // make axios to fail unpermitted resource requests
    this.requestInterceptor = null;

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

    if (options) {
      // plugin name
      if (options.name) {
        this.name = options.name;
      } else {
        this.name = 'ac';
      }

      // pass in actual login/signin API implementation
      if (options.impl && typeof options === 'object') {
        // merge with dummy impl
        Object.assign(this.apiImpl, options.impl);
        // Attach a reference to self for impl to use
        this.apiImpl.ac = this;
      }

      // pass in router reference
      if (options.router) {
        this.router = options.router;
      } else {
        return new Error('router is needed in options.');
      }
      if (options.routeDefs) {
        this.routeDefs = options.routeDefs;
      } else {
        this.routeDefs = [];
      }

      // setup msg function
      if (options.msg && typeof options.msg === 'function') {
        this.$msg = options.msg;
      } else {
        // load a message provider
        this.$msg = require('vue-m-message');
      }
    }
  }

  // public interface begin

  /**
   * Establish signin state
   * @param {function} callback - to be called after signin complete
   */
  signin(callback) {
    let cachedToken = this.sessionGet(AccessControl.STORAGE_KEY_TOKEN);
    if (!cachedToken) {
      // cached result does't exist, redirect to login page
      return this.router.push({ path: '/login', query: { from: this.router.currentRoute.path } });
    }
    // get authz info (optionally done during login)
    this.submitSignin().then(() => {
      typeof callback === 'function' && callback();
    });
  }

  /**
   * Perform signout clean up, clean up what signin() have done.
   */
  signout() {
    if (this.requestInterceptor) {
      axios.interceptors.request.reject(this.requestInterceptor);
      this.requestInterceptor = null;
    }

    sessionStorage.removeItem(AccessControl.STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(AccessControl.STORAGE_KEY_USER);

    axios.defaults.headers.common['Authorization'] = undefined;
  }

  /**
   * Submit credentials to perform actual API call.
   * Call from your login form.
   * @returns {Promise}
   */
  submitLogin(arg) {
    if (!this.apiImpl.login) {
      // login api not defined
      // continue in case that actual app has other authentication mechanism
      return Promise.resolve();
    }
    return this.apiImpl.login(arg).then((result) => {
      this.onLoginSuccess(result);
      return result;
    });
  }

  /**
   * Submit signon request with actual impl.
   * Currently called by signin().
   * (might be needed when token exists but permissions lost?)
   * @returns {Promise}
   */
  submitSignin() {
    if (!this.apiImpl.signin) {
      return Promise.resolve();
    }
    return this.apiImpl.signin().then((result) => {
      this.onSigninSuccess(result);
      return result;
    });
  }

  /**
   * Check if requried permissions are granted
   * @param entry - required permission entr(y|ies) for some UI element
   */
  hasPermission(entry) {
    if (this.apiImpl.hasPermission) {
      return this.apiImpl.hasPermission(entry);
    }
    // TODO default impl
  }

  // end public interface

  // procedures begin

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
          this.$msg({ message: error.response.data.message || 'Request invalid.', type: 'error' });
          break;
        case 401:
          sessionStorage.removeItem('user');
          this.$msg({
            message: error.response.data.message || 'Authentication failed.',
            type: 'warning',
            onClose: function() {
              location.reload();
            },
          });
          break;
        case 403:
          this.$msg({ message: error.response.data.message || 'Access denied.', type: 'warning' });
          break;
        default:
          this.$msg({
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
    console.debug('login result:', loginResult);
    if (loginResult.token) {
      this.sessionSet(AccessControl.STORAGE_KEY_TOKEN, loginResult.token);
      // TODO allow impl to override token usage
      // set up token header for subsequent requests
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginResult.token;
    }
    if (loginResult.user) {
      this.sessionSet(AccessControl.STORAGE_KEY_USER, loginResult.user);
    }
  }

  /**
   * Receive signin result data
   * @param SigninResult signonResult
   */
  onSigninSuccess(signinResult) {
    console.debug('signin result:', signinResult);
    // resource request control
    /*
    resourcePermissions = [];
    this.setupRequestInterceptor(this.resourcePermissions);
    */
    // setup permitted routes
    let [dynamicRoutes, menus] = this.buildRoutesAndMenus(signinResult.modules);
    console.debug('dynamic routes:', dynamicRoutes);
    console.debug('menus:', menus);
    this.router.addRoutes(dynamicRoutes);

    // publish menus
    this.menus = menus;

    return Promise.resolve(signinResult);
  }

  // end procedures

  // private utils begin

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
  buildRoutesAndMenus(modules, parentField) {
    // result
    const routesTree = [];
    const menusTree = [];
    // short circuit empty input
    if (!Array.isArray(modules)) {
      return {
        routes: routesTree,
        menus: menusTree,
      };
    }
    // build route and menu node for each module
    const routeNodes = new Map();
    const menuNodes = new Map();
    for (let m of modules) {
      let path = m.path;
      if (m.path.length > 1 && m.path.endsWith('/')) {
        path = m.path.substring(0, m.path.length - 1);
      }
      const rn = { path };
      if (m.name) rn.name = m.name;
      if (m.isPublic) rn.meta = { isPublic: m.isPublic };
      routeNodes.set(m.id, rn);

      if (m.isMenu || m.isMenuGroup) {
        let mn = { path };
        if (m.isMenuGroup) {
          mn.meta = { isMenuGroup: true };
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
        routesTree.push(rn);
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

    // fill route detail according to full routes map
    const routePathDefMap = this.buildRoutePathDefMap(this.routeDefs);
    console.debug('routePathDefMap:', routePathDefMap);

    for (let routeNode of routesTree) {
      this.fillRouteDetails(routeNode, routePathDefMap);
    }
    for (let menuNode of menusTree) {
      this.fillMenuDetails(menuNode, routePathDefMap);
    }
    return [routesTree, menusTree];
  }

  /**
   * Get string or object from storage
   * @param string key
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
   * Save string or object to storage
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
   * Join parent and child path with '/'
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
   * Build one Map entry for each routeDef (path->routeDef), then traverse its children too.
   * @param {Map} routePathDefMap - the Map to be filled
   * @param {object} routeDef - route definition object
   * @param {string} basePath - parent path of routeDef
   */
  parseRouteDef(routePathDefMap, routeDef, basePath) {
    if (!routeDef) {
      return;
    }
    if (typeof routeDef.path !== 'string') {
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
    routePathDefMap.set(fullPath, routeItem);

    if (Array.isArray(routeDef.children)) {
      for (let rdChild of routeDef.children) {
        this.parseRouteDef(routePathDefMap, rdChild, routeDef.path);
      }
    }
  }

  /**
   * Build a Map of path->routeDef, according to allRouteDefs (passed in as this.routeDefs)
   * @param {Array} allRouteDefs - Array of route details object
   */
  buildRoutePathDefMap(allRouteDefs) {
    const routePathDefMap = new Map();
    for (let routeDef of allRouteDefs) {
      this.parseRouteDef(routePathDefMap, routeDef);
    }
    return routePathDefMap;
  }

  /**
   * Fill details to routesTree nodes according to routesPathMap
   * @param {*} routeNode - a node from routesTree, to be filled with details
   * @param {*} routePathDefMap - path -> route definition detail item
   */
  fillRouteDetails(routeNode, routePathDefMap) {
    if (!routeNode.path || !routePathDefMap.has(routeNode.path)) {
      return;
    }
    // #default_child_route: restore path defined in allRouteDefs
    let matchingDef = routePathDefMap.get(routeNode.path);
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
        this.fillRouteDetails(childNode, routePathDefMap);
      }
    }
  }

  /**
   * Fill details to menusTree nodes according to routesPathMap
   */
  fillMenuDetails(menuNode, routePathDefMap) {
    if (!menuNode.path || !routePathDefMap.has(menuNode.path)) {
      return;
    }
    let matchingDef = routePathDefMap.get(menuNode.path);
    if (matchingDef.name) menuNode.name = matchingDef.name;
    if (matchingDef.meta) {
      if (!menuNode.meta) {
        menuNode.meta = {};
      }
      Object.assign(menuNode.meta, matchingDef.meta);
    }
    if (menuNode.children) {
      for (let childNode of menuNode.children) {
        this.fillMenuDetails(childNode, routePathDefMap);
      }
    }
  }
  // end private utils
}

export default AccessControl;
