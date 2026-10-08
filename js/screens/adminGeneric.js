// Generic list + add/edit engine for the simple single-table lookup admin screens
// (Additives, Work Activities, Varietals, Yeasts, Nutrients, Test Types, Vineyard Activities).
const ADMIN_TABLES = {
  additive: {
    label: 'Additives', icon: '💧', store: 'additive', sortField: 'additive',
    fields: [
      { key: 'additive', label: 'Additive', type: 'text', required: true },
      { key: 'unitMeasure', label: 'Unit', type: 'text' },
      { key: 'dosage', label: 'Dosage Unit', type: 'select', options: ['mg/L', 'g/L', 'g/hL', 'kg/L'] },
      { key: 'dosageRange', label: 'Recommended Dosage', type: 'text' },
    ],
    display: (r) => ({ title: r.additive, meta: `${r.unitMeasure ? '(' + r.unitMeasure + ')' : ''} Rec. Dosage: ${r.dosageRange || ''} ${r.dosage || ''}` }),
  },
  workActivity: {
    label: 'Work Activities', icon: '🛠️', store: 'workActivity', sortField: 'activity',
    fields: [
      { key: 'activity', label: 'Activity', type: 'text', required: true },
      { key: 'additive', label: 'Default Additive', type: 'text' },
    ],
    display: (r) => ({ title: r.activity, meta: r.additive || '' }),
  },
  varietal: {
    label: 'Varietals', icon: '🍇', store: 'labLog', sortField: 'varietal',
    fields: [{ key: 'varietal', label: 'Varietal', type: 'text', required: true }],
    display: (r) => ({ title: r.varietal, meta: '' }),
    filter: (r) => Number(r.vintage) === 0,
    extraOnCreate: { vintage: 0, source: null },
  },
  yeast: {
    label: 'Yeasts', icon: '🦠', store: 'yeast', sortField: 'company',
    fields: [
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'strain', label: 'Strain', type: 'text', required: true },
      { key: 'yanRequired', label: 'YAN Required (mg N/L)', type: 'text' },
    ],
    display: (r) => ({ title: `${r.company} ${r.strain}`, meta: `YAN required: ${r.yanRequired || '–'}` }),
  },
  nutrient: {
    label: 'Nutrients', icon: '🌾', store: 'nutrient', sortField: 'nutrient',
    fields: [
      { key: 'nutrient', label: 'Nutrient', type: 'text', required: true },
      { key: 'ppm', label: 'YAN Provided per g/L (ppm)', type: 'text' },
    ],
    display: (r) => ({ title: r.nutrient, meta: `${r.ppm || '–'} ppm N per g/L` }),
  },
  testTypeLookup: {
    label: 'Test Types', icon: '🧪', store: 'testTypeLookup', sortField: 'testType',
    fields: [
      { key: 'testType', label: 'Test Type', type: 'text', required: true },
      { key: 'unitMeasure', label: 'Unit of Measure', type: 'text' },
    ],
    display: (r) => ({ title: r.testType, meta: r.unitMeasure || '' }),
  },
  vineyardActivityLookup: {
    label: 'Vineyard Activities', icon: '🍃', store: 'vineyardActivityLookup', sortField: 'activity',
    fields: [
      { key: 'activity', label: 'Activity', type: 'text', required: true },
      { key: 'unitMeasure', label: 'Unit', type: 'text' },
    ],
    display: (r) => ({ title: r.activity, meta: r.unitMeasure || '' }),
  },
};

async function renderAdminHub(container) {
  container.appendChild(Util.pageHeader('Database Admin Tables', '#/settings'));
  const grid = Util.el('div', { class: 'menu-grid' });
  for (const [key, cfg] of Object.entries(ADMIN_TABLES)) {
    grid.appendChild(Util.el('div', { class: 'menu-card', onclick: () => Util.navigate(`#/admin/${key}`) }, [
      Util.el('div', { class: 'chip' }, cfg.icon),
      Util.el('div', { class: 'label' }, cfg.label),
      Util.el('div', { class: 'chev' }, '›'),
    ]));
  }
  grid.appendChild(Util.el('div', { class: 'menu-card', onclick: () => Util.navigate('#/admin/tank') }, [
    Util.el('div', { class: 'chip' }, '🛢️'),
    Util.el('div', { class: 'label' }, 'Tanks'),
    Util.el('div', { class: 'chev' }, '›'),
  ]));
  container.appendChild(grid);
}

async function renderAdminList(container, tableKey) {
  const cfg = ADMIN_TABLES[tableKey];
  if (!cfg) { container.appendChild(Util.el('div', { class: 'card' }, 'Unknown table.')); return; }

  container.appendChild(Util.pageHeader(cfg.label, '#/admin', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate(`#/admin/${tableKey}/add`) }, '+ Add'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    let rows = await DB.sortedByField(cfg.store, cfg.sortField, 'asc');
    if (cfg.filter) rows = rows.filter(cfg.filter);
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, `No ${cfg.label.toLowerCase()} yet.`)); return; }
    for (const r of rows) {
      const d = cfg.display(r);
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, cfg.icon),
        Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, d.title), Util.el('div', { class: 'meta' }, d.meta)]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/admin/${tableKey}/add?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog(`Delete "${d.title}"?`))) return;
            await DB.delete(cfg.store, r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

async function renderAdminForm(container, tableKey, editId) {
  const cfg = ADMIN_TABLES[tableKey];
  if (!cfg) { container.appendChild(Util.el('div', { class: 'card' }, 'Unknown table.')); return; }

  container.appendChild(Util.pageHeader(editId ? `Edit ${cfg.label.replace(/s$/, '')}` : `Add ${cfg.label.replace(/s$/, '')}`, `#/admin/${tableKey}`));

  const inputs = {};
  const card = Util.card(cfg.fields.map((f) => {
    let input;
    if (f.type === 'select') {
      input = Util.el('select', { class: 'input' }, f.options.map((o) => Util.el('option', { value: o }, o)));
    } else {
      input = Util.el('input', { class: 'input', type: 'text' });
    }
    inputs[f.key] = input;
    return Util.field(f.label, input);
  }));
  container.appendChild(card);

  if (editId) {
    const row = await DB.get(cfg.store, editId);
    if (row) for (const f of cfg.fields) inputs[f.key].value = row[f.key] || '';
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update' : 'Add');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    for (const f of cfg.fields) {
      if (f.required && !inputs[f.key].value.trim()) {
        Util.toast(`${f.label} can not be empty.`);
        return;
      }
    }
    const record = { updateServer: 'true' };
    for (const f of cfg.fields) record[f.key] = inputs[f.key].value;
    if (editId) {
      const existing = await DB.get(cfg.store, editId);
      record.id = Number(editId);
      if (cfg.filter) Object.assign(record, Object.fromEntries(Object.keys(existing).filter((k) => !(k in record)).map((k) => [k, existing[k]])));
      await DB.put(cfg.store, record);
    } else {
      if (cfg.extraOnCreate) Object.assign(record, cfg.extraOnCreate);
      await DB.add(cfg.store, record);
    }
    Util.toast(`${cfg.label.replace(/s$/, '')} saved.`);
    Util.navigate(`#/admin/${tableKey}`);
  });
}

window.ADMIN_TABLES = ADMIN_TABLES;
window.renderAdminHub = renderAdminHub;
window.renderAdminList = renderAdminList;
window.renderAdminForm = renderAdminForm;
