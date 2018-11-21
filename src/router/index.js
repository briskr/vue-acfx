import Vue from 'vue';
import Router from 'vue-router';

/* Common Views */
const LoginView = (resolve) => require(['@/views/Login'], resolve);
const Common401View = (resolve) => require(['@/views/common/401'], resolve);
const Common404View = (resolve) => require(['@/views/common/404'], resolve);
//const EmptyView = (resolve) => require(['@/views/Empty.vue'], resolve);

/* To be dynamically loaded */
import AdminHome from '@/views/admin/Home';
const UsersView = (resolve) => require(['@/views/admin/Users'], resolve);
const RolesView = (resolve) => require(['@/views/admin/Roles'], resolve);

import DashboardHome from '@/views/dashboard/Home';
const FrontPageView = (resolve) => require(['@/views/dashboard/FrontPage'], resolve);

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
    path: '/admin',
    component: AdminHome,
    children: [
      {
        path: 'users',
        name: '用户管理',
        component: UsersView,
      },
      {
        path: 'roles',
        name: '角色管理',
        component: RolesView,
      },
    ],
  },
  {
    path: '/',
    component: DashboardHome,
    children: [
      {
        path: '',
        name: '首页',
        component: FrontPageView,
      },
    ],
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
