import { CURRENT_VIEW_TITLE } from './mutationTypes';

export default {
  state: {
    currentViewTitle: '',
  },
  mutations: {
    [CURRENT_VIEW_TITLE](state, title) {
      state.currentViewTitle = title;
    },
  },
};
