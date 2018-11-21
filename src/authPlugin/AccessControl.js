import axios from 'axios';
import router from '@/router';
import { session } from './sessionUtil';
import dummyImpl from './dummyImpl';

/**
 * Access Controll plugin
 */
class AccessControl {
  constructor(options) {
    // 负责实际调用认证/授权API
    if (options && options.impl) {
      this.apiImpl = options.impl;
    } else {
      this.apiImpl = dummyImpl;
    }

    // 完成signon之后得到的权限控制数据
    this.resourcePermission = [];
    // 负责根据权限数据，控制axios是否允许对某路径的访问
    this.requestInterceptor = null;
  }

  /*  */
  debug(arg) {
    console.debug('AccessControl', arg);
  }

  /*  */
  hasPermission(rArray) {
    let requiredPermissions = [];
    let permission = true;

    if (Array.isArray(rArray)) {
      rArray.forEach((e) => {
        if (e && e.p) {
          requiredPermissions = requiredPermissions.concat(e.p);
        }
      });
    } else {
      if (rArray && rArray.p) {
        requiredPermissions = rArray.p;
      }
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      let p = requiredPermissions[i];
      if (!this.resourcePermission[p]) {
        permission = false;
        break;
      }
    }

    return permission;
  }

  /*
   */
  setupRequestInterceptor() {
    //
  }

  /*
   * Submit login credentials with actual impl
   */
  submitLogin(arg) {
    this.apiImpl.login && this.apiImpl.login(arg).then(this.processLoginResult);
  }

  /**
   * Receive login result data
   * @param LoginResult loginResult
   */
  processLoginResult(loginResult) {
    console.debug('login result:', loginResult);
  }

  /**
   * Submit signon request with actual impl
   */
  submitSignin() {
    this.apiImpl.signin && this.apiImpl.signin().then(this.processSignOnResult);
  }

  /**
   * Receive signon result data
   * @param SignonResult signonResult
   */
  processSignOnResult(signonResult) {
    console.debug('signon result:', signonResult);
  }

  /*
   * Establish signon state
   */
  signin() {
    // check if already logged in
    let localUser = session('token');
    if (!localUser || !localUser.token) {
      // redirect to login page if not
      return router.push({ path: '/login', query: { from: router.currentRoute.path } });
    }

    // already logged in, setup global request header
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + localUser.token;

    // get authz info, optionally done at login
    this.submitSignin();
  }

  /*
   * Perform signout clean up
   */
  signout() {
    //
    axios.defaults.headers.common['Authorization'] = undefined;

    if (this.requestInterceptor) {
      axios.interceptors.request.reject(this.requestInterceptor);
      this.requestInterceptor = null;
    }
  }
}

export default AccessControl;
