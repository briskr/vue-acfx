<template>
  <div class="l-dsh">
    <front-header />
    <router-view />
  </div>
</template>

<script>
import FrontHeader from '@/components/dashboard/Header';

export default {
  components: {
    FrontHeader,
  },
};
</script>
