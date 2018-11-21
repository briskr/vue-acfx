import Vue from 'vue';
import router from '@/router';
import store from '@/store';

/*
 * Handle server error status codes.
 */
const catchError = function(error) {
  if (error.response) {
    if (error.response.data.message === 'USER_NOT_LOGGED_IN') {
      store.dispatch('clearAllInfo').then(() => {
        Vue.prototype.$_msg({
          message: '登录状态已经过期, 请重新登录',
          type: 'error',
        });
      });
      router.push('/login');
    }

    switch (error.response.status) {
      case 400:
        Vue.prototype.$_msg({
          message: error.response.data.message || 'Request invalid.',
          type: 'error',
        });
        break;
      case 401:
        sessionStorage.removeItem('user');
        Vue.prototype.$_msg({
          message: error.response.data.message || 'Authentication failed.',
          type: 'warning',
          onClose: function() {
            location.reload();
          },
        });
        break;
      case 403:
        Vue.prototype.$_msg({
          message: error.response.data.message || 'Access denied.',
          type: 'warning',
        });
        break;
      default:
        Vue.prototype.$_msg({
          message:
            error.response.data.message || 'Server returned ' + error.response.status + ' ' + error.response.statusText,
          type: 'error',
        });
    }
  }
  return Promise.reject(error);
};

export default catchError;
