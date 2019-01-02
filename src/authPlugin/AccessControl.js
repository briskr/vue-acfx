import axios from 'axios';
import dummyImpl from './dummyImpl';

/**
 * Access Control plugin
 */
class AccessControl {
  /** localStorage key: for sharing sessionStorage content with new tab */
  static LK_SESSION_REQUEST = '_ac_session_req_';
  static LK_SESSION_RESPONSE = '_ac_session_resp_';
  /** sessionStorage key: authentication token */
  static SK_TOKEN = 'token';
  /** sessionStorage key: authenticated user info */
  static SK_USER = 'user';
  /** sessionStorage key: authorized routes */
  static SK_DYNAMIC_ROUTES = 'dynamicRoutes';
  /** sessionStorage key: authorized menus */
  static SK_MENUS = 'menus';

  /**
   * Class of the $ac Vue extension object, holding application-level states
   * and data related to access control functionalities.
   *
   * @param {object} options - used to initialize $ac object
   */
  constructor(options) {
    if (!options) throw new Error('options is required.');

    if (!options.router) {
      throw new Error('router is required in options.');
    }
    if (!options.store) {
      throw new Error('vuex store is required in options.');
    }
    this.router = options.router;
    this.store = options.store;

    // customize name used to extend Vue vm
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

    // login/signin API implementation
    this.apiImpl = dummyImpl;
    // pass in project-specific implementation
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
    // fill in route details, then add this.baseRoutes to router
    for (let routeNode of this.baseRoutes) {
      this.fillRouteDetails(routeNode);
    }
    console.debug('addRoutes(this.baseRoutes)', this.baseRoutes);
    this.router.addRoutes(this.baseRoutes);

    this.resetRoutePermissions();
    this.removeBeforeEachHandle = this.router.beforeEach(this.beforeEachRoute.bind(this));

    // make axios to fail unpermitted resource requests
    this.requestInterceptor = null;

    const ac = this;
    // copy sessionStorage content to new tab on the same page
    // see https://blog.guya.net/2015/06/12/sharing-sessionstorage-between-tabs-for-secure-multi-tab-authentication/
    window.addEventListener('storage', function(event) {
      if (event.key === AccessControl.LK_SESSION_REQUEST && event.newValue) {
        // some tab has asked for the sessionStorage -> send it through localStorage
        console.debug('sessionStorage request received, giving help', event.newValue);
        localStorage.setItem(AccessControl.LK_SESSION_RESPONSE, JSON.stringify(sessionStorage));
        localStorage.removeItem(AccessControl.LK_SESSION_RESPONSE);
      } else if (event.key === AccessControl.LK_SESSION_RESPONSE && !sessionStorage.length) {
        // for the new tab, sessionStorage is empty -> fill it
        var data = JSON.parse(event.newValue);
        for (let key in data) {
          sessionStorage.setItem(key, data[key]);
        }
        // acCtrl should be able to update related UI reactively through vuex
        console.debug('sessionStorage response filled - restore from storage');
        ac.restoreFromSessionStorage();
      }
    });
    if (!sessionStorage.length) {
      // Ask other tabs for session storage
      localStorage.setItem(AccessControl.LK_SESSION_REQUEST, Date.now());
      console.debug('sessionStorage request sent');
      localStorage.removeItem(AccessControl.LK_SESSION_REQUEST);
    }
  }

  //NOTE not used on any occasion, might be removed
  destructor() {
    if (typeof this.removeBeforeEachHandle === 'function') {
      this.removeBeforeEachHandle();
    }
  }

  //#region public interface

  /**
   * Login id of currently logged in user (reactive)
   * @returns empty string if not logged in
   */
  get currentUserLogin() {
    if (!this.store) return '';
    return this.store.getters.currentUserLogin;
  }
  /**
   * Display name of currently logged in user (reactive)
   */
  get currentUserName() {
    if (!this.store) return '';
    return this.store.getters.currentUserName;
  }
  /**
   * Authenticated menus for currently logged in user (reactive)
   */
  get menus() {
    if (!this.store) return {};
    return this.store.state.session.menus;
  }

  /**
   * confirmed login, submits signin request
   * @param {String} newPath - optionally redirect to this path after signing in
   */
  loginDirect(newPath) {
    this.signin(() => {
      const path = newPath || '/';
      //console.debug('current:' + this.router.currentRoute.path, 'newPath:' + newPath);
      this.router.replace({ path });
    });
  }
  /**
   * Establish signin state
   * @param {function} callback - optional, to be called after signin
   */
  signin(callback) {
    let cachedToken = this.sessionGet(AccessControl.SK_TOKEN);
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
   * confirmed logout, submit logout request and perform local cleanup
   * @param {String} newPath - optionally redirect to this path
   */
  logoutDirect() {
    this.signout(() => {
      if (!this.routePermissions.has(this.router.currentRoute.path)) {
        this.router.push({ path: '/' });
      }
    });
  }
  /**
   * Clean up login user, clean up what signin() have done.
   * @param {function} callback - optional, to be called after signout
   */
  signout(callback) {
    // clean up things from signin phase
    this.store.dispatch('clearSession');

    if (this.requestInterceptor) {
      axios.interceptors.request.reject(this.requestInterceptor);
      this.requestInterceptor = null;
    }
    this.resetRoutePermissions();

    // clean up things from login / signin
    sessionStorage.clear();

    axios.defaults.headers.common['Authorization'] = undefined;

    // TODO clean defined routes in router?

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
   * Help writing v-ac directive content with constants.
   * e.g. v-ac="$ac.actions.NEW"
   */
  get actions() {
    return {
      LIST: 'list',
      QRY: 'query',
      NEW: 'new',
      MOD: 'modify',
      DEL: 'delete',
      BATCH_DEL: 'batchDel',
      BATCH_MOD: 'batchMod',
      IMP: 'import',
      EXP: 'export',
      UPL: 'upload',
    };
  }

  /**
   * Check if requried permissions are granted
   * @param entry - required permission entry name for some UI element
   */
  hasPermission(entry) {
    const currentPath = this.router.currentRoute.path;
    if (!this.routePermissions.has(currentPath)) return false;
    const allowedActions = this.routePermissions.get(currentPath);
    //console.debug('hasPermission?' + entry, currentPath, allowedActions);
    return allowedActions.has(entry);
  }

  //#endregion public interface

  //#region procedures

  /**
   * Check if login token exists in sessionStorage
   */
  get hasLoginData() {
    return (
      this.sessionGet(AccessControl.SK_TOKEN) &&
      this.sessionGet(AccessControl.SK_USER) &&
      this.sessionGet(AccessControl.SK_DYNAMIC_ROUTES) &&
      this.sessionGet(AccessControl.SK_MENUS)
    );
  }

  /**
   * Restore vuex store states according to sessionStorage data.
   */
  restoreFromSessionStorage() {
    // routes
    const dynamicRoutes = this.sessionGet(AccessControl.SK_DYNAMIC_ROUTES);
    // restore component info, lost during s11n
    for (let routeNode of dynamicRoutes) {
      this.fillRouteDetails(routeNode);
    }
    if (!this._routesAdded) {
      console.debug('addRoutes(dynamicRoutes)', dynamicRoutes);
      this.router.addRoutes(dynamicRoutes);
      this._routesAdded = true;
    }
    this.appendRoutePermissions(dynamicRoutes);
    // menus
    const menus = this.sessionGet(AccessControl.SK_MENUS);
    console.debug('restored menu from storage:', menus);
    this.store.dispatch('setMenus', { menus });
    // user
    const user = this.sessionGet(AccessControl.SK_USER);
    this.store.dispatch('setUser', { user });
  }

  /**
   * Handle route navigation
   * @param {Route} to - target route of navigation
   * @param {Route} from - previous route
   * @param {*} next - action callback
   */
  beforeEachRoute(to, from, next) {
    console.debug('router.beforeEach: from ' + from.path + ' to ' + to.path);
    //debugger;
    if (this.hasLoginData && !this.store.state.session.user) {
      // page reloaded, restore from sessionStorage
      console.debug('beforeEachRoute - restore from storage');
      this.restoreFromSessionStorage();
      // router has been changed, retry with new route object
      next({ ...to });
      return;
    }

    if (!this.hasLoginData) {
      // no token yet
      if (to.meta && to.meta.isControlled) {
        // login needed to access controlled route
        next({ name: 'Login', query: { from: to.path } });
      } else if (this.routePermissions.has(to.path)) {
        // non-controlled, permmited route (i.e. inside base routes), continue
        next();
      } else {
        // unknown route
        next({ name: 'NotFound', params: { path: to.path } });
      }
    } else {
      // has token
      if (this.routePermissions.has(to.path)) {
        // permmited route, continue
        next();
      } else if (this.routePathDefMap.has(to.path)) {
        // path defined but not authorized to current user
        next({ name: 'Unauthorized', params: { path: to.path } });
      } else {
        next({ name: 'NotFound', params: { path: to.path } });
      }
    }
  }

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
      this.sessionSet(AccessControl.SK_TOKEN, loginResult.token);
      // TODO allow impl to override token usage
      // set up token header for subsequent requests
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginResult.token;
    }
    if (loginResult.user) {
      this.sessionSet(AccessControl.SK_USER, loginResult.user);
      this.store.dispatch('setUser', { user: loginResult.user });
    }
    return Promise.resolve(loginResult);
  }

  /**
   * Extract routes and menus data from signin result
   * @param {SigninResult} signinResult
   */
  onSigninSuccess(signinResult) {
    // REFACTOR: customize translation by project-specific impl
    console.debug('got sign-in result, extracting routes, menus...');
    // set up dynamic routes and route permissions
    if (
      !this.sessionGet(AccessControl.SK_DYNAMIC_ROUTES) &&
      Array.isArray(signinResult.modules)
    ) {
      const dynamicRoutes = this.buildDynamicRoutes(signinResult.modules);
      // fill route detail according to full routes map
      for (let routeNode of dynamicRoutes) {
        this.fillRouteDetails(routeNode);
      }
      console.debug('routes:', dynamicRoutes);

      if (!this._routesAdded) {
        console.debug('addRoutes(dynamicRoutes)');
        this.router.addRoutes(dynamicRoutes);
        this._routesAdded = true;
      }
      // setup router guards
      this.appendRoutePermissions(dynamicRoutes);

      this.sessionSet(AccessControl.SK_DYNAMIC_ROUTES, dynamicRoutes);
    }

    // setup request control
    //this.setupRequestInterceptor(this.resourcePermissions);

    // set up menus
    if (!this.sessionGet(AccessControl.SK_MENUS) && Array.isArray(signinResult.menus)) {
      const menus = this.buildMenus(signinResult.menus);
      for (let menuNode of Object.values(menus)) {
        this.fillMenuDetails(menuNode);
      }
      console.debug('menus:', menus);
      this.store.dispatch('setMenus', { menus });

      // save to sessionStorage, to be used on reload
      this.sessionSet(AccessControl.SK_MENUS, this.menus);
    }

    return Promise.resolve(signinResult);
  }

  //#endregion procedures

  //#region private utils

  /**
   * Reset route permissions to allow only base routes
   */
  resetRoutePermissions() {
    this.routePermissions = new Map();
    this.appendRoutePermissions(this.baseRoutes);
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
   * Build an object whose properties being named menu groups.
   * Each group
   * @param {object[]} menus - flat array of menu entries. e.g.
```
[{
  id: '',
  group: 'key_of_group', // only in top-level
  parentId: 'ref_to_id', // not for top-level
  path: '/full/path',
  name: 'Display Name',
}]
```
   * @param {object[]} parentFieldName - default: 'parentId'
   * @returns {object} menu groups as result object properties
   */
  buildMenus(menus, parentFieldName) {
    const menuGroups = {};
    if (!Array.isArray(menus)) {
      return menuGroups;
    }
    parentFieldName = parentFieldName || 'parentId';
    // build a node for each menu entry,
    // then save them to be found by id
    const menuNodes = new Map();
    for (let m of menus) {
      if (typeof m.id !== 'string') continue;
      if (
        typeof m.group !== 'string' &&
        typeof m.path !== 'string' &&
        typeof m.name !== 'string'
      )
        continue;
      const mn = {};
      if (m.group) {
        mn.name = m.group;
      } else {
        if (m.path) {
          mn.path = this.removeTrailingSlash(m.path);
        }
        if (m.name) {
          mn.name = m.name;
        } else if (m.path) {
          // just in case
          mn.name = m.path.split('/').pop();
        }
        if (m.noLink) {
          mn.noLink = true;
        }
      }
      menuNodes.set(m.id, mn);
    }
    // pick menu group roots
    const visitedIndices = new Set();
    for (let i1 = 0; i1 < menus.length; i1++) {
      let m1 = menus[i1];
      if (typeof m1.group === 'string') {
        visitedIndices.add(i1);
        // create top-level menu node
        let mn = menuNodes.get(m1.id);
        // using group name as key
        menuGroups[m1.group] = mn;
      }
    }
    // insert children nodes to their parents
    let visitedCount;
    do {
      visitedCount = visitedIndices.size;
      for (let i2 = 0; i2 < menus.length; i2++) {
        // pick next unvisited
        if (visitedIndices.has(i2)) continue;
        let m2 = menus[i2];
        // find parent menu node, insert current node as is children
        if (menuNodes.has(m2.id) && menuNodes.has(m2[parentFieldName])) {
          let mnParent = menuNodes.get(m2[parentFieldName]);
          if (!mnParent.children) {
            mnParent.children = [];
          }
          let mnChild = menuNodes.get(m2.id);
          // if child node path doesn't start with '/', full path should be /parent.path/child.path
          if (mnChild.path && !mnChild.path.startsWith('/')) {
            let parentPath = mnParent.path || '/';
            mnChild.path = this.joinPath(parentPath, mnChild.path);
          }
          mnParent.children.push(mnChild);
        }

        visitedIndices.add(i2);
      }
    } while (visitedIndices.size < menus.length && visitedIndices.size > visitedCount);

    return menuGroups;
  }
  /**
   * Build a multi-root tree-like structure as an array of top-level route nodes.
   * Each node describes a route element, and could contain children nodes.
   * @param {object[]} modules - flat array of route parts
   * ```
[{
  id: string,
  parentId: string,
  path: '/absolute/path/' | './relative/to/parent' | 'relative/to/parent/on/ch',
  name: string, //optional, prefer name from fullMap)
  isControlled: bool, //deny anonymous access
}]
    ```
    @returns {object[]} dynamic routes
   */
  buildDynamicRoutes(modules, parentFieldName) {
    const dynamicRoutes = [];
    if (!Array.isArray(modules)) {
      return dynamicRoutes;
    }
    parentFieldName = parentFieldName || 'parentId';
    // build a route node for each module,
    // then save them to be found by id
    const routeNodes = new Map();
    for (let m of modules) {
      if (typeof m.id !== 'string') continue;
      if (typeof m.path !== 'string') continue;
      const rn = { path: this.removeTrailingSlash(m.path) };
      if (m.name) rn.name = m.name;

      let meta = {};
      if (m.isControlled) meta.isControlled = true;
      if (m.allowedActions) meta.allowedActions = m.allowedActions;
      if (Object.keys(meta)) {
        rn.meta = meta;
      }
      routeNodes.set(m.id, rn);
    }
    // pick top level modules
    const visitedIndices = new Set();
    for (let i1 = 0; i1 < modules.length; i1++) {
      let m1 = modules[i1];
      // no parent, parent points to self, or to non-existing
      if (
        !m1[parentFieldName] ||
        m1[parentFieldName] === m1.id ||
        !routeNodes.has(m1[parentFieldName])
      ) {
        visitedIndices.add(i1);
        // create top-level route node
        let rn = routeNodes.get(m1.id);
        rn.path = this.insertLeadingSlash(rn.path);
        dynamicRoutes.push(rn);
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
        // find parent route node, insert current node as its children
        if (routeNodes.has(m2.id) && routeNodes.has(m2[parentFieldName])) {
          let rnParent = routeNodes.get(m2[parentFieldName]);
          if (!rnParent.children) {
            rnParent.children = [];
          }
          let rnChild = routeNodes.get(m2.id);
          // let rnChild.path be full path, to be matched later with allRouteDefs
          // if child node path doesn't start with '/', full path should be /parent.path/child.path
          if (!rnChild.path.startsWith('/')) {
            // #default_child_route: mark default child route by '/parent/#'
            rnChild.path = this.joinPath(
              rnParent.path,
              rnChild.path === '' ? '#' : rnChild.path
            );
          }
          rnParent.children.push(rnChild);
        }

        visitedIndices.add(i2);
      }
    } while (visitedIndices.size < modules.length && visitedIndices.size > visitedCount);

    return dynamicRoutes;
  }

  /**
   * Collect paths of permitted routes
   * @param {Object[]} routes - route to be collected
   * @param {string} [] parentPath
   */
  appendRoutePermissions(routes, parentPath) {
    if (!Array.isArray(routes)) {
      return;
    }
    for (let route of routes) {
      let fullPath = route.path;
      if (parentPath) {
        fullPath = this.joinPath(parentPath, fullPath);
      }
      let actionsSet;
      if (route.meta && route.meta.allowedActions) {
        actionsSet = new Set(route.meta.allowedActions);
      } else {
        actionsSet = new Set();
      }
      this.routePermissions.set(fullPath, actionsSet);
      if (route.children) {
        this.appendRoutePermissions(route.children, fullPath);
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

  /** Remove trailing slash from path */
  removeTrailingSlash(path) {
    if (path.length > 1 && path.endsWith('/')) {
      return path.substring(0, path.length - 1);
    }
    return path;
  }
  /** Insert slash at the beginning, if not having one */
  insertLeadingSlash(path) {
    if (path.length > 0 && !path.startsWith('/')) {
      return '/' + path;
    }
    return path;
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
    if (menuNode.path && !this.routePathDefMap.has(menuNode.path)) {
      return;
    }
    if (menuNode.path) {
      let matchingDef = this.routePathDefMap.get(menuNode.path);
      if (matchingDef.name) menuNode.name = matchingDef.name;
      if (matchingDef.meta) {
        if (!menuNode.meta) {
          menuNode.meta = {};
        }
        Object.assign(menuNode.meta, matchingDef.meta);
      }
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
