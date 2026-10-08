async function renderTankCapacityList(container, query) {
  const tank = query.tank || '';
  const heightIn = query.heightIn || '';
  const heightCm = query.heightCm || '';
  container.appendChild(Util.pageHeader(`Tank ${tank} — Capacity Graduation`, '#/admin/tank', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate(`#/admin/tank/capacity/add?tank=${encodeURIComponent(tank)}&heightIn=${heightIn}&heightCm=${heightCm}`) }, '+ Add'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.byIndex('tankCapacity', 'tank', tank);
    rows.sort((a, b) => Util.parseNum(b.inchesFromTop) - Util.parseNum(a.inchesFromTop));
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No graduation rows yet for this tank.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '📏'),
        Util.el('div', { class: 'main' }, [
          Util.el('div', { class: 'title' }, `${r.inchesFromTop} in from top → ${r.gallonAmount} gal`),
          Util.el('div', { class: 'meta' }, `${r.inchesFromBottom || '–'} in from bottom · ${r.cmFromTop || '–'} cm top / ${r.cmFromBottom || '–'} cm bottom · ${r.literAmount || '–'} L`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/admin/tank/capacity/add?tank=${encodeURIComponent(tank)}&heightIn=${heightIn}&heightCm=${heightCm}&id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this graduation row?'))) return;
            await DB.delete('tankCapacity', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();

  // Copy-from-tank bulk feature
  const otherTanks = (await DB.sortedByField('tank', 'tank', 'asc')).filter((t) => t.tank !== tank);
  const sourceSelect = Util.el('select', { class: 'input' }, otherTanks.map((t) => Util.el('option', { value: t.tank }, `Tank ${t.tank}`)));
  const copyBtn = Util.el('button', { class: 'btn secondary' }, 'Copy');
  copyBtn.addEventListener('click', async () => {
    if (!sourceSelect.value) return;
    const count = await DB.copyTankCapacitiesFromTank(sourceSelect.value, tank);
    Util.toast(`Copied ${count} rows from Tank ${sourceSelect.value}.`);
    refresh();
  });
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Copy All From Tank'),
    Util.el('div', { class: 'row' }, [Util.field('Source Tank', sourceSelect), Util.el('div', { class: 'field' }, [Util.el('label', {}, ' '), copyBtn])]),
  ]));
}

async function renderTankCapacityForm(container, query) {
  const tank = query.tank || '';
  const heightInTotal = Util.parseNum(query.heightIn) ?? 0;
  const heightCmTotal = Util.parseNum(query.heightCm) ?? 0;
  const editId = query.id;

  container.appendChild(Util.pageHeader(editId ? 'Edit Graduation Row' : 'Add Graduation Row', `#/admin/tank/capacity?tank=${encodeURIComponent(tank)}&heightIn=${query.heightIn || ''}&heightCm=${query.heightCm || ''}`));

  const tankLabel = Util.el('div', { class: 'input', style: 'background:#f2ead9;' }, `Tank ${tank}`);
  const gallonAmount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const literAmount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const inchesFromTop = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const inchesFromBottom = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const cmFromTop = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const cmFromBottom = Util.el('input', { class: 'input', type: 'number', step: 'any' });

  gallonAmount.addEventListener('blur', () => { const v = Util.parseNum(gallonAmount.value); if (v !== null) literAmount.value = Calc.calcGallonToLiter(v).toFixed(1); });
  literAmount.addEventListener('blur', () => { const v = Util.parseNum(literAmount.value); if (v !== null) gallonAmount.value = Calc.calcLiterToGallon(v).toFixed(1); });
  inchesFromTop.addEventListener('blur', () => {
    const v = Util.parseNum(inchesFromTop.value); if (v === null) return;
    cmFromTop.value = Calc.calcInchesToCm(v).toFixed(1);
    inchesFromBottom.value = (heightInTotal - v).toFixed(1);
    cmFromBottom.value = (heightCmTotal - Util.parseNum(cmFromTop.value)).toFixed(1);
  });
  inchesFromBottom.addEventListener('blur', () => {
    const v = Util.parseNum(inchesFromBottom.value); if (v === null) return;
    cmFromBottom.value = Calc.calcInchesToCm(v).toFixed(1);
    inchesFromTop.value = (heightInTotal - v).toFixed(1);
    cmFromTop.value = (heightCmTotal - Util.parseNum(cmFromBottom.value)).toFixed(1);
  });
  cmFromTop.addEventListener('blur', () => {
    const v = Util.parseNum(cmFromTop.value); if (v === null) return;
    inchesFromTop.value = Calc.calcCmToInches(v).toFixed(1);
    cmFromBottom.value = (heightCmTotal - v).toFixed(1);
    inchesFromBottom.value = (heightInTotal - Util.parseNum(inchesFromTop.value)).toFixed(1);
  });
  cmFromBottom.addEventListener('blur', () => {
    const v = Util.parseNum(cmFromBottom.value); if (v === null) return;
    inchesFromBottom.value = Calc.calcCmToInches(v).toFixed(1);
    cmFromTop.value = (heightCmTotal - v).toFixed(1);
    inchesFromTop.value = (heightInTotal - Util.parseNum(inchesFromBottom.value)).toFixed(1);
  });

  container.appendChild(Util.card([
    Util.field('Tank', tankLabel),
    Util.el('div', { class: 'row' }, [Util.field('Gallons', gallonAmount), Util.field('Liters', literAmount)]),
    Util.el('div', { class: 'row' }, [Util.field('Inches From Top', inchesFromTop), Util.field('Inches From Bottom', inchesFromBottom)]),
    Util.el('div', { class: 'row' }, [Util.field('cm From Top', cmFromTop), Util.field('cm From Bottom', cmFromBottom)]),
  ]));

  if (editId) {
    const row = await DB.get('tankCapacity', editId);
    if (row) {
      gallonAmount.value = row.gallonAmount || ''; literAmount.value = row.literAmount || '';
      inchesFromTop.value = row.inchesFromTop || ''; inchesFromBottom.value = row.inchesFromBottom || '';
      cmFromTop.value = row.cmFromTop || ''; cmFromBottom.value = row.cmFromBottom || '';
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update' : 'Add');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  const backHash = `#/admin/tank/capacity?tank=${encodeURIComponent(tank)}&heightIn=${query.heightIn || ''}&heightCm=${query.heightCm || ''}`;
  saveBtn.addEventListener('click', async () => {
    if (!gallonAmount.value.trim()) { Util.toast('Gallon amount can not be empty.'); return; }
    const record = {
      tank, gallonAmount: gallonAmount.value, literAmount: literAmount.value,
      inchesFromTop: inchesFromTop.value, inchesFromBottom: inchesFromBottom.value,
      cmFromTop: cmFromTop.value, cmFromBottom: cmFromBottom.value, updateServer: 'true',
    };
    if (editId) { record.id = Number(editId); await DB.put('tankCapacity', record); }
    else await DB.add('tankCapacity', record);
    Util.toast('Graduation row saved.');
    Util.navigate(backHash);
  });
}

window.renderTankCapacityList = renderTankCapacityList;
window.renderTankCapacityForm = renderTankCapacityForm;
