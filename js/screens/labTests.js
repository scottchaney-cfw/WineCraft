// Generic engine for the 11 lab-test screens reachable from Lab Work. Each screen is defined
// declaratively (matching the exact formulas ported in calc.js) and rendered by one shared function.
const normA = (std) => Calc.calcNormalityPointOneNaOH(std, 0.1, 5.0);       // vs 0.1N HCl / 5.0mL
const normB = (std) => Calc.calcNormalityPointZeroOneNaOH(std, 0.01, 5.0); // vs 0.01N HCl / 5.0mL
const normC = (std) => Calc.calcNormalityPointZeroTwoIodine(std, 0.02, 10.0); // vs 0.02N Thiosulfate / 10.0mL

const LAB_TESTS = {
  ta: {
    title: 'Total Acid (TA)', icon: '🧪',
    sections: [{ testType: 'TA', kind: 'titration', normFn: normA, normLabel: '.1N NaOH Normality',
      stdLabel: 'Standardize .1N NaOH (mL)', sampleLabel: 'Amount titrant .1N NaOH (mL)',
      calc: (n, s) => Calc.calcTA(n, s), resultLabel: 'Total Acid', unit: 'g/100mL', decimals: 2 }],
  },
  taph: {
    title: 'TA / pH Combo', icon: '🧪',
    sections: [
      { testType: 'TA', kind: 'titration', normFn: normA, normLabel: '.1N NaOH Normality',
        stdLabel: 'Standardize .1N NaOH (mL)', sampleLabel: 'Amount titrant .1N NaOH (mL)',
        calc: (n, s) => Calc.calcTA(n, s), resultLabel: 'Total Acid', unit: 'g/100mL', decimals: 2 },
      { testType: 'pH', kind: 'raw', rawLabel: 'pH Reading', resultLabel: 'pH', unit: '', decimals: 2 },
    ],
  },
  fso: {
    title: 'Free SO2', icon: '🧪',
    sections: [{ testType: 'FSO', kind: 'titration', normFn: normB, normLabel: '.01N NaOH Normality',
      stdLabel: 'Standardize .01N NaOH (mL)', sampleLabel: 'Amount titrant NaOH (mL)',
      calc: (n, s) => Calc.calcFSO(n, s), resultLabel: 'Free SO2', unit: 'ppm', decimals: 2, timerMs: 600000 }],
  },
  ph: {
    title: 'pH', icon: '🧪',
    sections: [{ testType: 'pH', kind: 'raw', rawLabel: 'pH Reading', resultLabel: 'pH', unit: '', decimals: 2 }],
  },
  va: {
    title: 'Volatile Acidity (VA)', icon: '🧪',
    sections: [{ testType: 'VA', kind: 'titration', normFn: normA, normLabel: '.1N NaOH Normality',
      stdLabel: 'Standardize .1N NaOH (mL)', sampleLabel: 'Amount titrant NaOH (mL)',
      calc: (n, s) => Calc.calcVA(n, s), resultLabel: 'VA', unit: 'g/L', decimals: 2 }],
  },
  alc: {
    title: 'Percent Alcohol (Ebulliometer)', icon: '🧪',
    sections: [{ testType: '% Alc', kind: 'alcohol', resultLabel: '% Alcohol', unit: '% v/v', decimals: 4 }],
  },
  yan: {
    title: 'YAN (Formol)', icon: '🧪',
    sections: [{ testType: 'YAN', kind: 'titration', normFn: normA, normLabel: '.1N NaOH Normality',
      stdLabel: 'Standardize .1N NaOH (mL)', sampleLabel: 'Amount titrant NaOH (mL)',
      calc: (n, s) => Calc.calcYAN(n, s), resultLabel: 'YAN', unit: 'mg N/L', decimals: 2 }],
  },
  tso: {
    title: 'Total SO2', icon: '🧪',
    sections: [{ testType: 'TSO', kind: 'titration', normFn: normC, normLabel: '.02N Iodine Normality',
      stdLabel: 'Standardize .02N Iodine (mL)', sampleLabel: 'Amount titrant Iodine (mL)',
      calc: (n, s) => Calc.calcTSO(n, s), resultLabel: 'Total SO2', unit: 'ppm', decimals: 2 }],
  },
  rs: {
    title: 'Residual Sugar (RS)', icon: '🧪',
    sections: [{ testType: 'RS', kind: 'rs',
      stdLabel: 'Dextrose Blank (mL)', sampleLabel: 'Wine Sample (mL)',
      calc: (b, s) => Calc.calcRS(b, s), resultLabel: 'Residual Sugar', unit: 'g/L', decimals: 2 }],
  },
  fsova: {
    title: 'Free SO2 & VA', icon: '🧪',
    sections: [
      { testType: 'FSO', kind: 'titration', normFn: normB, normLabel: '.01N NaOH Normality',
        stdLabel: 'Standardize .01N NaOH (mL)', sampleLabel: 'Amount titrant NaOH (mL)',
        calc: (n, s) => Calc.calcFSO(n, s), resultLabel: 'Free SO2', unit: 'ppm', decimals: 2, timerMs: 600000 },
      { testType: 'VA', kind: 'titration', normFn: normA, normLabel: '.1N NaOH Normality',
        stdLabel: 'Standardize .1N NaOH (mL)', sampleLabel: 'Amount titrant NaOH (mL)',
        calc: (n, s) => Calc.calcVA(n, s), resultLabel: 'VA', unit: 'g/L', decimals: 2 },
    ],
  },
  bxt: {
    title: 'Brix / Temp', icon: '🧪',
    sections: [
      { testType: 'Brix', kind: 'raw', rawLabel: 'Brix Reading', resultLabel: 'Brix', unit: '', decimals: 2 },
      { testType: 'Temp', kind: 'raw', rawLabel: 'Temperature (F)', resultLabel: 'Temp', unit: 'F', decimals: 2 },
    ],
  },
};

const TEST_TYPE_TO_KEY = {}; // e.g. "TA" -> "ta" (first single-section screen wins; combos reachable via list too)
for (const [key, def] of Object.entries(LAB_TESTS)) {
  if (def.sections.length === 1 && !TEST_TYPE_TO_KEY[def.sections[0].testType]) {
    TEST_TYPE_TO_KEY[def.sections[0].testType] = key;
  }
}
TEST_TYPE_TO_KEY['% Alc'] = 'alc';

const PROCEDURE_DOCS = {
  ta: 'TA.html', taph: 'TAandPH.html', fso: 'FreeSO2.html', ph: 'pH.html', va: 'VA.html',
  alc: 'Alcohol.html', yan: 'YAN.html', tso: 'TotalSO2.html', rs: 'RS.html', fsova: 'FreeSO2andVA.html',
};

function renderSection(section) {
  const state = { manual: false };
  const resultInput = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const box = [];

  function recalc() {
    if (state.manual) return;
    let result = null;
    if (section.kind === 'titration') {
      const std = Util.parseNum(state.stdInput.value);
      const norm = std ? section.normFn(std) : null;
      state.normInput.value = norm !== null ? norm.toFixed(4) : '';
      const sample = Util.parseNum(state.sampleInput.value);
      if (norm !== null && sample !== null) result = section.calc(norm, sample);
    } else if (section.kind === 'rs') {
      const blank = Util.parseNum(state.stdInput.value);
      const sample = Util.parseNum(state.sampleInput.value);
      if (blank !== null && sample !== null) result = section.calc(blank, sample);
    } else if (section.kind === 'alcohol') {
      const blank = Util.parseNum(state.blankInput.value);
      const rs = Util.parseNum(state.rsInput.value) ?? 0;
      const reading = Util.parseNum(state.readingInput.value);
      if (blank !== null && reading !== null) result = Calc.calcPercentAlcohol(blank, rs, reading);
    } else if (section.kind === 'raw') {
      result = Util.parseNum(state.rawInput.value);
    }
    resultInput.value = result !== null ? result.toFixed(section.decimals) : '';
  }

  if (section.kind === 'titration') {
    state.stdInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    state.normInput = Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true });
    state.sampleInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    box.push(
      Util.el('div', { class: 'row' }, [
        Util.field(section.stdLabel, state.stdInput),
        Util.field(section.normLabel, state.normInput),
      ]),
      Util.field(section.sampleLabel, state.sampleInput),
    );
  } else if (section.kind === 'rs') {
    state.stdInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    state.sampleInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    box.push(Util.el('div', { class: 'row' }, [
      Util.field(section.stdLabel, state.stdInput),
      Util.field(section.sampleLabel, state.sampleInput),
    ]));
  } else if (section.kind === 'alcohol') {
    state.blankInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    state.rsInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc, value: '0' });
    state.readingInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    box.push(Util.el('div', { class: 'row' }, [
      Util.field('Blank Reading (boiling pt)', state.blankInput),
      Util.field('RS Correction Factor', state.rsInput),
      Util.field('Sample Reading (boiling pt)', state.readingInput),
    ]));
  } else if (section.kind === 'raw') {
    state.rawInput = Util.el('input', { class: 'input', type: 'number', step: 'any', onblur: recalc });
    box.push(Util.field(section.rawLabel, state.rawInput));
  }

  const manualCheckbox = Util.el('input', { type: 'checkbox', id: `manual-${section.testType}`, onchange: (e) => {
    state.manual = e.target.checked;
    resultInput.readOnly = !state.manual;
    if (!state.manual) recalc();
  } });
  resultInput.readOnly = true;

  box.push(
    Util.el('div', { class: 'result-box' }, [
      Util.el('div', {}, [
        Util.el('div', { class: 'unit' }, section.resultLabel),
        resultInput,
      ]),
      Util.el('div', { class: 'unit' }, section.unit || ''),
    ]),
    Util.el('div', { class: 'checkbox-field' }, [
      manualCheckbox,
      Util.el('label', { for: `manual-${section.testType}` }, 'Enter result manually'),
    ]),
  );

  const wrapper = Util.card([
    Util.el('h2', {}, `${section.resultLabel} (${section.testType})`),
    ...box,
  ]);

  return {
    wrapper,
    getResult() { return Util.parseNum(resultInput.value); },
    prefill(value) { resultInput.value = value !== null && value !== undefined ? Number(value).toFixed(section.decimals) : ''; },
    setStd(v) { if (state.stdInput) state.stdInput.value = v; },
    setSample(v) { if (state.sampleInput) state.sampleInput.value = v; },
    setRaw(v) { if (state.rawInput) state.rawInput.value = v; },
  };
}

async function renderLabTest(container, testKey, editEventId) {
  const def = LAB_TESTS[testKey];
  if (!def) { container.appendChild(Util.el('div', { class: 'card' }, 'Unknown test.')); return; }

  const procDoc = PROCEDURE_DOCS[testKey];
  container.appendChild(Util.pageHeader(def.title, '#/lab-work', procDoc ? [
    Util.el('button', { class: 'btn small secondary', onclick: () => window.open(`assets/procedures/${procDoc}`, '_blank') }, 'View Procedure'),
  ] : []));

  const varietalSelect = await Util.buildVarietalSelect();
  const vintageSelect = Util.buildVintageSelect();
  const dateInput = Util.el('input', { class: 'input', type: 'date', value: Util.todayISO() });
  const sourceInput = Util.el('input', { class: 'input', type: 'text', placeholder: 'e.g. Tank 3' });
  const notesInput = Util.el('textarea', { class: 'input', rows: 2 });

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Wine & Sample'),
    Util.el('div', { class: 'row' }, [
      Util.field('Varietal', varietalSelect),
      Util.field('Vintage', vintageSelect),
    ]),
    Util.el('div', { class: 'row' }, [
      Util.field('Date', dateInput),
      Util.field('Source', sourceInput, 'Only used when first logging this wine'),
    ]),
    Util.field('Notes', notesInput),
  ]));

  const sectionHandles = def.sections.map((section) => {
    const handle = renderSection(section);
    container.appendChild(handle.wrapper);
    return { section, handle };
  });

  if (editEventId) {
    const event = await DB.getLabLogResultByEventId(editEventId);
    if (event) {
      varietalSelect.value = event.varietal;
      vintageSelect.value = event.vintage;
      dateInput.value = event.eventDate || Util.todayISO();
      sourceInput.value = event.source || '';
      notesInput.value = event.notes || '';
      const log = await DB.getLabLogByVintageAndVarietal(event.vintage, event.varietal);
      if (log) {
        const events = await DB.byIndex('labEvent', 'itemId', log.id);
        for (const { section, handle } of sectionHandles) {
          const match = events.find((e) => e.testType === section.testType && e.eventDate === event.eventDate);
          if (match) handle.prefill(match.result);
        }
      }
    }
  }

  const saveBtn = Util.el('button', { class: 'btn' }, editEventId ? 'Update Lab Log' : 'Add to Lab Log');
  container.appendChild(Util.el('div', { class: 'toolbar' }, [saveBtn]));

  saveBtn.addEventListener('click', async () => {
    const varietal = varietalSelect.value;
    const vintage = Number(vintageSelect.value);
    const date = dateInput.value || Util.todayISO();
    const log = await DB.upsertWineLabLog(vintage, varietal, sourceInput.value || null);

    let savedAny = false;
    for (const { section, handle } of sectionHandles) {
      const result = handle.getResult();
      if (result === null || Number.isNaN(result)) continue;
      savedAny = true;
      if (editEventId) {
        const existing = await DB.getLabLogResultByEventId(editEventId);
        if (existing && existing.testType === section.testType) {
          await DB.put('labEvent', { id: Number(editEventId), itemId: log.id, eventDate: date, testType: section.testType, result, notes: notesInput.value || '', updateServer: 'true' });
          continue;
        }
      }
      await DB.add('labEvent', { itemId: log.id, eventDate: date, testType: section.testType, result, notes: notesInput.value || '', updateServer: 'true' });
    }

    if (!savedAny) { Util.toast('Enter at least one result before saving.'); return; }
    Util.toast(`Recorded ${def.title} for ${varietal} ${vintage}`);
    if (editEventId) Util.navigate('#/lab-log'); else Util.navigate(`#/lab/${testKey}`);
  });
}

function registerLabTestRoutes() {
  for (const key of Object.keys(LAB_TESTS)) {
    Router.register(`/lab/${key}`, (c, p, q) => renderLabTest(c, key, q.id));
  }
}

window.LAB_TESTS = LAB_TESTS;
window.TEST_TYPE_TO_KEY = TEST_TYPE_TO_KEY;
window.registerLabTestRoutes = registerLabTestRoutes;
