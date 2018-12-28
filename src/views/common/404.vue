<template>
  <div>
    <h1>404</h1>
    <p v-if="$route.params">The path could not be reached: {{ path }}</p>
  </div>
</template>

<script>
export default {
  props: ['path'],
  methods: {
    beforeRouteUpdate(to, from, next) {
      console.debug('beforeRouteUpdate', from, to);
      this.path = to.params.path;
      next();
    },
  },
};
</script>
