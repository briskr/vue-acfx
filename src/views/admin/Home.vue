/*  */
<style lang="scss">
</style>

<template>
  <div class="l-admin">
    <admin-sidebar />
    <div class="l-admin__body">
      <admin-header />
      <div class="l-admin__main-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/Sidebar.vue';
import AdminHeader from '@/components/admin/Header.vue';

export default {
  components: {
    AdminSidebar,
    AdminHeader,
  },
};
</script>
