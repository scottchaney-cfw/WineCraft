async function renderWineList(container) {
  container.appendChild(Util.pageHeader('Wines', '#/'));

  const rows = await DB.getAllActualLabLogs();
  if (!rows.length) { container.appendChild(Util.el('div', { class: 'empty-state' }, 'No wines logged yet. Add a lab result, crush log, or work order to create one.')); return; }

  for (const r of rows) {
    container.appendChild(Util.el('div', {
      class: 'list-row', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`),
    }, [
      Util.el('div', { class: 'icon' }, '🍷'),
      Util.el('div', { class: 'main' }, [
        Util.el('div', { class: 'title' }, `${r.varietal}`),
        Util.el('div', { class: 'meta' }, `Vintage ${r.vintage}`),
      ]),
      Util.el('div', { class: 'chev' }, '›'),
    ]));
  }
}

async function renderWineSummary(container, params, query) {
  const varietal = query.varietal || '';
  const vintage = Number(query.vintage || 0);
  container.appendChild(Util.pageHeader(`${varietal} ${vintage}`, '#/wine-list'));

  const [labResults, crush, preHarvestRows, measures, vineyardRows, workOrders] = await Promise.all([
    DB.getLabLogResults(vintage).then((r) => r.filter((x) => x.varietal === varietal)),
    DB.getAllCrushLogs().then((r) => r.filter((x) => x.varietal === varietal && Number(x.vintage) === vintage)),
    DB.getAllPreHarvests().then((r) => r.filter((x) => x.varietal === varietal && Number(x.vintage) === vintage)),
    DB.getAllPreHarvestMeasuresWithUnit().then((r) => r.filter((x) => x.varietal === varietal && Number(x.vintage) === vintage)),
    DB.getAllVineyardActivitiesWithUnit().then((r) => r.filter((x) => x.varietal === varietal && Number(x.vintage) === vintage)),
    DB.getAllWorkOrders().then((r) => r.filter((x) => x.fromVarietal === varietal && Number(x.fromVintage) === vintage)),
  ]);

  function section(title, rows, renderRow) {
    const card = Util.card([Util.el('h2', {}, `${title} (${rows.length})`)]);
    if (!rows.length) card.appendChild(Util.el('div', { class: 'hint' }, 'None recorded.'));
    else for (const r of rows) card.appendChild(renderRow(r));
    container.appendChild(card);
  }

  section('Lab Results', labResults, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, TEST_ICONS[r.testType] || '🧪'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, r.testType), Util.el('div', { class: 'meta' }, Util.toUSDate(r.eventDate))]),
    Util.el('div', { class: 'value-col' }, [Util.el('div', { class: 'big' }, Util.fmt(r.result, 2)), Util.el('div', {}, r.unitMeasure || '')]),
  ]));

  section('Crush Log', crush, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, '🍇'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, `${Util.toUSDate(r.startDate)} – ${Util.toUSDate(r.endDate)}`), Util.el('div', { class: 'meta' }, `Tons ${r.tons || '–'} · Brix ${r.brix || '–'} · Gal ${r.gallons || '–'}`)]),
  ]));

  section('Pre-Harvest Dates', preHarvestRows, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, '🌱'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, `Block ${r.block || '–'}`), Util.el('div', { class: 'meta' }, `Harvest ${Util.toUSDate(r.harvest) || '–'}`)]),
  ]));

  section('Pre-Harvest Tests', measures, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, TEST_ICONS[r.testType] || '🧪'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, r.testType), Util.el('div', { class: 'meta' }, Util.toUSDate(r.eventDate))]),
    Util.el('div', { class: 'value-col' }, [Util.el('div', { class: 'big' }, Util.fmt(r.result, 2)), Util.el('div', {}, r.unitMeasure || '')]),
  ]));

  section('Vineyard Activity', vineyardRows, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, '🍃'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, r.activity), Util.el('div', { class: 'meta' }, `${Util.toUSDate(r.eventDate)} · ${r.amount || ''} ${r.unitMeasure || ''}`)]),
  ]));

  section('Work Orders', workOrders, (r) => Util.el('div', { class: 'list-row' }, [
    Util.el('div', { class: 'icon' }, '🛠️'),
    Util.el('div', { class: 'main' }, [Util.el('div', { class: 'title' }, `${r.activity || ''} · ${Util.toUSDate(r.eventDate)}`), Util.el('div', { class: 'meta' }, `Tank ${r.fromTank || '–'} → ${r.toTank || '–'}`)]),
  ]));
}

window.renderWineList = renderWineList;
window.renderWineSummary = renderWineSummary;
