/**
 * Component to render menu according to $ac.menus data
 */
export default {
  functional: true,
  props: {
    group: {
      type: String,
      required: true,
    },
    acName: {
      type: String,
      required: false,
    },
  },
  render(h, context) {
    function textOf(item) {
      return (item.meta && item.meta.name) || item.name;
    }
    /**
     * Recursively build a sub-menu and its items
     * @param {Object} item - menu description object
     */
    function renderItem(h, item) {
      const children = [];
      if (item.icon) {
        children.push(<i class={['menu-item__icon', item.icon]} />);
      }
      children.push(
        item.path && !item.noLink ? (
          <router-link to={item.path} class="menu-item__text">
            {textOf(item)}
          </router-link>
        ) : (
          <span class="menu-item__text">{textOf(item)}</span>
        )
      );
      if (item.children) {
        children.push(
          h('ul', { class: 'submenu' }, item.children.map((item) => renderItem(h, item)))
        );
      }
      return h('li', { class: 'menu-item' }, children);
    }
    let acName = context.props.acName;
    if (!acName) acName = 'ac';
    if (!context.props.group) return;
    const menus = context.parent[`$${acName}`].menus;
    if (!menus || !menus[context.props.group]) return;

    console.debug('acMenu: ', context.props.group);
    const menuGroup = menus[context.props.group];
    const result = [];
    for (let menu of menuGroup.children) {
      result.push(renderItem(h, menu));
    }
    let classes = ['o-menu'];
    if (context.data.staticClass) {
      classes = classes.concat(context.data.staticClass.split(' '));
    }
    return h('ul', { class: classes }, result);
  },
};
