import Vue from 'vue';
import Router from 'vue-router';

const LoginView = (resolve) => require(['../views/login.vue'], resolve);
const Common401View = (resolve) => require(['../views/common/401.vue'], resolve);
const Common404View = (resolve) => require(['../views/common/404.vue'], resolve);

Vue.use(Router);

let baseRoutes = [
  {
    path: '/login',
    name: '登录',
    component: LoginView,
  },
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
];

export default new Router({
  routes: baseRoutes,
});
