async function buildActivitySelect() {
  const rows = await DB.sortedByField('workActivity', 'activity', 'asc');
  const sel = Util.el('select', { class: 'input' });
  for (const r of rows) sel.appendChild(Util.el('option', { value: r.activity }, r.activity));
  return sel;
}

async function buildAdditiveSelect() {
  const rows = await DB.sortedByField('additive', 'additive', 'asc');
  const sel = Util.el('select', { class: 'input' });
  for (const r of rows) sel.appendChild(Util.el('option', { value: r.additive, 'data-unit': r.unitMeasure }, r.additive));
  return { sel, rows };
}

async function buildTankSelect(includeNew) {
  const rows = await DB.sortedByField('tank', 'tank', 'asc');
  const sel = Util.el('select', { class: 'input' });
  if (includeNew) sel.appendChild(Util.el('option', { value: 'New' }, 'New'));
  for (const r of rows) sel.appendChild(Util.el('option', { value: r.tank }, r.tank));
  return sel;
}

async function renderWorkOrderForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Update Work Order' : 'Work Orders', '#/'));

  const dateCode = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  const activitySelect = await buildActivitySelect();
  const { sel: additiveSelect, rows: additives } = await buildAdditiveSelect();
  const unitLabel = Util.el('span', { class: 'hint' }, '');
  const amount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const fromVarietal = await Util.buildVarietalSelect();
  const fromVintage = Util.buildVintageSelect();
  const fromTank = await buildTankSelect(true);
  const toVarietal = await Util.buildVarietalSelect();
  const toVintage = Util.buildVintageSelect();
  const toTank = await buildTankSelect(false);
  const beforeAmount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const afterAmount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const notes = Util.el('textarea', { class: 'input', rows: 2 });

  function updateUnit() {
    const a = additives.find((a) => a.additive === additiveSelect.value);
    unitLabel.textContent = a ? `Unit: ${a.unitMeasure || 'n/a'}` : '';
  }
  additiveSelect.addEventListener('change', updateUnit);
  updateUnit();

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Work Order'),
    Util.el('div', { class: 'row' }, [Util.field('Date', dateCode), Util.field('Activity', activitySelect)]),
    Util.el('div', { class: 'row' }, [Util.field('Additive', additiveSelect), Util.field('Amount', amount, unitLabel.textContent)]),
  ]));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'From'),
    Util.el('div', { class: 'row' }, [Util.field('From Varietal', fromVarietal), Util.field('From Vintage', fromVintage), Util.field('From Tank', fromTank)]),
  ]));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'To'),
    Util.el('div', { class: 'row' }, [Util.field('To Varietal', toVarietal), Util.field('To Vintage', toVintage), Util.field('To Tank', toTank)]),
  ]));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Tank Amounts'),
    Util.el('div', { class: 'row' }, [Util.field('Before Amount (Gal)', beforeAmount), Util.field('After Amount (Gal)', afterAmount)]),
    Util.field('Notes', notes),
  ]));

  if (editId) {
    const row = await DB.get('workOrder', editId);
    if (row) {
      dateCode.value = row.eventDate || ''; activitySelect.value = row.activity || '';
      additiveSelect.value = row.additive || ''; amount.value = row.amount || '';
      fromVarietal.value = row.fromVarietal || ''; fromVintage.value = row.fromVintage || '';
      fromTank.value = row.fromTank || ''; toVarietal.value = row.toVarietal || ''; toVintage.value = row.toVintage || '';
      toTank.value = row.toTank || ''; beforeAmount.value = row.beforeAmount || ''; afterAmount.value = row.afterAmount || '';
      notes.value = row.notes || ''; updateUnit();
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update Work Order' : 'Add Work Order');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const record = {
      eventDate: dateCode.value || Util.todayISO(), activity: activitySelect.value, additive: additiveSelect.value,
      amount: amount.value, fromVarietal: fromVarietal.value, fromVintage: Number(fromVintage.value),
      fromTank: fromTank.value, toVarietal: toVarietal.value, toVintage: Number(toVintage.value),
      toTank: toTank.value, beforeAmount: beforeAmount.value, afterAmount: afterAmount.value,
      notes: notes.value, updateServer: 'true',
    };
    if (editId) { record.id = Number(editId); await DB.put('workOrder', record); }
    else await DB.add('workOrder', record);
    Util.toast(`Work Order recorded for ${dateCode.value} — From ${record.fromVarietal}`);
    Util.navigate('#/work-order-results');
  });
}

async function renderWorkOrderResults(container) {
  container.appendChild(Util.pageHeader('Work Order Results', '#/', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/work-order') }, '+ New'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getAllWorkOrders();
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No work orders yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '🛠️'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.fromVarietal || '')}&vintage=${r.fromVintage || ''}`) }, [
          Util.el('div', { class: 'title' }, `${r.activity || ''} · ${Util.toUSDate(r.eventDate)}`),
          Util.el('div', { class: 'meta' }, `${r.fromVarietal || '–'} ${r.fromVintage || ''} → ${r.toVarietal || '–'} ${r.toVintage || ''} · Tank ${r.fromTank || '–'} → ${r.toTank || '–'} · ${r.additive || ''} ${r.amount || ''}`),
          Util.el('div', { class: 'meta' }, `Before ${r.beforeAmount || '–'} gal · After ${r.afterAmount || '–'} gal`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/work-order?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this work order?'))) return;
            await DB.delete('workOrder', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

window.renderWorkOrderForm = renderWorkOrderForm;
window.renderWorkOrderResults = renderWorkOrderResults;
