<style lang="scss">
</style>

<template>
  <div class="l-admin">
    <admin-sidebar />
    <div class="l-admin__body">
      <admin-header />
      <router-view class="l-admin__main" />
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/sidebar.vue';
import AdminHeader from '@/components/admin/header.vue';

export default {
  components: {
    AdminSidebar,
    AdminHeader,
  },
};
</script>
