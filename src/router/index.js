import Vue from 'vue';
import Router from 'vue-router';

/* Common Views */
import DashboardHome from '@/views/dashboard/Home';
import FrontPageView from '@/views/dashboard/FrontPage';

const LoginView = (resolve) => require(['@/views/Login'], resolve);
const Common401View = (resolve) => require(['@/views/common/401'], resolve);
const Common404View = (resolve) => require(['@/views/common/404'], resolve);

Vue.use(Router);

export const baseRoutes = [
  {
    path: '/',
    component: DashboardHome,
    children: [
      {
        path: '',
        name: 'FrontPage',
        component: FrontPageView,
      },
      {
        path: '/401',
        name: 'Unauthorized',
        component: Common401View,
        props: true,
      },
      {
        path: '/404',
        name: 'NotFound',
        component: Common404View,
        props: true,
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
];

import store from '../store';
import { CURRENT_VIEW_TITLE } from '../store/mutationTypes';

// add customize params here, to be used as init and reset
const createRouter = () => new Router();

const router = createRouter();

/**
 * Clean added routes, start fresh.
 */
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher;
}

router.afterEach((to, from) => {
  console.debug('router.afterEach: from ' + from.path + ' to ' + to.path);
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
