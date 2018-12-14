<template>
  <router-view/>
</template>

<script>
export default {
  name: 'app',
  created() {
    this.$root.$on('login', this.loginDirect);
    this.$root.$on('logout', this.logoutDirect);
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
      const vm = this;
      this.$ac.signout(() => {
        vm.$router.replace({ path: newPath || '/' });
      });
    },
  },
};
</script>
