<style>
</style>

<template>
  <router-view @login="loginDirect" @logout="logoutDirect"/>
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
