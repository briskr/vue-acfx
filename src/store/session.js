import { SET_USER, CLEAR_SESSION } from './mutationTypes';

export default {
  state: {
    user: null,
  },
  mutations: {
    [SET_USER](state, payload) {
      state.user = payload.user;
    },
    [CLEAR_SESSION](state) {
      state.user = null;
    },
  },
  actions: {
    async setUser({ commit }, payload) {
      commit(SET_USER, payload);
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
