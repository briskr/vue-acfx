/**
 * Component to render menu according to menu data from $ac
 */
const menuGroup = {
  functional: true,
  props: {
    group: {
      type: String,
      required: true,
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
    if (!context.props.group || !context.parent.$ac.menus[context.props.group]) return;
    const menuGroup = context.parent.$ac.menus[context.props.group];
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

export default menuGroup;
