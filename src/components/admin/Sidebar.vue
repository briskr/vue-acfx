<style lang="scss">
</style>

<template>
  <nav class="l-adm__nav">
    <logo class="l-adm__logo" />
    <ac-menu group="admin" class="o-menu--v o-menu--light"/>
  </nav>
</template>

<script>
import Logo from '../Logo';
import AcMenu from '../AcMenu';

export default {
  components: {
    Logo,
    AcMenu,
  },
};
</script>
