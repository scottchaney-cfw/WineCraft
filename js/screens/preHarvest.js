async function renderPreHarvestForm(container, editId) {
  container.appendChild(Util.pageHeader(editId ? 'Update Pre-Harvest Log' : 'Pre-Harvest Date Entry', '#/'));

  const block = Util.el('input', { class: 'input', type: 'number' });
  const vintageSelect = Util.buildVintageSelect();
  const varietalSelect = await Util.buildVarietalSelect();
  const budBreak = Util.el('input', { class: 'input', type: 'date' });
  const flowerSet = Util.el('input', { class: 'input', type: 'date' });
  const fruitSet = Util.el('input', { class: 'input', type: 'date' });
  const varaison = Util.el('input', { class: 'input', type: 'date' });
  const harvest = Util.el('input', { class: 'input', type: 'date' });
  const notes = Util.el('textarea', { class: 'input', rows: 2 });

  container.appendChild(Util.card([
    Util.el('div', { class: 'row' }, [Util.field('Block', block), Util.field('Vintage', vintageSelect), Util.field('Varietal', varietalSelect)]),
    Util.el('div', { class: 'row' }, [Util.field('Bud Break Date', budBreak), Util.field('Flower Set Date', flowerSet)]),
    Util.el('div', { class: 'row' }, [Util.field('Fruit Set Date', fruitSet), Util.field('Varaison Date', varaison)]),
    Util.field('Harvest Date', harvest),
    Util.field('Notes', notes),
  ]));

  if (editId) {
    const row = await DB.get('preHarvest', editId);
    if (row) {
      block.value = row.block || ''; vintageSelect.value = row.vintage; varietalSelect.value = row.varietal;
      budBreak.value = row.budBreak || ''; flowerSet.value = row.flowerSet || ''; fruitSet.value = row.fruitSet || '';
      varaison.value = row.varaison || ''; harvest.value = row.harvest || ''; notes.value = row.notes || '';
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editId ? 'Update Pre-Harvest Log' : 'Add Pre-Harvest Log');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const vintage = Number(vintageSelect.value);
    const varietal = varietalSelect.value;
    const record = {
      block: block.value, vintage, varietal,
      budBreak: budBreak.value, flowerSet: flowerSet.value, fruitSet: fruitSet.value,
      varaison: varaison.value, harvest: harvest.value, notes: notes.value, updateServer: 'true',
    };
    if (editId) {
      record.id = Number(editId);
      await DB.put('preHarvest', record);
    } else {
      // Upsert-by-(vintage,varietal) — matches original app's PreHarvestLog save semantics.
      const rows = await DB.all('preHarvest');
      const existing = rows.find((r) => Number(r.vintage) === vintage && r.varietal === varietal);
      if (existing) { record.id = existing.id; await DB.put('preHarvest', record); }
      else await DB.add('preHarvest', record);
    }
    Util.toast(`Pre-harvest log recorded for ${varietal} ${vintage}`);
    Util.navigate('#/pre-harvest-results');
  });
}

async function renderPreHarvestResults(container) {
  container.appendChild(Util.pageHeader('Pre-Harvest Date Results', '#/', [
    Util.el('button', { class: 'btn small', onclick: () => Util.navigate('#/pre-harvest-log') }, '+ New'),
  ]));

  const listHost = Util.el('div');
  container.appendChild(listHost);

  async function refresh() {
    listHost.innerHTML = '';
    const rows = await DB.getAllPreHarvests();
    if (!rows.length) { listHost.appendChild(Util.el('div', { class: 'empty-state' }, 'No pre-harvest dates yet.')); return; }
    for (const r of rows) {
      listHost.appendChild(Util.el('div', { class: 'list-row' }, [
        Util.el('div', { class: 'icon' }, '🌱'),
        Util.el('div', { class: 'main', onclick: () => Util.navigate(`#/wine-summary?varietal=${encodeURIComponent(r.varietal)}&vintage=${r.vintage}`) }, [
          Util.el('div', { class: 'title' }, `${r.varietal} ${r.vintage} · Block ${r.block || '–'}`),
          Util.el('div', { class: 'meta' }, `Bud Break ${Util.toUSDate(r.budBreak) || '–'} · Flower ${Util.toUSDate(r.flowerSet) || '–'} · Fruit Set ${Util.toUSDate(r.fruitSet) || '–'} · Varaison ${Util.toUSDate(r.varaison) || '–'} · Harvest ${Util.toUSDate(r.harvest) || '–'}`),
        ]),
        Util.el('div', { class: 'row-actions' }, [
          Util.el('button', { class: 'btn-icon', onclick: () => Util.navigate(`#/pre-harvest-log?id=${r.id}`) }, '✎'),
          Util.el('button', { class: 'btn-icon', onclick: async () => {
            if (!(await Util.confirmDialog('Delete this pre-harvest entry?'))) return;
            await DB.delete('preHarvest', r.id);
            Util.toast('Deleted.');
            refresh();
          } }, '🗑'),
        ]),
      ]));
    }
  }
  await refresh();
}

window.renderPreHarvestForm = renderPreHarvestForm;
window.renderPreHarvestResults = renderPreHarvestResults;
