<style lang="scss">
</style>

<template>
  <nav class="l-adm__nav">
    <logo class="l-adm__logo" />
    <div class="o-menu o-menu--v o-menu--dark">
      <sub-menu
        v-for="menu in $ac.menus"
        :data="menu"
        :key="menu.id"
      ></sub-menu>
    </div>
  </nav>
</template>

<script>
import Logo from '../Logo';

/**
 * Recursively build a sub-menu and its items
 * @param {Object} item - menu description object
 */
function renderItem(h, item) {
  function textOf(item) {
    return (item.meta && item.meta.name) || item.name;
  }
  if (Array.isArray(item.children)) {
    // render sub-menu title and child items
    const headerContent =
      item.path && item.meta && !item.meta.noLink ? (
        <router-link to={item.path} tag="li" class="l-adm__sub-header">
          <i class={['item__icon', item.icon]} />
          <a class="item__text">{textOf(item)}</a>
        </router-link>
      ) : (
        <li class="l-adm__sub-header">
          <i class={['item__icon', item.icon]} />
          <span class="item__text">{textOf(item)}</span>
        </li>
      );
    return h('ul', { class: 'l-adm__sub' }, [
      headerContent,
      ...item.children.map((item) => renderItem(h, item)),
    ]);
  } else {
    // render menu item
    return (
      <router-link to={item.path} tag="li" class="l-adm__navitem">
        <a class="item__text">{textOf(item)}</a>
      </router-link>
    );
  }
}

export default {
  components: {
    Logo,
    SubMenu: {
      name: 'SubMenu',
      functional: true,
      props: {
        data: {
          type: Object,
          required: true,
        },
      },
      render(h, context) {
        return renderItem(h, context.props.data);
      },
    },
  },
};
</script>
