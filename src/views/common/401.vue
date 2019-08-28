<template>
  <div>
    <h1>401</h1>
    <p v-if="$route.params">You are not allowed to visit: {{ path }}</p>
  </div>
</template>

<script>
export default {
  props: ['path'],
};
</script>
