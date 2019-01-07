import { SET_USER, SET_MENUS, CLEAR_SESSION } from './mutationTypes';

export default {
  state: {
    user: null,
    menus: {},
  },
  mutations: {
    [SET_USER](state, payload) {
      state.user = payload.user;
    },
    [SET_MENUS](state, payload) {
      state.menus = payload.menus;
    },
    [CLEAR_SESSION](state) {
      state.user = null;
      state.menus = {};
    },
  },
  actions: {
    async setUser({ commit }, payload) {
      commit(SET_USER, payload);
    },
    async setMenus({ commit }, payload) {
      commit(SET_MENUS, payload);
    },
    async clearSession({ commit }) {
      commit(CLEAR_SESSION);
    },
  },
  getters: {
    currentUserLogin: (state) => (state.user ? state.user.login : ''),
    currentUserName: (state) => (state.user ? state.user.fullName : ''),
  },
};
