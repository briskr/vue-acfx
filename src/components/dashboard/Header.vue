<!-- -->

<template>
  <div class="l-dsh__header l-toolbar">
    <div class="l-toolbar__left">
      <logo/>
    </div>
    <div class="l-toolbar__fill">
      <ul class="l-dsh__menu o-menu o-menu--h o-menu--dark">
        <li><router-link to="/admin/users" class="item__text">Users</router-link></li>
        <li><router-link to="/admin/roles" class="item__text">Roles</router-link></li>
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
