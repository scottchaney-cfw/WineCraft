// First-run seed data — matches the hardcoded rows inserted by DatabaseHelper.onCreate() in the
// original Android app (loadTableLabLog, loadTestTableLookup, loadWorkActivity, loadAdditive,
// loadVineyardActivityLookup, loadYeast, loadNutrient, loadTank, loadTankCapacity).
const SEED = {
  labLog: [
    'Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Malbec', 'Petit Verdot',
    'Pinot Noir', 'Chardonnay', 'Pinot Grigio', 'Viognier', 'Muscat', 'Riesling', 'Gewurztraminer',
  ].map((varietal) => ({ vintage: 0, varietal, source: null, updateServer: 'true' })),

  testTypeLookup: [
    ['TA', 'g/L'], ['pH', ''], ['FSO', 'ppm'], ['TSO', 'ppm'], ['VA', 'mg/L'],
    ['RS', 'g/L'], ['% Alc', 'w/v'], ['YAN', 'mg N/L'], ['Brix', 'wt/v'], ['Temp', 'F'],
  ].map(([testType, unitMeasure]) => ({ testType, unitMeasure, updateServer: 'true' })),

  vineyardActivityLookup: [
    ['Spray Sevin', 'Gal'], ['Spray Copper Sulfate', 'lbs'], ['Spray Fungicide', ''],
    ['Spread Fertilizer', ''], ['Watering Rate', ''], ['Fertigation 20-20-10', 'kg'],
    ['Suckering', 'N/A'], ['Leaf Pulling', ''], ['Pruning', ''],
  ].map(([activity, unitMeasure]) => ({ activity, unitMeasure, updateServer: 'true' })),

  workActivity: [
    ['Addition', ''], ['Press', ''], ['Rack', ''], ['Barrel', ''],
    ['Bottle', ''], ['DE Filter', ''], ['Lees Filter', ''],
  ].map(([activity, additive]) => ({ activity, additive, updateServer: 'true' })),

  additive: [
    ['Agrilact', 'kg', 'kg/L', '20'], ['Arabinol', 'g', 'g/L', '20'], ['Bentonite', 'g', 'g/L', '20'],
    ['Caesin', 'g', 'g/L', '20'], ['Color Pro', 'mL', 'mL/L', '20'], ['Cream of Tartar', 'g', 'g/L', '20'],
    ['DAP', 'kg', 'g/L', '20'], ['Enzym', 'g', 'g/L', '20'], ['Fermaid', 'kg', 'kg/L', '20'],
    ['Gelrom', 'g', 'g/L', '20'], ['GoFerm', 'g', 'g/L', '20'], ['Kearmor', 'g', 'g/L', '20'],
    ['KMBS', 'g', 'g/L', '20'], ['Lysozyme', 'g', 'g/L', '20'], ['Malic Acid', 'g', 'g/L', '20'],
    ['N/A', '', '', ''], ['Oak Chips', 'kg', 'kg/L', '20'], ['Opti Red', 'mL', 'mL/L', '20'],
    ['Polyclar', 'g', 'g/L', '20'], ['Potcarb', 'g', 'g/L', '20'], ['PVPP', 'g', 'g/L', '20'],
    ['Sparkloid', 'g', 'g/L', '20'], ['Tannin', 'g', 'g/L', '20'], ['Tartaric Acid', 'g', 'g/L', '20'],
    ['Yeast', 'g', 'g/L', '20'],
  ].map(([additive, unitMeasure, dosage, dosageRange]) => ({ additive, unitMeasure, dosage, dosageRange, updateServer: 'true' })),

  yeast: [
    ['Lalvin', 'VL-60', '220'], ['Laffort', 'RX-60', '325'], ['Laffort', 'RX-90', '240'],
    ['Laffort', 'KB-78', '175'], ['Scott', 'MP3', '165'],
  ].map(([company, strain, yanRequired]) => ({ company, strain, yanRequired, updateServer: 'true' })),

  nutrient: [
    ['DAP', '210'], ['SuperFood', '180'], ['Fermaid K', '130'],
  ].map(([nutrient, ppm]) => ({ nutrient, ppm, updateServer: 'true' })),

  tank: [
    ['1', '50', '42.5', '106.7', 'true'],
    ['2', '50', '42.5', '106.7', 'true'],
    ['3', '50', '42.5', '106.7', 'true'],
  ].map(([tank, capacity, heightInches, heightCm, simpleCalc]) => ({ tank, capacity, heightInches, heightCm, simpleCalc, updateServer: 'true' })),

  // tankCapacity rows are seeded only for tank "1" in the original app; attached after tanks are inserted.
  tankCapacityForTankOne: [
    ['1.17', '4.42', '41.5', '1', '104.1', '2.5'],
    ['2.34', '8.86', '40.5', '2', '101.7', '5'],
    ['3.51', '13.27', '39.5', '3', '99.1', '7.5'],
  ].map(([gallonAmount, literAmount, inchesFromTop, inchesFromBottom, cmFromTop, cmFromBottom]) => ({
    gallonAmount, literAmount, inchesFromTop, inchesFromBottom, cmFromTop, cmFromBottom, updateServer: 'true',
  })),
};

async function seedIfEmpty() {
  const existing = await DB.all('labLog');
  if (existing.length > 0) return false;

  for (const row of SEED.labLog) await DB.add('labLog', row);
  for (const row of SEED.testTypeLookup) await DB.add('testTypeLookup', row);
  for (const row of SEED.vineyardActivityLookup) await DB.add('vineyardActivityLookup', row);
  for (const row of SEED.workActivity) await DB.add('workActivity', row);
  for (const row of SEED.additive) await DB.add('additive', row);
  for (const row of SEED.yeast) await DB.add('yeast', row);
  for (const row of SEED.nutrient) await DB.add('nutrient', row);

  const tankIds = [];
  for (const row of SEED.tank) tankIds.push(await DB.add('tank', row));

  for (const row of SEED.tankCapacityForTankOne) {
    await DB.add('tankCapacity', { ...row, tank: '1' });
  }

  return true;
}

window.seedIfEmpty = seedIfEmpty;
