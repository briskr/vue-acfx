<style lang="scss">
</style>

<template>
  <header class="l-admin__header l-toolbar">
    <div class="l-toolbar__left">
      <div class="l-admin__view-title">{{currentViewTitle}}</div>
    </div>
    <div class="l-toolbar__right">
      <corner-menu></corner-menu>
    </div>
  </header>
</template>

<script>
import CornerMenu from './CornerMenu';

export default {
  components: {
    CornerMenu,
  },
  data() {
    return {};
  },
  computed: {
    currentViewTitle() {
      return this.$store.state.app.currentViewTitle;
    },
  },
};
</script>
