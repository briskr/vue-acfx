<template>
  <div class="l-dsh__header l-toolbar">
    <div class="l-toolbar__left">
      <logo/>
    </div>
    <div class="l-toolbar__fill">
      <ac-menu group="dashboard" class="o-menu--h o-menu--light"/>
    </div>
    <corner-menu class="l-toolbar__right">
    </corner-menu>
  </div>
</template>

<script>
import Logo from '../Logo';
import CornerMenu from '../CornerMenu';

export default {
  components: {
    Logo,
    CornerMenu,
  },
};
</script>
