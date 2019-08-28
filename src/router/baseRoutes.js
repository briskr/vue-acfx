/* Common Views */
import DashboardHome from '@/views/dashboard/Home';
import FrontPageView from '@/views/dashboard/FrontPage';

const LoginView = (resolve) => require(['@/views/Login'], resolve);
const Common401View = (resolve) => require(['@/views/common/401'], resolve);
const Common404View = (resolve) => require(['@/views/common/404'], resolve);

export default [
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
