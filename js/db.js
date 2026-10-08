// WineCraft offline data layer — IndexedDB wrapper mirroring the original SQLite schema.
const DB_NAME = 'winecraft';
const DB_VERSION = 1;

const STORES = {
  labLog: { keyPath: 'id', autoIncrement: true, indexes: ['vintage', 'varietal'] },
  labEvent: { keyPath: 'id', autoIncrement: true, indexes: ['itemId', 'testType', 'eventDate'] },
  testTypeLookup: { keyPath: 'id', autoIncrement: true, indexes: ['testType'] },
  crushLog: { keyPath: 'id', autoIncrement: true, indexes: ['vintage', 'varietal', 'startDate'] },
  preHarvest: { keyPath: 'id', autoIncrement: true, indexes: ['vintage', 'varietal'] },
  preHarvestMeasure: { keyPath: 'id', autoIncrement: true, indexes: ['vintage', 'varietal', 'testType'] },
  vineyardActivity: { keyPath: 'id', autoIncrement: true, indexes: ['vintage', 'varietal', 'activity'] },
  vineyardActivityLookup: { keyPath: 'id', autoIncrement: true, indexes: ['activity'] },
  workOrder: { keyPath: 'id', autoIncrement: true, indexes: ['eventDate', 'toTank', 'fromVarietal'] },
  workActivity: { keyPath: 'id', autoIncrement: true, indexes: ['activity'] },
  additive: { keyPath: 'id', autoIncrement: true, indexes: ['additive'] },
  yeast: { keyPath: 'id', autoIncrement: true, indexes: ['company'] },
  nutrient: { keyPath: 'id', autoIncrement: true, indexes: ['nutrient'] },
  tank: { keyPath: 'id', autoIncrement: true, indexes: ['tank'] },
  tankCapacity: { keyPath: 'id', autoIncrement: true, indexes: ['tank'] },
};

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, cfg] of Object.entries(STORES)) {
        if (db.objectStoreNames.contains(name)) continue;
        const store = db.createObjectStore(name, { keyPath: cfg.keyPath, autoIncrement: cfg.autoIncrement });
        for (const idx of cfg.indexes) store.createIndex(idx, idx, { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeNames, mode) {
  return openDatabase().then((db) => db.transaction(storeNames, mode));
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const DB = {
  async all(store) {
    const t = await tx(store, 'readonly');
    return promisify(t.objectStore(store).getAll());
  },
  async get(store, id) {
    const t = await tx(store, 'readonly');
    return promisify(t.objectStore(store).get(Number(id)));
  },
  async put(store, record) {
    const t = await tx(store, 'readwrite');
    const id = await promisify(t.objectStore(store).put(record));
    return id;
  },
  async add(store, record) {
    const t = await tx(store, 'readwrite');
    const id = await promisify(t.objectStore(store).add(record));
    return id;
  },
  async delete(store, id) {
    const t = await tx(store, 'readwrite');
    await promisify(t.objectStore(store).delete(Number(id)));
  },
  async byIndex(store, indexName, value) {
    const t = await tx(store, 'readonly');
    return promisify(t.objectStore(store).index(indexName).getAll(value));
  },
  async clearAll() {
    const names = Object.keys(STORES);
    const t = await tx(names, 'readwrite');
    await Promise.all(names.map((n) => promisify(t.objectStore(n).clear())));
  },
  async counts() {
    const names = Object.keys(STORES);
    const result = {};
    for (const n of names) result[n] = (await DB.all(n)).length;
    return result;
  },
  async exportAll() {
    const names = Object.keys(STORES);
    const dump = { _meta: { app: 'WineCraft', exportedAt: new Date().toISOString(), version: DB_VERSION } };
    for (const n of names) dump[n] = await DB.all(n);
    return dump;
  },
  async importAll(dump, mode = 'replace') {
    const names = Object.keys(STORES);
    if (mode === 'replace') await DB.clearAll();
    const t = await tx(names, 'readwrite');
    for (const n of names) {
      const rows = dump[n];
      if (!Array.isArray(rows)) continue;
      const store = t.objectStore(n);
      for (const row of rows) {
        const clone = { ...row };
        if (mode === 'merge') delete clone.id;
        store.put(clone);
      }
    }
    await promisify(t.objectStore(names[0]).count());
  },
};

// ---- Higher-level query helpers mirroring DatabaseHelper.java methods ----

DB.varietalNames = async function varietalNames() {
  const rows = await DB.byIndex('labLog', 'vintage', 0);
  return rows.map((r) => r.varietal).filter(Boolean).sort((a, b) => a.localeCompare(b));
};

DB.getLabLogByVintageAndVarietal = async function (vintage, varietal) {
  const rows = await DB.byIndex('labLog', 'vintage', Number(vintage));
  return rows.find((r) => r.varietal === varietal) || null;
};

DB.upsertWineLabLog = async function (vintage, varietal, source) {
  let log = await DB.getLabLogByVintageAndVarietal(vintage, varietal);
  if (log) return log;
  const id = await DB.add('labLog', { vintage: Number(vintage), varietal, source: source || null, updateServer: 'true' });
  return DB.get('labLog', id);
};

DB.getAllActualLabLogs = async function () {
  const all = await DB.all('labLog');
  return all.filter((r) => Number(r.vintage) !== 0);
};

DB.getLabLogResults = async function (vintage) {
  const logs = await DB.all('labLog');
  const events = await DB.all('labEvent');
  const types = await DB.all('testTypeLookup');
  const typeUnit = Object.fromEntries(types.map((t) => [t.testType, t.unitMeasure]));
  const logById = Object.fromEntries(logs.map((l) => [l.id, l]));
  let rows = events.map((e) => {
    const log = logById[e.itemId];
    if (!log) return null;
    return {
      eventId: e.id,
      id: log.id,
      vintage: log.vintage,
      varietal: log.varietal,
      source: log.source,
      eventDate: e.eventDate,
      testType: e.testType,
      result: e.result,
      notes: e.notes,
      unitMeasure: typeUnit[e.testType] || '',
    };
  }).filter(Boolean);
  if (vintage) rows = rows.filter((r) => Number(r.vintage) === Number(vintage));
  rows.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return rows;
};

DB.getLabLogResultByEventId = async function (eventId) {
  const rows = await DB.getLabLogResults();
  return rows.find((r) => Number(r.eventId) === Number(eventId)) || null;
};

DB.deleteLabEventCascade = async function (eventId) {
  await DB.delete('labEvent', eventId);
};

DB.deleteLabLogCascade = async function (labLogId) {
  const events = await DB.byIndex('labEvent', 'itemId', Number(labLogId));
  for (const e of events) await DB.delete('labEvent', e.id);
  await DB.delete('labLog', labLogId);
};

DB.sortedByField = async function (store, field, dir = 'asc') {
  const rows = await DB.all(store);
  rows.sort((a, b) => {
    const av = (a[field] ?? '').toString();
    const bv = (b[field] ?? '').toString();
    return dir === 'asc' ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true });
  });
  return rows;
};

DB.getAllCrushLogs = async function () { return DB.sortedByField('crushLog', 'startDate', 'desc'); };
DB.getAllPreHarvests = async function () { return DB.sortedByField('preHarvest', 'budBreak', 'desc'); };
DB.getAllWorkOrders = async function () { return DB.sortedByField('workOrder', 'eventDate', 'desc'); };

DB.getAllPreHarvestMeasuresWithUnit = async function () {
  const rows = await DB.all('preHarvestMeasure');
  const types = await DB.all('testTypeLookup');
  const typeUnit = Object.fromEntries(types.map((t) => [t.testType, t.unitMeasure]));
  const joined = rows.filter((r) => r.testType in typeUnit).map((r) => ({ ...r, unitMeasure: typeUnit[r.testType] }));
  joined.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return joined;
};

DB.getAllVineyardActivitiesWithUnit = async function () {
  const rows = await DB.all('vineyardActivity');
  const lookups = await DB.all('vineyardActivityLookup');
  const unitByActivity = Object.fromEntries(lookups.map((l) => [l.activity, l.unitMeasure]));
  const joined = rows.filter((r) => r.activity in unitByActivity).map((r) => ({ ...r, unitMeasure: unitByActivity[r.activity] }));
  joined.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return joined;
};

DB.getAllWorkOrdersWithAdditiveUnit = async function () {
  const rows = await DB.all('workOrder');
  const additives = await DB.all('additive');
  const unitByAdditive = Object.fromEntries(additives.map((a) => [a.additive, a.unitMeasure]));
  const joined = rows.filter((r) => r.additive in unitByAdditive).map((r) => ({ ...r, additiveUnit: unitByAdditive[r.additive] }));
  joined.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return joined;
};

DB.getLatestTankWorkOrderGallon = async function (tankName) {
  const rows = await DB.byIndex('workOrder', 'toTank', tankName);
  if (!rows.length) return null;
  rows.sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return rows[0].afterAmount;
};

DB.copyTankCapacitiesFromTank = async function (fromTank, toTank) {
  const rows = await DB.byIndex('tankCapacity', 'tank', fromTank);
  for (const r of rows) {
    const clone = { ...r, tank: toTank };
    delete clone.id;
    await DB.add('tankCapacity', clone);
  }
  return rows.length;
};

DB.deleteTankCascade = async function (tankId, tankName) {
  const caps = await DB.byIndex('tankCapacity', 'tank', tankName);
  for (const c of caps) await DB.delete('tankCapacity', c.id);
  await DB.delete('tank', tankId);
};

window.DB = DB;
window.__DB_STORES = STORES;
