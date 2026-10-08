function renderBlending(container) {
  container.appendChild(Util.pageHeader('Blending', '#/'));

  // --- Part A: simple C1V1 weighted concentration/volume solver ---
  const v1 = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const c1 = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const v2 = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const c2 = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const vCombined = Util.el('input', { class: 'input', type: 'number', step: 'any' });
  const cCombined = Util.el('input', { class: 'input', type: 'number', step: 'any' });

  function forward() {
    const V1 = Util.parseNum(v1.value), C1 = Util.parseNum(c1.value), V2 = Util.parseNum(v2.value), C2 = Util.parseNum(c2.value);
    if (V1 === null || C1 === null || V2 === null || C2 === null) return;
    const vc = V1 + V2;
    vCombined.value = vc.toFixed(1);
    cCombined.value = (vc ? (V1 * C1 + V2 * C2) / vc : 0).toFixed(4);
  }
  function reverse() {
    const V1 = Util.parseNum(v1.value), C1 = Util.parseNum(c1.value), VC = Util.parseNum(vCombined.value), CC = Util.parseNum(cCombined.value);
    if (V1 === null || C1 === null || VC === null || CC === null) return;
    const V2 = VC - V1;
    v2.value = V2.toFixed(1);
    c2.value = (V2 ? (VC * CC - V1 * C1) / V2 : 0).toFixed(4);
  }
  [v1, c1, v2, c2].forEach((n) => n.addEventListener('blur', forward));
  [vCombined, cCombined].forEach((n) => n.addEventListener('blur', reverse));

  container.appendChild(Util.card([
    Util.el('h2', {}, 'Two-Lot Volume / Concentration Solver'),
    Util.el('div', { class: 'hint' }, 'Fill Lot 1 + Lot 2 to compute the Combined result, or fill Combined to solve for Lot 2.'),
    Util.el('div', { class: 'row' }, [Util.field('Lot 1 Volume', v1), Util.field('Lot 1 Concentration', c1)]),
    Util.el('div', { class: 'row' }, [Util.field('Lot 2 Volume', v2), Util.field('Lot 2 Concentration', c2)]),
    Util.el('div', { class: 'row' }, [Util.field('Combined Volume', vCombined), Util.field('Combined Concentration', cCombined)]),
  ]));

  // --- Part B: 2/3-way wine blend calculator ---
  function lotFields(n) {
    return {
      volume: Util.el('input', { class: 'input', type: 'number', step: 'any' }),
      alc: Util.el('input', { class: 'input', type: 'number', step: 'any' }),
      va: Util.el('input', { class: 'input', type: 'number', step: 'any' }),
      tso2: Util.el('input', { class: 'input', type: 'number', step: 'any' }),
      perc: Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true }),
    };
  }
  const lot1 = lotFields(1), lot2 = lotFields(2), lot3 = lotFields(3);
  const targetVolume = Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true });
  const targetAlc = Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true });
  const targetVA = Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true });
  const targetTSO2 = Util.el('input', { class: 'input', type: 'number', step: 'any', readonly: true });

  function recalcBlend() {
    const lots = [lot1, lot2, lot3].map((l) => ({
      v: Util.parseNum(l.volume.value), alc: Util.parseNum(l.alc.value), va: Util.parseNum(l.va.value), tso: Util.parseNum(l.tso2.value), el: l,
    })).filter((l) => l.v && l.v > 0);

    if (!lots.length) return;
    const total = lots.reduce((s, l) => s + l.v, 0);
    targetVolume.value = total.toFixed(1);
    for (const l of lots) l.el.perc.value = (l.v * 100 / total).toFixed(1);
    for (const l of [lot1, lot2, lot3]) if (!lots.find((x) => x.el === l)) l.perc.value = '';

    if (lots.every((l) => l.alc !== null)) targetAlc.value = (lots.reduce((s, l) => s + l.v * l.alc, 0) / total).toFixed(4); else targetAlc.value = '';
    if (lots.every((l) => l.va !== null)) targetVA.value = (lots.reduce((s, l) => s + l.v * l.va, 0) / total).toFixed(4); else targetVA.value = '';
    if (lots.every((l) => l.tso !== null)) targetTSO2.value = (lots.reduce((s, l) => s + l.v * l.tso, 0) / total).toFixed(4); else targetTSO2.value = '';
  }

  function lotCard(title, lot) {
    return Util.card([
      Util.el('h2', {}, title),
      Util.el('div', { class: 'row' }, [Util.field('Volume (Gal)', lot.volume), Util.field('% of Blend', lot.perc)]),
      Util.el('div', { class: 'row' }, [Util.field('% Alcohol', lot.alc), Util.field('VA (g/L)', lot.va), Util.field('Total SO2 (ppm)', lot.tso2)]),
    ]);
  }

  [lot1, lot2, lot3].forEach((l) => [l.volume, l.alc, l.va, l.tso2].forEach((n) => n.addEventListener('blur', recalcBlend)));

  container.appendChild(Util.el('div', { class: 'section-title' }, '2 or 3-Way Blend Calculator'));
  container.appendChild(lotCard('Lot 1', lot1));
  container.appendChild(lotCard('Lot 2', lot2));
  container.appendChild(lotCard('Lot 3 (optional)', lot3));
  container.appendChild(Util.card([
    Util.el('h2', {}, 'Target Blend'),
    Util.el('div', { class: 'row' }, [Util.field('Total Volume (Gal)', targetVolume), Util.field('% Alcohol', targetAlc)]),
    Util.el('div', { class: 'row' }, [Util.field('VA (g/L)', targetVA), Util.field('Total SO2 (ppm)', targetTSO2)]),
  ]));
}

window.renderBlending = renderBlending;
