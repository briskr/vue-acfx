import AccessControl from './AccessControl';

const plugin = {
  /**
   * Plugin install entrance
   * @param {class} Vue - Vue root, to be extended
   * @param {object} options - customize options:
   * <code>
   *  {
   *    name: string = 'ac',      // this plugin extends vue instance at 'vm.$name'
   *    impl: object = dummyImpl, // strategy instance, actual API implementation, see dummyImpl.js
   *    router: object,           // pass in router instance to be extended
   *    msg: function|string,     // a message display function, will be available at vm.$ac.$msg. Could be:
   *                                  1) 'noop', to disable message display;
   *                                  2) function name, if already installed at vm[msg];
   *                                  3) a function reference.
   *                                 If falsy, will load a vue-m-message instance as default.
   *  }
   * </code>
   */
  install(Vue, options) {
    // Use existing message function if provided
    if (options && options.msg && typeof options.msg === 'string') {
      if (options.msg.toLowerCase === 'noop') {
        options.msg = () => {};
      } else {
        options.msg = Vue[options.msg];
      }
    }
    const acCtrl = new AccessControl(options);

    // Set up global mixin, default: vm._$ac
    Object.defineProperty(Vue.prototype, `$${acCtrl.name}`, {
      get() {
        return acCtrl;
      },
    });

    // Set up custom directive, default: v-ac
    Vue.directive(acCtrl.name, {
      inserted: function(el, { value }) {
        if (acCtrl.hasPermission(value)) {
          // TODO debug
          el.style.display = 'none';
          el.dataset[acCtrl.name] = 'success';
          //el.parentNode.removeChild(el);
        } else {
          el.dataset[acCtrl.name] = 'fail';
        }
      },
    });
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
