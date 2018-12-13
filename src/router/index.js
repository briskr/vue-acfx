import Vue from 'vue';
import Router from 'vue-router';

/* Common Views */
const LoginView = (resolve) => require(['@/views/Login'], resolve);
const Common401View = (resolve) => require(['@/views/common/401'], resolve);
const Common404View = (resolve) => require(['@/views/common/404'], resolve);

Vue.use(Router);

export const baseRoutes = [
  {
    path: '/401',
    name: 'Unauthorized',
    component: Common401View,
  },
  {
    path: '/404',
    name: 'NotFound',
    component: Common404View,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
];

import store from '../store';
import { CURRENT_VIEW_TITLE } from '../store/mutationTypes';

const router = new Router({
  routes: baseRoutes,
});

router.afterEach((to) => {
  const viewTitle = to.meta.name || to.name;
  if (viewTitle) {
    store.commit(CURRENT_VIEW_TITLE, viewTitle);
  }

  const appTitle = process.env.VUE_APP_TITLE;
  if (viewTitle && appTitle) {
    window.document.title = viewTitle + ' - ' + appTitle;
  } else if (viewTitle) {
    window.document.title = viewTitle;
  } else if (appTitle) {
    window.document.title = appTitle;
  }
});

export default router;
