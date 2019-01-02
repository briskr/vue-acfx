<style lang="scss">
</style>

<template>
  <main class="o-main-view">
    <ul class="o-menu o-menu--v">
      <li v-ac="'new'">create</li>
      <li v-ac="'modify'">update</li>
      <li v-ac="'delete'">delete</li>
    </ul>
  </main>
</template>

<script>
export default {
  name: 'roles',
  data() {
    return {
      message: 'roles list',
    };
  },
};
</script>
