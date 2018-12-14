const demoImpl = {
  /**
   * Customize response error status handling
   * @param {object} resp
   * @returns truthy to skip default behavior
   */
  catchError(resp) {
    if (resp && resp.data && resp.data.message === 'USER_NOT_LOGGED_IN') {
      this.msg({
        message: '登录状态已经过期, 请重新登录',
        type: 'error',
      });
      this.redirect('/login');
      return true;
    }
  },

  login(loginParams) {
    console.debug('demo.login', loginParams);
    const result = {
      token: 'TESTTOKEN01',
      user: {
        login: 'user1',
        fullName: 'User1',
      },
    };
    return new Promise((resolve) => {
      setTimeout(resolve, 100, result);
    });
  },

  signin() {
    const result = {
      modules: [
        {
          id: 'mid_about',
          path: 'about',
        },
        {
          id: 'mid_about_contact',
          path: 'contact',
          parentId: 'mid_about',
        },
        {
          id: 'mid_about_l3a',
          name: '3rd Level A',
          path: '3rd',
          parentId: 'mid_about_contact',
        },
        {
          id: 'mid_about_l3b',
          name: '3rd Level B',
          path: '/3rd-b',
          parentId: 'mid_about_contact',
        },
        {
          id: 'gid_admin',
          name: 'Security',
          path: '/admin/',
          isMenu: true,
          isControlled: true,
        },
        {
          id: 'mid_users',
          parentId: 'gid_admin',
          name: 'Users',
          path: 'users',
          isMenu: true,
          isControlled: true,
        },
        {
          id: 'mid_roles',
          parentId: 'gid_admin',
          name: 'Roles',
          path: 'roles',
          isMenu: true,
          isControlled: true,
        },
        {
          id: 'gid_base',
          name: 'Base Data',
          path: '/base/',
          isMenuGroup: true,
        },
        {
          id: 'mid_category',
          parentId: 'gid_base',
          name: 'Categories',
          path: 'categories',
          isMenu: true,
        },
        {
          id: 'gid_debug',
          name: 'Debug',
          path: '/debug',
        },
      ],
    };
    return new Promise((resolve) => {
      setTimeout(resolve, 100, result);
    });
  },

  /**
   * Check availability and call ac.$msg()
   * @param {object} arg - message: text, type: 'info'|'success'|'error'|'warning'|'loading', other options see vue-m-message
   */
  msg(options) {
    if (this.ac) {
      this.ac.$msg(options);
    } else {
      console.debug(options.type, options.message);
    }
  },
  /**
   * Check availability and call ac.router.push()
   * @param {string} path
   */
  redirect(path) {
    if (this.ac && this.ac.router && this.ac.router.push) {
      this.ac.router.push(path);
    }
  },
};

export default demoImpl;
