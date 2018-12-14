<template>
  <div role="menubar" class="o-menu o-menu--light o-menu--h">
    <div role="menu" class="menu-item">
      <span class="menu-item__text">account</span>
      <!-- hover menu <ul>
      </ul> -->
    </div>
    <div v-if="$ac.loggedIn" class="menu-item">
      <a role="menuitem" class="menu-item__text" @click="logout">logout</a>
    </div>
    <router-link tag="div" v-else role="menu" class="menu-item"
     :to="{ name: 'Login', query: { from: $route.path } }">
      <a role="menuitem" class="menu-item__text">login</a>
    </router-link>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$root.$emit('logout');
    },
  },
};
</script>
