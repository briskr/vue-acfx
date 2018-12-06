<style>
</style>

<template>
  <div id="app" @login="loginDirect" @logout="logoutDirect">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'app',
  created() {
    this.$ac.signin();
  },
  methods: {
    /**
     * called after login success, redirect to initial requested path
     */
    loginDirect(newPath) {
      console.debug('loginDirect', newPath);
      this.$ac.signin(() => {
        this.$router.replace({ path: newPath || '/' });
      });
    },
    /**
     * called after logout
     */
    logoutDirect() {
      this.$router.replace({ path: '/login' });
    },
  },
};
</script>
