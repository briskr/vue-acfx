<template>
  <div class="l-dsh">
    <front-header />
    <front-page />
  </div>
</template>

<script>
import FrontHeader from '@/components/dashboard/Header';
import FrontPage from './FrontPage';

export default {
  components: {
    FrontHeader,
    FrontPage,
  },
};
</script>
