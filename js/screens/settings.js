async function renderSettings(container) {
  container.appendChild(Util.pageHeader('Settings', '#/'));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Database'),
    Util.el('div', { class: 'toolbar' }, [
      Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/admin') }, 'Database Admin Tables'),
      Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/database-stats') }, 'Database Stats'),
    ]),
    Util.el('div', { class: 'toolbar' }, [
      Util.el('button', { class: 'btn danger', onclick: async () => {
        if (!(await Util.confirmDialog('Do you really want to clear all tables? This deletes every record and resets to the default reference data.'))) return;
        await DB.clearAll();
        await seedIfEmpty();
        Util.toast('Database cleared.');
      } }, 'Clear Database'),
    ]),
  ]));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Backup'),
    Util.el('p', { class: 'hint' }, 'Since this app is fully offline, use Export to save a backup (choose "Save to Files" in the share sheet), and Import to restore it or move data from another device. Back up regularly.'),
    Util.el('div', { class: 'toolbar' }, [
      Util.el('button', { class: 'btn secondary', onclick: exportData }, 'Export Backup (JSON)'),
      Util.el('label', { class: 'btn secondary', style: 'cursor:pointer;' }, [
        'Import Backup (JSON)',
        Util.el('input', { type: 'file', accept: 'application/json,.json,text/plain', style: 'display:none', onchange: importData }),
      ]),
    ]),
  ]));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'About'),
    Util.el('p', {}, 'WineCraft — offline edition. All data is stored locally in this browser and never leaves this iPad unless you export a backup.'),
    Util.el('div', { class: 'toolbar' }, [
      Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/privacy') }, 'Privacy Policy'),
      Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/diagnostics') }, 'Diagnostics'),
    ]),
  ]));
}

async function exportData() {
  const dump = await DB.exportAll();
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `winecraft-backup-${stamp}.json`;
  const json = JSON.stringify(dump, null, 2);
  // On iPad, the share sheet lets you save to Files, AirDrop, or email the backup.
  try {
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'WineCraft backup' });
      Util.toast('Backup shared.');
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  Util.toast('Backup file downloaded.');
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  let dump;
  try { dump = JSON.parse(text); } catch { Util.toast('That file is not valid JSON.'); return; }
  const replace = await Util.confirmDialog('Replace ALL current data with this backup? Choose Cancel to merge (add/update) instead.');
  await DB.importAll(dump, replace ? 'replace' : 'merge');
  Util.toast('Backup imported.');
  e.target.value = '';
}

async function renderDatabaseStats(container) {
  container.appendChild(Util.pageHeader('Database Stats', '#/settings'));
  const counts = await DB.counts();
  const labels = {
    labLog: 'Lab Logs (Wines)', labEvent: 'Lab Events', testTypeLookup: 'Test Types',
    crushLog: 'Crush Log Entries', preHarvest: 'Pre-Harvest Dates', preHarvestMeasure: 'Pre-Harvest Tests',
    vineyardActivity: 'Vineyard Activity', vineyardActivityLookup: 'Vineyard Activity Types',
    workOrder: 'Work Orders', workActivity: 'Work Activities', additive: 'Additives',
    yeast: 'Yeasts', nutrient: 'Nutrients', tank: 'Tanks', tankCapacity: 'Tank Capacity Rows',
  };
  const grid = Util.el('div', { class: 'stat-grid' });
  for (const [key, label] of Object.entries(labels)) {
    grid.appendChild(Util.el('div', { class: 'stat-tile' }, [
      Util.el('div', { class: 'num' }, String(counts[key] ?? 0)),
      Util.el('div', { class: 'label' }, label),
    ]));
  }
  container.appendChild(grid);
}

async function renderPrivacy(container) {
  container.appendChild(Util.pageHeader('Privacy Policy', '#/settings'));
  const card = Util.card([]);
  container.appendChild(card);
  try {
    const res = await fetch('assets/PrivacyPolicy.html');
    const html = await res.text();
    const frame = Util.el('iframe', { style: 'width:100%; min-height:60vh; border:none;' });
    card.appendChild(frame);
    frame.addEventListener('load', () => {}, { once: true });
    frame.srcdoc = html;
  } catch {
    card.appendChild(Util.el('p', {}, 'All data in this app is stored locally on this device. Nothing is transmitted anywhere.'));
  }
}

window.renderSettings = renderSettings;
window.renderDatabaseStats = renderDatabaseStats;
window.renderPrivacy = renderPrivacy;
