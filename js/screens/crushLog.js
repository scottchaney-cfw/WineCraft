async function renderCrushLogForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Update Crush Item' : 'Crush Log Entry', '#/'));

  const vintageSelect = Util.buildVintageSelect();
  const varietalSelect = await Util.buildVarietalSelect();
  const startDate = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  const endDate = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  startDate.addEventListener('change', () => { if (!endDate.dataset.touched) endDate.value = startDate.value; });
  endDate.addEventListener('change', () => { endDate.dataset.touched = '1'; });
  const tons = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const brix = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const gallons = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const yan = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const notes = Util.el('textarea', { class: 'input', rows: 2 });

  container.appendChild(Util.card([
    Util.el('div', { class: 'row' }, [Util.field('Vintage', vintageSelect), Util.field('Varietal', varietalSelect)]),
    Util.el('div', { class: 'row' }, [Util.field('Start Date', startDate), Util.field('End Date', endDate)]),
    Util.el('div', { class: 'row' }, [Util.field('Tons', tons), Util.field('Brix', brix)]),
    Util.el('div', { class: 'row' }, [Util.field('Gallons', gallons), Util.field('YAN (mg N/L)', yan)]),
    Util.field('Notes', notes),
  ]));

  if (editId) {
    const row = await DB.get('crushLog', editId);
    if (row) {
      vintageSelect.value = row.vintage; varietalSelect.value = row.varietal;
      startDate.value = row.startDate || ''; endDate.value = row.endDate || ''; endDate.dataset.touched = '1';
      tons.value = row.tons || ''; brix.value = row.brix || ''; gallons.value = row.gallons || ''; yan.value = row.yan || '';
      notes.value = row.notes || '';
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update Crush Item' : 'Add Crush Item');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const record = {
      vintage: Number(vintageSelect.value), varietal: varietalSelect.value,
      startDate: startDate.value, endDate: endDate.value,
      tons: tons.value, brix: brix.value, gallons: gallons.value, yan: yan.value,
      notes: notes.value, updateServer: 'true',
    };
    if (editId) { record.id = Number(editId); await DB.put('crushLog', record); }
    else await DB.add('crushLog', record);
    Util.toast(`Crush log recorded for ${record.varietal} ${record.vintage}`);
    Util.navigate('#/crush-log-results');
  });
}

async function renderCrushLogResults(container) {
  container.appendChild(Util.pageHeader('Crush Log Results', '#/', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/crush-log') }, '+ New'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getAllCrushLogs();
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No crush log entries yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '🍇'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`) }, [
          Util.el('div', { class: 'title' }, `${r.varietal} ${r.vintage}`),
          Util.el('div', { class: 'meta' }, `${Util.toUSDate(r.startDate)} – ${Util.toUSDate(r.endDate)} · Tons ${r.tons || '–'} · Brix ${r.brix || '–'} · Gal ${r.gallons || '–'} · YAN ${r.yan || '–'}`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/crush-log?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this crush log entry?'))) return;
            await DB.delete('crushLog', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

window.renderCrushLogForm = renderCrushLogForm;
window.renderCrushLogResults = renderCrushLogResults;
