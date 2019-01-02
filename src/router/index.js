import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import store from '../store';
import { CURRENT_VIEW_TITLE } from '../store/mutationTypes';

// add customize params here, to be used as init and reset
const createRouter = () => new Router();

const router = createRouter();

/**
 * Clean added routes, start fresh.
 */
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher;
}

router.afterEach((to, from) => {
  console.debug('router.afterEach: from ' + from.path + ' to ' + to.path);
  const viewTitle = to.meta.name || to.name;
  if (viewTitle) {
    store.commit(CURRENT_VIEW_TITLE, viewTitle);
  }

  const appTitle = process.env.VUE_APP_TITLE;
  if (viewTitle && appTitle) {
    window.document.title = viewTitle + ' - ' + appTitle;
  } else if (viewTitle) {
    window.document.title = viewTitle;
  } else if (appTitle) {
    window.document.title = appTitle;
  }
});

export default router;
