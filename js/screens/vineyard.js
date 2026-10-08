async function buildVineyardActivitySelect(selected) {
  const rows = await DB.sortedByField('vineyardActivityLookup', 'activity', 'asc');
  const sel = Util.el('select', { class: 'input' });
  for (const r of rows) {
    const opt = Util.el('option', { value: r.activity }, r.activity);
    if (r.activity === selected) opt.selected = true;
    sel.appendChild(opt);
  }
  return { sel, rows };
}

async function renderVineyardActivityForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Update Vineyard Activity' : 'Vineyard Activity', '#/'));

  const eventDate = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  const block = Util.el('input', { class: 'input', type: 'number' });
  const vintageSelect = Util.buildVintageSelect();
  const varietalSelect = await Util.buildVarietalSelect();
  const { sel: activitySelect, rows: activities } = await buildVineyardActivitySelect();
  const unitLabel = Util.el('span', { class: 'hint' }, '');
  const amount = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const notes = Util.el('textarea', { class: 'input', rows: 2 });

  function updateUnit() {
    const a = activities.find((a) => a.activity === activitySelect.value);
    unitLabel.textContent = a ? `Unit: ${a.unitMeasure || 'n/a'}` : '';
  }
  activitySelect.addEventListener('change', updateUnit);
  updateUnit();

  container.appendChild(Util.card([
    Util.el('div', { class: 'row' }, [Util.field('Event Date', eventDate), Util.field('Block', block)]),
    Util.el('div', { class: 'row' }, [Util.field('Vintage', vintageSelect), Util.field('Varietal', varietalSelect)]),
    Util.el('div', { class: 'row' }, [Util.field('Activity', activitySelect), Util.field('Amount', amount, unitLabel.textContent)]),
    Util.field('Notes', notes),
  ]));

  if (editId) {
    const row = await DB.get('vineyardActivity', editId);
    if (row) {
      eventDate.value = row.eventDate || ''; block.value = row.block || '';
      vintageSelect.value = row.vintage; varietalSelect.value = row.varietal;
      activitySelect.value = row.activity; amount.value = row.amount || ''; notes.value = row.notes || '';
      updateUnit();
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, 'Add Vineyard Activity');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const record = {
      eventDate: eventDate.value || Util.todayISO(), block: block.value,
      vintage: Number(vintageSelect.value), varietal: varietalSelect.value,
      activity: activitySelect.value, amount: amount.value, notes: notes.value, updateServer: 'true',
    };
    if (editId) { record.id = Number(editId); await DB.put('vineyardActivity', record); }
    else await DB.add('vineyardActivity', record);
    Util.toast(`Vineyard activity recorded for ${record.varietal} ${record.vintage}`);
    Util.navigate('#/vineyard-log');
  });
}

async function renderVineyardLog(container) {
  container.appendChild(Util.pageHeader('Vineyard Log', '#/', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/vineyard') }, '+ New'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getAllVineyardActivitiesWithUnit();
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No vineyard activity yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '🍃'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`) }, [
          Util.el('div', { class: 'title' }, `${r.varietal} ${r.vintage} · Block ${r.block || '–'}`),
          Util.el('div', { class: 'meta' }, `${r.activity} · ${Util.toUSDate(r.eventDate)} · ${r.amount || ''} ${r.unitMeasure || ''}`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/vineyard?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this vineyard activity entry?'))) return;
            await DB.delete('vineyardActivity', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

window.renderVineyardActivityForm = renderVineyardActivityForm;
window.renderVineyardLog = renderVineyardLog;
