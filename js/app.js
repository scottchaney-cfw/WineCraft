function renderTopBar() {
  const bar = Util.el('div', { class: 'topbar' }, [
    Util.el('div', { class: 'brand', onclick: () => Util.navigate('#/') }, [
      Util.el('img', { src: 'assets/icons/icon-192.png', alt: '' }),
      Util.el('span', {}, 'WineCraft'),
    ]),
    Util.el('div', { class: 'top-actions' }, [
      Util.el('button', { onclick: () => Util.navigate('#/wine-list') }, 'Wines'),
      Util.el('button', { onclick: () => Util.navigate('#/settings') }, 'Settings'),
    ]),
  ]);
  document.body.insertBefore(bar, document.body.firstChild);
}

function registerRoutes() {
  Router.register('/', (c) => renderHome(c));
  Router.register('/lab-work', (c) => renderLabWork(c));
  registerLabTestRoutes();
  Router.register('/lab-log', (c) => renderLabLogResults(c));

  Router.register('/crush-log', (c, p, q) => renderCrushLogForm(c, q.id));
  Router.register('/crush-log-results', (c) => renderCrushLogResults(c));

  Router.register('/pre-harvest-log', (c, p, q) => renderPreHarvestForm(c, q.id));
  Router.register('/pre-harvest-results', (c) => renderPreHarvestResults(c));

  Router.register('/pre-harvest-measure', (c, p, q) => renderPreHarvestMeasureForm(c, q.id));
  Router.register('/pre-harvest-measure-results', (c) => renderPreHarvestMeasureResults(c));

  Router.register('/vineyard', (c, p, q) => renderVineyardActivityForm(c, q.id));
  Router.register('/vineyard-log', (c) => renderVineyardLog(c));

  Router.register('/work-order', (c, p, q) => renderWorkOrderForm(c, q.id));
  Router.register('/work-order-results', (c) => renderWorkOrderResults(c));

  Router.register('/wine-list', (c) => renderWineList(c));
  Router.register('/wine-summary', (c, p, q) => renderWineSummary(c, p, q));

  Router.register('/conversions', (c) => renderConversions(c));
  Router.register('/blending', (c) => renderBlending(c));

  Router.register('/admin', (c) => renderAdminHub(c));
  Router.register('/admin/tank', (c) => renderTankAdmin(c));
  Router.register('/admin/tank/add', (c, p, q) => renderTankForm(c, q.id));
  Router.register('/admin/tank/capacity', (c, p, q) => renderTankCapacityList(c, q));
  Router.register('/admin/tank/capacity/add', (c, p, q) => renderTankCapacityForm(c, q));
  Router.register('/admin/:table', (c, p) => renderAdminList(c, p.table));
  Router.register('/admin/:table/add', (c, p, q) => renderAdminForm(c, p.table, q.id));

  Router.register('/settings', (c) => renderSettings(c));
  Router.register('/database-stats', (c) => renderDatabaseStats(c));
  Router.register('/privacy', (c) => renderPrivacy(c));
  Router.register('/diagnostics', (c) => renderDiagnostics(c));
  Router.register('/wheel/:name', (c, p) => renderWheel(c, p.name));
}

function setupInstallPrompt() {
  // iOS/iPadOS has no install prompt: show Add-to-Home-Screen instructions while running in Safari.
  const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  let dismissed = false;
  try { dismissed = localStorage.getItem('installDismissed') === '1'; } catch (e) {}
  if (standalone || dismissed) return;
  const banner = Util.el('div', { class: 'install-banner' }, [
    Util.el('span', {}, '📥 To install WineCraft: tap the Share button in Safari, then "Add to Home Screen". The installed app works offline and keeps your data safer.'),
    Util.el('div', { class: 'spacer' }),
    Util.el('button', { class: 'btn small secondary', id: 'dismiss-install' }, 'Dismiss'),
  ]);
  const content = document.getElementById('app-content');
  content.parentNode.insertBefore(banner, content);
  banner.querySelector('#dismiss-install').addEventListener('click', () => {
    banner.remove();
    try { localStorage.setItem('installDismissed', '1'); } catch (e) {}
  });
}

async function main() {
  renderTopBar();
  await openDatabase();
  await seedIfEmpty();
  registerRoutes();
  setupInstallPrompt();
  Router.start();
  if (navigator.storage && navigator.storage.persist) { try { await navigator.storage.persist(); } catch (e) {} }

  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('service-worker.js'); } catch (e) { console.warn('Service worker registration failed', e); }
  }
}

main();
