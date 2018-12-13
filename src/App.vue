<template>
  <router-view/>
</template>

<script>
export default {
  name: 'app',
  created() {
    this.$root.$on('login', this.loginDirect);
    this.$root.$on('logout', this.logoutDirect);
    // trigger login status check
    // TODO move to router guard, perform login only when needed
    this.$ac.signin();
  },
  methods: {
    /**
     * handles 'login' event, submits login request
     * @param {String} newPath - optionally redirect to this path
     */
    loginDirect(newPath) {
      this.$ac.signin(() => {
        this.$router.replace({ path: newPath || '/' });
      });
    },
    /**
     * handles 'logout' event, submit logout request and perform local cleanup
     * @param {String} newPath - optionally redirect to this path
     */
    logoutDirect(newPath) {
      this.$ac.signout(() => {
        this.$router.replace({ path: newPath || '/' });
      });
    },
  },
};
</script>
