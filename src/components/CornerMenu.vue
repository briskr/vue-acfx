<template>
  <div role="menubar" class="o-menu o-menu--light o-menu--h">
    <template v-if="$store.getters.currentUserName">
      <div role="menu" class="menu-item">
        <span class="menu-item__text">{{$store.getters.currentUserName}}</span>
        <!-- hover menu <ul>
        </ul> -->
      </div>
      <div class="menu-item">
        <a role="menuitem" href="#" class="menu-item__text" @click="$ac.logoutDirect()">logout</a>
      </div>
    </template>
    <router-link v-else tag="div" class="menu-item"
     :to="{ name: 'Login', query: { from: $route.path } }">
      <a role="menuitem" class="menu-item__text">login</a>
    </router-link>
  </div>
</template>
