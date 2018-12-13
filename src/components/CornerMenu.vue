<style lang="scss">
@import '@/assets/css/_settings.colors.scss';
@import '@/assets/css/_settings.metrics.scss';

.c-user-menu {
  /* background: $color-bg-placeholder; */
  padding: 0 $unit-padding-1;

  &__item {
    margin: 0 $unit-padding-1;
  }
}
</style>

<template>
  <div role="menubar" class="o-menu o-menu--light c-user-menu">
    <div role="menu" class="item__text c-user-menu__item">account</div>
    <a v-if="$ac.loggedIn" role="menu" class="item__text c-user-menu__item" @click="logout">logout</a>
    <!-- TODO add query param -->
    <router-link v-else role="menu" class="item__text c-user-menu__item" to="/login">login</router-link>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$root.$emit('logout');
    },
  },
};
</script>
