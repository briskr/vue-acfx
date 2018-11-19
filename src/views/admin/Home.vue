/*
 * Admin UI layoute page */
 */
<style lang="scss">
</style>

<template>
  <div class="l-adm">
    <admin-sidebar />
    <div class="l-adm__body">
      <admin-header />
      <div class="l-adm__main-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';

export default {
  components: {
    AdminSidebar,
    AdminHeader,
  },
};
</script>
