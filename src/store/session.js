// TODO move inside plugin

import { CLEAR_SESSION } from './mutationTypes';

export default {
  state: {
    user: {},
    token: '',
  },
  mutations: {
    [CLEAR_SESSION](state) {
      state.user = {};
      state.token = '';
    },
  },
  actions: {
    async clearSession({ commit }) {
      // other async clean up

      commit(CLEAR_SESSION);
    },
  },
};
