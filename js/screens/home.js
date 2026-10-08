function menuSection(container, title, items) {
  container.appendChild(Util.el('div', { class: 'section-title' }, title));
  const grid = Util.el('div', { class: 'menu-grid' });
  for (const [icon, label, hash] of items) {
    grid.appendChild(Util.el('div', { class: 'menu-card', onclick: () => Util.navigate(hash) }, [
      Util.el('div', { class: 'chip' }, icon),
      Util.el('div', { class: 'label' }, label),
      Util.el('div', { class: 'chev' }, '›'),
    ]));
  }
  container.appendChild(grid);
}

function renderHome(container) {
  menuSection(container, 'Lab', [
    ['🧪', 'Lab Work', '#/lab-work'],
    ['📋', 'Lab Log', '#/lab-log'],
  ]);
  menuSection(container, 'Harvest & Cellar', [
    ['➕', 'Work Orders', '#/work-order'],
    ['📋', 'Work Order Results', '#/work-order-results'],
    ['➕', 'Crush Log Entry', '#/crush-log'],
    ['📋', 'Crush Log Results', '#/crush-log-results'],
    ['➕', 'Pre-Harvest Date Entry', '#/pre-harvest-log'],
    ['📋', 'Pre-Harvest Date Results', '#/pre-harvest-results'],
    ['➕', 'Pre-Harvest Test Entry', '#/pre-harvest-measure'],
    ['📋', 'Pre-Harvest Test Results', '#/pre-harvest-measure-results'],
  ]);
  menuSection(container, 'Vineyard', [
    ['🍃', 'Vineyard Activity', '#/vineyard'],
    ['📋', 'Vineyard Log', '#/vineyard-log'],
  ]);
  menuSection(container, 'Tools', [
    ['🔁', 'Conversions', '#/conversions'],
    ['🍷', 'Blending', '#/blending'],
    ['🍇', 'Wines', '#/wine-list'],
  ]);
}

window.renderHome = renderHome;
