import { SET_USER, ADD_ROUTES, SET_MENUS, CLEAR_SESSION } from './mutationTypes';

export default {
  state: {
    user: null,
    routes: [],
    menus: [],
  },
  mutations: {
    [SET_USER](state, payload) {
      state.user = payload.user;
    },
    [ADD_ROUTES](state, payload) {
      state.routes.splice(state.routes.length, 0, ...payload.routes);
    },
    [SET_MENUS](state, payload) {
      state.menus = payload.menus;
    },
    [CLEAR_SESSION](state) {
      state.user = null;
      state.routes = [];
      state.menus = [];
    },
  },
  actions: {
    async setUser({ commit }, payload) {
      commit(SET_USER, payload);
    },
    async addRoutes({ commit }, payload) {
      commit(ADD_ROUTES, payload);
    },
    async setMenus({ commit }, payload) {
      commit(SET_MENUS, payload);
    },
    async clearSession({ commit }) {
      // other async clean up
      commit(CLEAR_SESSION);
    },
  },
  getters: {
    currentUserLogin: (state) => (state.user ? state.user.login : ''),
    currentUserName: (state) => (state.user ? state.user.fullName : ''),
  },
};
