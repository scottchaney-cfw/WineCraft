// Direct port of WineCraftCalc.java — formulas reproduced exactly, including the
// original app's non-standard gallon<->liter constant (3.71845, not 3.78541).
const Calc = {
  calcTA(naOHNormality, naOHAmount) { return naOHNormality * naOHAmount * 75 / 5; },
  calcNormalityPointOneNaOH(naOHAmount, hClNormality, hClAmount) { return hClNormality * hClAmount / naOHAmount; },
  calcFSO(naOHNormality, naOHAmount) { return naOHNormality * naOHAmount * 1600; },
  calcNormalityPointZeroOneNaOH(naOHAmount, hClNormality, hClAmount) { return hClNormality * hClAmount / naOHAmount; },
  calcTSO(iodineNormality, iodineAmount) { return iodineNormality * iodineAmount * 32 * 1000 / 20; },
  calcNormalityPointZeroTwoIodine(iodineAmount, thioNormality, thioAmount) { return thioNormality * thioAmount / iodineAmount; },
  calcVA(naOHNormality, naOHAmount) { return naOHNormality * naOHAmount * 32 / 20; },
  calcWaterBlank(dextroseAmount /*, dextroseNormality, waterAmount */) { return dextroseAmount; },
  calcRS(blankAmount, wineAmount) { return (blankAmount - wineAmount) / 4; },
  calcYAN(naOHNormality, naOHAmount) { return naOHNormality * naOHAmount * 35; },
  calcPercentAlcohol(alcoholBlank, alcoholRS, alcoholReading) {
    const alcDegree = alcoholBlank - alcoholReading;
    let alcCalc = 0.0089 * Math.pow(alcDegree, 3) - 0.127 * Math.pow(alcDegree, 2) + 2.1248 * alcDegree - 2.9396;
    alcCalc = alcCalc * (1 - (alcoholRS * 0.05));
    return alcCalc;
  },
  calcTonSO2Add(ton, gallonsPerTon, desiredSO2Value) { return ton * gallonsPerTon * desiredSO2Value * 0.00757; },
  calcRecommendedPpmForPh(stdUsed, phValue) {
    if (stdUsed === '.8g/L') return 0.0149 * Math.pow(Math.E, 2.2573 * phValue);
    if (stdUsed === '.5g/L') return 0.0093 * Math.pow(Math.E, 2.2535 * phValue);
    return 0;
  },
  calcGallonKMBSAdd(stdUsed, gallonKMBSValue, measuredPpmValue, phValue) {
    const rec = Calc.calcRecommendedPpmForPh(stdUsed, phValue);
    if (!rec) return 0;
    return gallonKMBSValue * 0.00757 * (rec - measuredPpmValue);
  },
  calcGallonKMBSAddNoPh(stdUsed, gallonKMBSValue, measuredPpmValue, desiredFreeSO2Value) {
    return gallonKMBSValue * 0.00757 * (desiredFreeSO2Value - measuredPpmValue);
  },
  calcGallonToLiter(g) { return g * 3.71845; },
  calcLiterToGallon(l) { return l / 3.71845; },
  calcPoundToKg(p) { return p / 2.21; },
  calcKgToPound(k) { return k * 2.21; },
  calcOunceToGram(o) { return o * 28.3495; },
  calcGramToOunce(g) { return g / 28.3495; },
  calcTspToMl(t) { return t * 4.92892; },
  calcMlToTsp(m) { return m / 4.92892; },
  calcCentToFer(c) { return (c * 9 / 5) + 32; },
  calcFerToCent(f) { return (f - 32) * 5 / 9; },
  calcTonToPound(t) { return t * 2000; },
  calcPoundToTon(p) { return p / 2000; },
  calcInchesToCm(i) { return i * 2.54; },
  calcCmToInches(c) { return c / 2.54; },
  calcYANAdd(requiredYan, measuredYan, yanLiter, ppmPerGramPerLiter) {
    return (requiredYan - measuredYan) * yanLiter / ppmPerGramPerLiter;
  },
  calcPhFromTa(acidEstTA, measuredPH) { return measuredPH + (acidEstTA / 10); },
  calcTaFromPh(desiredPH, measuredPH) { return (desiredPH - measuredPH) * 10; },
  calcTartaricAcidAdd(measuredTA, measuredLiter, acidTartaricPerc, desiredTA) {
    return (desiredTA - measuredTA) * (acidTartaricPerc / 100) * measuredLiter;
  },
  calcMalicAcidAdd(measuredTA, measuredLiter, acidMalicPerc, desiredTA) {
    return (desiredTA - measuredTA) * ((acidMalicPerc / 100) / 1.2) * measuredLiter;
  },
};

window.Calc = Calc;
