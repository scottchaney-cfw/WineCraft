function bidirectionalPair(labelA, labelB, toB, toA, decimals = 4) {
  const inputA = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const inputB = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  inputA.addEventListener('input', () => {
    const v = Util.parseNum(inputA.value);
    inputB.value = v === null ? '' : toB(v).toFixed(decimals);
  });
  inputB.addEventListener('input', () => {
    const v = Util.parseNum(inputB.value);
    inputA.value = v === null ? '' : toA(v).toFixed(decimals);
  });
  return Util.el('div', { class: 'row' }, [Util.field(labelA, inputA), Util.field(labelB, inputB)]);
}

function renderConversions(container) {
  container.appendChild(Util.pageHeader('Conversions', '#/'));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Unit Conversions'),
    bidirectionalPair('Gallons', 'Liters', Calc.calcGallonToLiter, Calc.calcLiterToGallon, 3),
    bidirectionalPair('Pounds', 'Kilograms', Calc.calcPoundToKg, Calc.calcKgToPound, 3),
    bidirectionalPair('Ounces', 'Grams', Calc.calcOunceToGram, Calc.calcGramToOunce, 3),
    bidirectionalPair('Teaspoons', 'Milliliters', Calc.calcTspToMl, Calc.calcMlToTsp, 3),
    bidirectionalPair('°Fahrenheit', '°Celsius', Calc.calcFerToCent, Calc.calcCentToFer, 2),
    bidirectionalPair('Tons', 'Pounds', Calc.calcTonToPound, Calc.calcPoundToTon, 2),
    bidirectionalPair('Inches', 'Centimeters', Calc.calcInchesToCm, Calc.calcCmToInches, 3),
  ]));

  // Sulfite (KMBS) addition calculator
  const stdUsed = Util.el('select', { class: 'input' }, [
    Util.el('option', { value: '.8g/L' }, '.8 g/L standard (whites / sweets)'),
    Util.el('option', { value: '.5g/L' }, '.5 g/L standard (reds / low-sulfite)'),
  ]);
  const phInput = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const gallonsInput = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const measuredPpmInput = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const kmbsResult = Util.el('div', { class: 'result-box' }, [
    Util.el('div', {}, [Util.el('div', { class: 'unit' }, 'Grams KMBS to add'), Util.el('div', { class: 'value', id: 'kmbs-out' }, '–')]),
  ]);
  function calcKmbs() {
    const ph = Util.parseNum(phInput.value);
    const gal = Util.parseNum(gallonsInput.value);
    const ppm = Util.parseNum(measuredPpmInput.value);
    const out = kmbsResult.querySelector('#kmbs-out');
    if (ph === null || gal === null || ppm === null) { out.textContent = '–'; return; }
    const grams = Calc.calcGallonKMBSAdd(stdUsed.value, gal, ppm, ph);
    out.textContent = `${grams.toFixed(2)} g`;
  }
  [stdUsed, phInput, gallonsInput, measuredPpmInput].forEach((n) => n.addEventListener('input', calcKmbs));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Sulfite (KMBS) Addition'),
    Util.el('div', { class: 'row' }, [Util.field('Standard', stdUsed), Util.field('Measured pH', phInput)]),
    Util.el('div', { class: 'row' }, [Util.field('Volume (Gal)', gallonsInput), Util.field('Measured Free SO2 (ppm)', measuredPpmInput)]),
    kmbsResult,
  ]));

  // YAN addition calculator
  const yanRequired = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const yanMeasured = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const yanLiters = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const nutrientSelect = Util.el('select', { class: 'input' });
  const yanResult = Util.el('div', { class: 'result-box' }, [
    Util.el('div', {}, [Util.el('div', { class: 'unit' }, 'Grams of nutrient to add'), Util.el('div', { class: 'value', id: 'yan-out' }, '–')]),
  ]);
  DB.all('nutrient').then((rows) => {
    for (const n of rows) nutrientSelect.appendChild(Util.el('option', { value: n.ppm }, `${n.nutrient} (${n.ppm} ppm per g/L)`));
    calcYan();
  });
  function calcYan() {
    const req = Util.parseNum(yanRequired.value);
    const meas = Util.parseNum(yanMeasured.value);
    const liters = Util.parseNum(yanLiters.value);
    const ppmPerGL = Util.parseNum(nutrientSelect.value);
    const out = yanResult.querySelector('#yan-out');
    if (req === null || meas === null || liters === null || !ppmPerGL) { out.textContent = '–'; return; }
    out.textContent = `${Calc.calcYANAdd(req, meas, liters, ppmPerGL).toFixed(2)} g`;
  }
  [yanRequired, yanMeasured, yanLiters, nutrientSelect].forEach((n) => n.addEventListener('input', calcYan));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'YAN Addition'),
    Util.el('div', { class: 'row' }, [Util.field('Required YAN (mg N/L)', yanRequired), Util.field('Measured YAN (mg N/L)', yanMeasured)]),
    Util.el('div', { class: 'row' }, [Util.field('Volume (Liters)', yanLiters), Util.field('Nutrient', nutrientSelect)]),
    yanResult,
  ]));

  // Acid addition calculator
  const measuredTA = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const desiredTA = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const measuredLiters = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const acidPerc = Util.el('input', { class: 'input', type: 'number', step: 'any', value: '100' });
  const acidResult = Util.el('div', { class: 'result-box' }, [
    Util.el('div', {}, [Util.el('div', { class: 'unit' }, 'Tartaric Acid to add'), Util.el('div', { class: 'value', id: 'ta-add-out' }, '–')]),
    Util.el('div', {}, [Util.el('div', { class: 'unit' }, 'Malic Acid to add'), Util.el('div', { class: 'value', id: 'ma-add-out' }, '–')]),
  ]);
  function calcAcid() {
    const mTA = Util.parseNum(measuredTA.value); const dTA = Util.parseNum(desiredTA.value);
    const liters = Util.parseNum(measuredLiters.value); const perc = Util.parseNum(acidPerc.value) ?? 100;
    const tOut = acidResult.querySelector('#ta-add-out'); const mOut = acidResult.querySelector('#ma-add-out');
    if (mTA === null || dTA === null || liters === null) { tOut.textContent = '–'; mOut.textContent = '–'; return; }
    tOut.textContent = `${Calc.calcTartaricAcidAdd(mTA, liters, perc, dTA).toFixed(2)} g`;
    mOut.textContent = `${Calc.calcMalicAcidAdd(mTA, liters, perc, dTA).toFixed(2)} g`;
  }
  [measuredTA, desiredTA, measuredLiters, acidPerc].forEach((n) => n.addEventListener('input', calcAcid));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Acid Addition'),
    Util.el('div', { class: 'row' }, [Util.field('Measured TA (g/100mL)', measuredTA), Util.field('Desired TA (g/100mL)', desiredTA)]),
    Util.el('div', { class: 'row' }, [Util.field('Volume (Liters)', measuredLiters), Util.field('Acid Purity (%)', acidPerc)]),
    acidResult,
    Util.el('div', { class: 'hint' }, 'pH/TA rule of thumb: ΔpH ≈ ΔTA(g/L) ÷ 10.'),
  ]));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Additives Reference'),
    Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/admin/additive') }, 'View Additive Dosages'),
  ]));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Tanks'),
    Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/admin/tank') }, 'View / Edit Tanks & Capacity'),
  ]));
}

window.renderConversions = renderConversions;
