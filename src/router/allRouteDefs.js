// Dashboard Views
import DashboardHome from '@/views/dashboard/Home';
const FrontPageView = (resolve) => require(['@/views/dashboard/FrontPage'], resolve);
const AboutView = (resolve) => require(['@/views/about/About'], resolve);

// Admin Views
//import AdminHome from '@/views/admin/Home';
const AdminHome = (resolve) => require(['@/views/admin/Home'], resolve);
const UsersView = (resolve) => require(['@/views/admin/Users'], resolve);
const RolesView = (resolve) => require(['@/views/admin/Roles'], resolve);

const EmptyView = (resolve) => require(['@/views/Empty.vue'], resolve);

/**
 * Describe all possible route nodes
 */
const allRouteDefs = [
  {
    path: '/',
    component: DashboardHome,
    children: [
      {
        path: '',
        name: 'FrontPage',
        component: FrontPageView,
        meta: {
          name: '首页',
        },
      },
    ],
  },
  {
    path: '/login',
    meta: {
      name: '登录',
    },
  },
  {
    path: '/about',
    component: DashboardHome,
    meta: {
      name: '关于本站',
    },
    children: [
      {
        path: '/contact',
        name: 'AboutContact',
        meta: {
          name: '联系我们',
        },
        component: AboutView,
        children: [
          {
            path: 'form',
            name: 'Contact-A-Form',
            component: AboutView,
            meta: {
              name: '留言板',
            },
          },
          {
            path: 'address',
            name: 'Contact-B-Address',
            component: AboutView,
            meta: {
              name: '地址',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    component: AdminHome,
    name: 'Admin',
    meta: {
      name: '系统管理',
    },
    children: [
      {
        path: 'users',
        name: 'ManageUsers',
        component: UsersView,
        meta: {
          name: '用户管理',
        },
      },
      {
        path: 'roles',
        name: 'ManageRoles',
        component: RolesView,
        meta: {
          name: '角色管理',
        },
      },
    ],
  },
  {
    path: '/base',
    component: AdminHome,
    name: 'BaseData',
    meta: {
      name: '基础数据',
    },
    children: [
      {
        path: 'categories',
        component: RolesView,
        meta: {
          name: '类目管理',
        },
      },
    ],
  },
  {
    path: '/debug',
    component: EmptyView,
    meta: {
      name: '调试',
    },
  },
];

export default allRouteDefs;
