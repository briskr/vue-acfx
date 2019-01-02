<style lang="scss">
</style>

<template>
  <main class="o-main-view">
    <ul class="o-menu o-menu--v">
      <li v-ac="'create'">create</li>
      <li v-ac="'update'">update</li>
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
