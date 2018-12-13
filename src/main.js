import Vue from 'vue';
import App from './App';
import store from './store';
import router, { baseRoutes } from './router';

//Vue.config.productionTip = false;
import '@/assets/css/main.scss';

import Message from 'vue-m-message';
const msgFuncName = 'msg';
Vue.use(Message, { name: msgFuncName });
const msgFunc = Vue['$' + msgFuncName];

import allRouteDefs from './router/allRouteDefs';
import authPlugin from './authPlugin';
// project specific
import demoImpl from './demoImpl';

Vue.use(authPlugin, {
  name: 'ac',
  msg: msgFunc,
  impl: demoImpl,
  router,
  allRouteDefs,
  baseRoutes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
