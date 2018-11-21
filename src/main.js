import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';

Vue.config.productionTip = false;
import '@/assets/css/main.scss';

import authPlugin from './authPlugin';
Vue.use(authPlugin);

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
