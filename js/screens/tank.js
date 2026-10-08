async function renderTankAdmin(container) {
  container.appendChild(Util.pageHeader('Tanks', '#/admin', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/admin/tank/add') }, '+ Add'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.sortedByField('tank', 'tank', 'asc');
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No tanks yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '🛢️'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/admin/tank/capacity?tank=${encodeURIComponent(r.tank)}&heightIn=${r.heightInches || ''}&heightCm=${r.heightCm || ''}`) }, [
          Util.el('div', { class: 'title' }, `Tank ${r.tank}`),
          Util.el('div', { class: 'meta' }, `Capacity ${r.capacity || '–'} gal · Height ${r.heightInches || '–'} in / ${r.heightCm || '–'} cm · Simple calc: ${r.simpleCalc || 'false'}`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn small secondary', onclick: () => Util.navigate(`#/admin/tank/capacity?tank=${encodeURIComponent(r.tank)}&heightIn=${r.heightInches || ''}&heightCm=${r.heightCm || ''}`) }, 'Graduation'),
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/admin/tank/add?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog(`Delete Tank ${r.tank}? This also deletes its capacity graduation table.`))) return;
            await DB.deleteTankCascade(r.id, r.tank);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

async function renderTankForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Edit Tank' : 'Add Tank', '#/admin/tank'));

  const tank = Util.el('input', { class: 'input', type: 'text' });
  const capacity = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const heightInches = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const heightCm = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const simpleCalc = Util.el('select', { class: 'input' }, [
    Util.el('option', { value: 'true' }, 'true'), Util.el('option', { value: 'false' }, 'false'),
  ]);
  heightInches.addEventListener('blur', () => {
    const v = Util.parseNum(heightInches.value);
    if (v !== null) heightCm.value = Calc.calcInchesToCm(v).toFixed(1);
  });
  heightCm.addEventListener('blur', () => {
    const v = Util.parseNum(heightCm.value);
    if (v !== null) heightInches.value = Calc.calcCmToInches(v).toFixed(1);
  });

  container.appendChild(Util.card([
    Util.field('Tank', tank),
    Util.el('div', { class: 'row' }, [Util.field('Capacity (Gallons)', capacity), Util.field('Simple Calculation', simpleCalc)]),
    Util.el('div', { class: 'row' }, [Util.field('Height (Inches)', heightInches), Util.field('Height (cm)', heightCm)]),
  ]));

  if (editId) {
    const row = await DB.get('tank', editId);
    if (row) {
      tank.value = row.tank || ''; capacity.value = row.capacity || '';
      heightInches.value = row.heightInches || ''; heightCm.value = row.heightCm || '';
      simpleCalc.value = row.simpleCalc || 'true';
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update' : 'Add');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    if (!tank.value.trim()) { Util.toast('Tank name can not be empty.'); return; }
    const record = { tank: tank.value, capacity: capacity.value, heightInches: heightInches.value, heightCm: heightCm.value, simpleCalc: simpleCalc.value, updateServer: 'true' };
    if (editId) { record.id = Number(editId); await DB.put('tank', record); }
    else await DB.add('tank', record);
    Util.toast('Tank saved.');
    Util.navigate('#/admin/tank');
  });
}

window.renderTankAdmin = renderTankAdmin;
window.renderTankForm = renderTankForm;
