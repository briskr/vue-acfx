<style lang="scss"></style>

<template>
  <header class="l-adm__header l-toolbar">
    <div class="l-toolbar__left">
      <div class="l-adm__view-title">{{ currentViewTitle }}</div>
    </div>
    <corner-menu class="l-toolbar__right"> </corner-menu>
  </header>
</template>

<script>
import CornerMenu from '../CornerMenu';

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
