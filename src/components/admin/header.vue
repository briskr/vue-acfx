<style lang="scss">
</style>

<template>
  <header class="l-admin__header l-toolbar">
    <div class="l-toolbar__left">
      <div class="l-admin__view-title">{{currentViewTitle}}</div>
    </div>
    <div class="l-toolbar__right">
      <div class="l-admin__menu">user menu</div>
    </div>
  </header>
</template>

<script>
export default {
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
