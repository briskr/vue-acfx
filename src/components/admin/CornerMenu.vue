<style lang="scss">
@import '@/assets/css/main.scss';

.c-user-menu {
  background: $color-bg-placeholder;
  padding: 0 $unit-padding-1;

  &__item {
    margin: 0 $unit-padding-1;
  }
}
</style>

<template>
  <div role="menubar" class="o-menu c-user-menu">
    <div role="menu" class="c-user-menu__item">account</div>
    <div role="menu" class="c-user-menu__item">help</div>
  </div>
</template>
