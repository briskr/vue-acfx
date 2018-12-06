<style lang="scss">
</style>

<template>
  <main class="o-main-view">
    <ul class="o-menu o-menu--h">
      <li v-ac="allowed">item 1</li>
      <li v-ac="denied">item 2</li>
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
