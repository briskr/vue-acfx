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
    this.$ac.signin();
  },
  methods: {
    /**
     * handles 'login' (success) event from login view, redirect to initially requested path
     */
    loginDirect(newPath) {
      this.$ac.signin(() => {
        this.$router.replace({ path: newPath || '/' });
      });
    },
    /**
     * handles 'logout' event,
     */
    logoutDirect() {
      this.$ac.signout();
      this.$router.replace({ path: '/' });
    },
  },
};
</script>
