<style lang="scss">
</style>

<template>
  <main class="o-main-view">
    <ul class="o-menu o-menu--v">
      <li v-ac="$ac.actions.NEW">create</li>
      <li v-ac="$ac.actions.MOD">update</li>
      <li v-ac="$ac.actions.DEL">delete</li>
    </ul>
  </main>
</template>

<script>
export default {
  name: 'users',
  data() {
    return {
      message: 'users list',
    };
  },
};
</script>
