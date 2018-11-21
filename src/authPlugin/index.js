import Message from 'vue-m-message';
import AccessControl from './AccessControl';

const plugin = {
  /*
   * Plugin install entrance
   */
  install(Vue, options) {
    const pluginName = options && options.name ? options.name : 'ac';
    const acCtrl = new AccessControl(options);

    // Used by catchError
    Vue.use(Message, {
      name: '_msg',
    });

    // Set up global mixin
    Object.defineProperty(Vue.prototype, `$_${pluginName}`, {
      get() {
        return acCtrl;
      },
    });

    // Set up custom directive
    Vue.directive(pluginName, {
      inserted: function(el, { value }) {
        if (acCtrl.hasPermission(value)) {
          el.style.display = 'none';
          el.dataset[pluginName] = 'success';
          //el.parentNode.removeChild(el);
        } else {
          el.dataset[pluginName] = 'fail';
        }
      },
    });
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
