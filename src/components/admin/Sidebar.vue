<style lang="scss">
</style>

<template>
  <nav class="l-adm__nav">
    <logo class="l-adm__logo" />
    <ul role="menubar" class="o-menu o-menu--v">
      <li role="menuitem" class="l-adm__navitem">
        <router-link to="/admin/roles">Roles</router-link>
      </li>
      <li role="menuitem" class="l-adm__navitem">
        <router-link to="/admin/users">Users</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import Logo from '../Logo';

export default {
  components: {
    Logo,
  },
};
</script>
