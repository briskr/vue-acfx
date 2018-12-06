import Vue from 'vue';
import Router from 'vue-router';

/* Common Views */
const LoginView = (resolve) => require(['@/views/Login'], resolve);
const Common401View = (resolve) => require(['@/views/common/401'], resolve);
const Common404View = (resolve) => require(['@/views/common/404'], resolve);

Vue.use(Router);

let baseRoutes = [
  {
    path: '/401',
    name: '无权访问',
    component: Common401View,
  },
  {
    path: '/404',
    name: '找不到页面',
    component: Common404View,
  },
  {
    path: '/login',
    name: '登录',
    component: LoginView,
  },
];

import store from '../store';
import { CURRENT_VIEW_TITLE } from '../store/mutationTypes';

let router = new Router({
  routes: baseRoutes,
});

router.beforeEach((to, from, next) => {
  const routeName = to.meta.name || to.name;
  if (routeName) {
    store.commit(CURRENT_VIEW_TITLE, routeName);
  }

  const appTitle = process.env.VUE_APP_TITLE;
  if (routeName && appTitle) {
    window.document.title = routeName + ' - ' + appTitle;
  } else if (routeName) {
    window.document.title = routeName;
  } else if (appTitle) {
    window.document.title = appTitle;
  }
  next();
});

export default router;
