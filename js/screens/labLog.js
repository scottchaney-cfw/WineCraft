const TEST_ICONS = { TA: '🍋', pH: '⚗️', FSO: '🌬️', TSO: '🌫️', VA: '🍶', RS: '🍯', '% Alc': '🥃', YAN: '🌱', Brix: '🍇', Temp: '🌡️' };

async function renderLabLogResults(container) {
  container.appendChild(Util.pageHeader('Lab Log', '#/'));

  const years = ['All', ...Util.yearOptions()];
  const yearSelect = Util.el('select', { class: 'input' }, years.map((y) => Util.el('option', { value: y === 'All' ? '' : y }, String(y))));
  const addBtn = Util.el('button', { class: 'btn', onclick: () => Util.navigate('#/lab-work') }, '+ New Test');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [
    Util.field('Filter by Vintage', yearSelect),
    Util.el('div', { class: 'spacer' }),
    addBtn,
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getLabLogResults(yearSelect.value || null);
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No lab results yet.')); return; }
    for (const r of rows) {
      const row = Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, TEST_ICONS[r.testType] || '🧪'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`) }, [
          Util.el('div', { class: 'title' }, `${r.varietal} ${r.vintage}`),
          Util.el('div', { class: 'meta' }, `${r.testType} · ${Util.toUSDate(r.eventDate)}${r.notes ? ' · ' + r.notes : ''}`),
        ]),
        Util.el('div', { class: 'value-col' }, [
          Util.el('div', { class: 'big' }, Util.fmt(r.result, 2)),
          Util.el('div', {}, r.unitMeasure || ''),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', title: 'Edit', onclick: () => {
            const key = TEST_TYPE_TO_KEY[r.testType] || 'ta';
            Util.navigate(`#/lab/${key}?id=${r.eventId}`);
          } }, '✎'),
          Util.el('button', { class: 'btn-icon', title: 'Delete', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this lab result?'))) return;
            await DB.delete('labEvent', r.eventId);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]);
      listHost.appendChild(row);
    }
  }

  yearSelect.addEventListener('change', refresh);
  await refresh();
}

window.renderLabLogResults = renderLabLogResults;
