function renderLabWork(container) {
  container.appendChild(Util.pageHeader('Lab Work', '#/'));

  const items = [
    ['ta', 'TA'], ['taph', 'TA / pH Combo'], ['fso', 'Free SO2'], ['ph', 'pH'], ['va', 'VA'],
    ['alc', 'Percent Alc'], ['yan', 'YAN'], ['tso', 'Total SO2'], ['rs', 'RS'],
    ['fsova', 'Free SO2 and VA'], ['bxt', 'Brix / Temp'],
  ];

  container.appendChild(Util.el('div', { class: 'section-title' }, 'Tests'));
  const grid = Util.el('div', { class: 'menu-grid' });
  for (const [key, label] of items) {
    grid.appendChild(Util.el('div', { class: 'menu-card', onclick: () => Util.navigate(`#/lab/${key}`) }, [
      Util.el('div', { class: 'chip' }, '🧪'),
      Util.el('div', { class: 'label' }, label),
      Util.el('div', { class: 'chev' }, '›'),
    ]));
  }
  container.appendChild(grid);

  container.appendChild(Util.el('div', { class: 'section-title' }, 'Reference Wheels'));
  const wheelGrid = Util.el('div', { class: 'menu-grid' });
  for (const [route, label, icon] of [['aroma', 'Aroma Wheel', '🍇'], ['taste', 'Taste Wheel', '👅'], ['fault', 'Fault Wheel', '⚠️']]) {
    wheelGrid.appendChild(Util.el('div', { class: 'menu-card', onclick: () => Util.navigate(`#/wheel/${route}`) }, [
      Util.el('div', { class: 'chip' }, icon),
      Util.el('div', { class: 'label' }, label),
      Util.el('div', { class: 'chev' }, '›'),
    ]));
  }
  container.appendChild(wheelGrid);
}

window.renderLabWork = renderLabWork;
