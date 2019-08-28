/** @module vue-acfx */

import AccessControl from './AccessControl';
import acMenu from './acMenu';

const plugin = {
  /**
   * Vue plugin install entrance
   * @param {class} Vue - Vue root, to be extended
   * @param {object} options - used to initialize $ac object:
   * ```js
{
  name: {string} = 'ac',// this plugin installs at 'vm.$ac' by default
  msg: {string|func},   // a message display function, will be available at vm.$ac.msg. Could be:
    1) 'noop', to disable message display;
    2) name of a func already installed at Vue.prototype[msg];
    3) reference of a func;
    4) falsy: will load a vue-m-message instance as default.
  impl: {object},       // strategy instance, actual API implementation, see dummyImpl.js
  router: {object},     // pass in router instance (required)
  store: {object},      // pass in vuex store instance (required)
  allRouteDefs:{RouteDef[]},// should provide meta data for all possible routes
  baseRoutes: {RouteConfig[]},// permitted routes for anonymous users
}
    ```
   */
  install(Vue, options) {
    // Use existing message function if provided
    if (options && options.msg && typeof options.msg === 'string') {
      if (options.msg.toLowerCase === 'noop') {
        options.msg = () => {};
      } else {
        options.msg = Vue.prototype[options.msg];
      }
    }
    const acCtrl = new AccessControl(options);

    // Set up global mixin, default: vm.$ac
    Object.defineProperty(Vue.prototype, `$${acCtrl.name}`, {
      get() {
        return acCtrl;
      },
    });

    // Set up custom directive, default: v-ac
    Vue.directive(acCtrl.name, {
      inserted: function(el, { value }) {
        if (!acCtrl.hasPermission(value)) {
          el.parentNode.removeChild(el);
        }
      },
    });

    // Register ac-menu component
    Vue.component(`${acCtrl.name}-menu`, acMenu);
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
