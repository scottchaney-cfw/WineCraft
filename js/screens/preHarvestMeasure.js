async function buildTestTypeSelect(selected) {
  const types = await DB.sortedByField('testTypeLookup', 'testType', 'asc');
  const sel = Util.el('select', { class: 'input' });
  for (const t of types) {
    const opt = Util.el('option', { value: t.testType, 'data-unit': t.unitMeasure }, t.testType);
    if (t.testType === selected) opt.selected = true;
    sel.appendChild(opt);
  }
  return { sel, types };
}

async function renderPreHarvestMeasureForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Update Pre-Harvest Test' : 'Pre-Harvest Test Entry', '#/'));

  const eventDate = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  const block = Util.el('input', { class: 'input', type: 'number' });
  const vintageSelect = Util.buildVintageSelect();
  const varietalSelect = await Util.buildVarietalSelect();
  const { sel: testTypeSelect, types } = await buildTestTypeSelect();
  const unitLabel = Util.el('span', { class: 'hint' }, '');
  const result = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const notes = Util.el('textarea', { class: 'input', rows: 2 });

  function updateUnit() {
    const t = types.find((t) => t.testType === testTypeSelect.value);
    unitLabel.textContent = t ? `Unit: ${t.unitMeasure || 'n/a'}` : '';
  }
  testTypeSelect.addEventListener('change', updateUnit);
  updateUnit();

  container.appendChild(Util.card([
    Util.el('div', { class: 'row' }, [Util.field('Event Date', eventDate), Util.field('Block', block)]),
    Util.el('div', { class: 'row' }, [Util.field('Vintage', vintageSelect), Util.field('Varietal', varietalSelect)]),
    Util.el('div', { class: 'row' }, [Util.field('Test Type', testTypeSelect), Util.field('Result', result, unitLabel.textContent)]),
    unitLabel,
    Util.field('Notes', notes),
  ]));

  if (editId) {
    const row = await DB.get('preHarvestMeasure', editId);
    if (row) {
      eventDate.value = row.eventDate || ''; block.value = row.block || '';
      vintageSelect.value = row.vintage; varietalSelect.value = row.varietal;
      testTypeSelect.value = row.testType; result.value = row.result ?? ''; notes.value = row.notes || '';
      updateUnit();
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update Pre-Harvest Test' : 'Add Pre-Harvest Test');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const record = {
      eventDate: eventDate.value || Util.todayISO(), block: block.value,
      vintage: Number(vintageSelect.value), varietal: varietalSelect.value,
      testType: testTypeSelect.value, result: Util.parseNum(result.value),
      notes: notes.value, updateServer: 'true',
    };
    if (editId) { record.id = Number(editId); await DB.put('preHarvestMeasure', record); }
    else await DB.add('preHarvestMeasure', record);
    Util.toast(`Pre-harvest test recorded for ${record.varietal} ${record.vintage}`);
    Util.navigate('#/pre-harvest-measure-results');
  });
}

async function renderPreHarvestMeasureResults(container) {
  container.appendChild(Util.pageHeader('Pre-Harvest Test Results', '#/', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/pre-harvest-measure') }, '+ New'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getAllPreHarvestMeasuresWithUnit();
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No pre-harvest test results yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, TEST_ICONS[r.testType] || '🧪'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`) }, [
          Util.el('div', { class: 'title' }, `${r.varietal} ${r.vintage} · Block ${r.block || '–'}`),
          Util.el('div', { class: 'meta' }, `${r.testType} · ${Util.toUSDate(r.eventDate)}`),
        ]),
        Util.el('div', { class: 'value-col' }, [
          Util.el('div', { class: 'big' }, Util.fmt(r.result, 2)),
          Util.el('div', {}, r.unitMeasure || ''),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/pre-harvest-measure?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this pre-harvest test?'))) return;
            await DB.delete('preHarvestMeasure', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

window.renderPreHarvestMeasureForm = renderPreHarvestMeasureForm;
window.renderPreHarvestMeasureResults = renderPreHarvestMeasureResults;
