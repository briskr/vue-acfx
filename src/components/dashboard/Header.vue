<style lang="scss">
.c-header-nav {
  background: transparent;
}
</style>

<template>
  <div class="l-dsh__header l-toolbar">
    <div class="l-toolbar__left">
      <logo/>
    </div>
    <div class="l-toolbar__fill">
      <ul class="o-menu o-menu--h o-menu--dark c-header-nav">
        <li class="menu-item">
          <router-link to="/admin/users" class="menu-item__text">Users</router-link>
          <!-- TODO menu items -->
        </li>
        <li class="menu-item">
          <router-link to="/admin/roles" class="menu-item__text">Roles</router-link>
          <!-- TODO menu items -->
        </li>
      </ul>
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
