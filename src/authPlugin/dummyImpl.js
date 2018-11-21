/**
 * Dummy auth* API implementation for debug
 */
const dummyImpl = {
  login(arg) {
    console.debug('dummyImpl.login():', arg);
    const reuslt = {
      token: 'TOKEN_LOGIN_SUCCESS',
      menus: [],
      resources: [],
    };
    return Promise.resolve(reuslt);
  },

  signin() {
    console.debug('dummyImpl.signon()');
    return Promise.resolve('dummyImpl.signon()');
  },
};

export default dummyImpl;
