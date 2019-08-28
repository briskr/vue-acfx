import Vue from 'vue';
import Vuex from 'vuex';

import app from './app';
import session from './session';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    session,
  },
  state: {},
  mutations: {},
  actions: {},
});
