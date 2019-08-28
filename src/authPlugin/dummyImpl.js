/**
 * Dummy auth* API implementation for debug
 */
const dummyImpl = {
  /**
   * Submit login form content and return result
   * @param {object} loginParams
   * @returns {Promise} login result data containing session token
   */
  login(loginParams) {
    console.debug('dummyImpl.login():', loginParams);
    const result = {
      token: 'TOKEN_LOGIN_SUCCESS',
    };
    return Promise.resolve(result);
  },

  /**
   * Submit signin request (if needed) and resturn result
   * @returns {Promise} signin result containing permission set
   */
  signin() {
    console.debug('dummyImpl.signin()');
    const result = {
      menus: [],
      permissions: [],
    };
    return Promise.resolve(result);
  },

  hasPermission(entry) {
    return 'allowed' === entry;
  },

  catchError(resp) {
    console.debug('dummyImpl.catchError', resp);
  },
};

export default dummyImpl;
