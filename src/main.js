import Vue from 'vue';
import router from './router';
import store from './store';
Vue.config.productionTip = false;

import '@/assets/css/main.scss';

import Message from 'vue-m-message';
const msgFuncName = 'msg';
Vue.use(Message, { name: msgFuncName });
const msgFunc = Vue.prototype['$' + msgFuncName];

import authPlugin from './authPlugin';
// project specific
import demoImpl from './demoImpl';
import allRouteDefs from './router/allRouteDefs';
import baseRoutes from './router/baseRoutes';

Vue.use(authPlugin, {
  name: 'ac',
  msg: msgFunc,
  impl: demoImpl,
  allRouteDefs,
  baseRoutes,
  router,
  store,
});

const RouterView = Vue.component('router-view');
new Vue({
  store,
  router,
  render: (h) => h(RouterView),
}).$mount('#app');
