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
          path: '/admin/',
          isControlled: true,
        },
        {
          id: 'mid_users',
          parentId: 'gid_admin',
          name: 'Users',
          path: 'users',
          isControlled: true,
        },
        {
          id: 'mid_roles',
          parentId: 'gid_admin',
          name: 'Roles',
          path: 'roles',
          isControlled: true,
        },
        {
          id: 'gid_base',
          name: 'Base Data',
          path: '/base/',
        },
        {
          id: 'mid_category',
          parentId: 'gid_base',
          name: 'Categories',
          path: 'categories',
        },
        /* {
          id: 'gid_debug',
          name: 'Debug',
          path: '/debug',
          isControlled: true
        }, */
      ],
      menus: [
        {
          id: 'g-dashb',
          group: 'dashboard',
        },
        {
          id: 'm-demo',
          name: 'Demo',
          parentId: 'g-dashb',
          path: '/',
        },
        {
          id: 'm-about',
          name: 'About',
          parentId: 'g-dashb',
          path: '/about',
        },
        {
          id: 'm-ab-contact',
          name: 'Contact',
          parentId: 'm-about',
          path: '/contact',
        },
        {
          id: 'm-contact-form',
          name: 'Guestbook',
          parentId: 'm-about',
          path: '/contact/form',
        },
        {
          id: 'm-contact-addr',
          name: 'Address',
          parentId: 'm-about',
          path: '/contact/address',
        },
        {
          id: 'g-admin',
          group: 'admin',
        },
        {
          id: 'm-sec',
          name: 'Security',
          parentId: 'g-admin',
        },
        {
          id: 'm-sec-users',
          name: 'Users',
          parentId: 'm-sec',
          path: '/admin/users',
        },
        {
          id: 'm-sec-roles',
          name: 'Roles',
          parentId: 'm-sec',
          path: '/admin/roles',
        },
        {
          id: 'm-base',
          name: 'Base Data',
          parentId: 'g-admin',
        },
        {
          id: 'm-base-cat',
          name: 'Categories',
          parentId: 'm-base',
          path: '/base/categories',
        },
        {
          id: 'm-debug',
          name: '[debug]',
          parentId: 'g-admin',
          path: '/debug',
        },
      ],
    };
    return new Promise((resolve) => {
      setTimeout(resolve, 100, result);
    });
  },

  /**
   * Check availability and call ac.msg()
   * @param {object} arg - message: text, type: 'info'|'success'|'error'|'warning'|'loading', other options see vue-m-message
   */
  msg(options) {
    if (this.ac) {
      this.ac.msg(options);
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
