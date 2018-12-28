import Vue from 'vue';
import store from './store';

//Vue.config.productionTip = false;

import '@/assets/css/main.scss';

import Message from 'vue-m-message';
const msgFuncName = 'msg';
Vue.use(Message, { name: msgFuncName });
const msgFunc = Vue.prototype['$' + msgFuncName];

import authPlugin from './authPlugin';
// project specific
import allRouteDefs from './router/allRouteDefs';
import demoImpl from './demoImpl';
import router, { baseRoutes } from './router';

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
