export const FORMULA_VERSION = 'excel-2026-11-v1'
export const WORKBOOK = 'NOV 2026 DAILY DELIVERY REPORT.xlsx'
export const GROUPS = { plates: 'Plates', sections: 'Bars & sections', tubes: 'Pipes & tubes', known: 'Known weight' }
const number = (key, label, unit, suffix, help = '') => ({ key, label, unit, suffix, help })
const t = number('thickness', 'Thickness', 'mm', 'MM')
const width = (unit, suffix) => number('width', 'Width', unit, suffix)
const length = (unit, suffix) => number('length', 'Length', unit, suffix)
const meterLength = length('meters', 'M')
const w1 = number('width1', 'Outside width / leg 1', 'mm', 'MM')
const w2 = number('width2', 'Outside height / leg 2', 'mm', 'MM')
const profile = { key: 'profile', label: 'Profile / specification', kind: 'text', optional: true, help: 'Optional name detail; does not change the weight rating.' }
const quantity = number('quantity', 'Quantity', 'pcs', 'PCS')
const plateFields = [t, width('feet', 'FT'), length('feet', 'FT')]
const metricPlateFields = [t, width('mm', 'MM'), length('mm', 'MM')]
const rated = unit => [number('rating', 'Weight rating', unit, unit.toUpperCase()), meterLength, profile]
const plateFormula = 'T × W × L × 0.7293'
const baseFormula = 'T × (W ÷ 25.4 ÷ 12) × (L ÷ 25.4 ÷ 12) × 0.7293'
const definitions = {
  plate: { name: 'MS Plate', group: 'plates', description: 'Plate and sheet grades', fields: [...plateFields, { key: 'plateType', label: 'Plate type', kind: 'select', default: 'MS PLATE', options: ['MS PLATE', 'MS PLATE (SC)', 'MS PLATE A572', 'ABS PLATE', 'BLASTED ABS PLATE', 'CR SHEET', 'GI SHEET', 'SS 304 PLATE', 'GA SHEET'].map(value => ({ value, label: value })) }], formula: plateFormula, source: 'PL!N8', rule: 'plate', note: 'Uses the workbook plate coefficient for all listed grades.' },
  checkered: { name: 'Checkered Plate', group: 'plates', description: 'Workbook base weight', fields: plateFields, formula: plateFormula, source: 'PL!N645:N663', rule: 'plate', note: 'Excel rule: no additional 5 kg per piece.' },
  base: { name: 'Base Plate', group: 'plates', description: 'Rectangle · mm dimensions', fields: metricPlateFields, formula: baseFormula, source: 'LP!G6', rule: 'base' },
  baseInches: { name: 'Base Plate (inches)', group: 'plates', description: 'Rectangle · inch dimensions', fields: [t, width('inches', 'IN'), length('inches', 'IN')], formula: 'T × (W ÷ 12) × (L ÷ 12) × 0.7293', source: 'LP!G198', rule: 'baseInches', note: 'Workbook row is per piece; quantity is applied to the complete result.' },
  triangle: { name: 'Triangle Plate', group: 'plates', description: 'Triangular base plate', fields: metricPlateFields, formula: `(${baseFormula}) ÷ 2`, source: 'LP!G1099', rule: 'triangle', note: 'Width and length are the perpendicular base and height.' },
  round: { name: 'Round Plate', group: 'plates', description: 'Circular base plate', fields: [t, number('diameter', 'Diameter', 'mm', 'MM')], formula: '3.141516 × (D ÷ 2 × D ÷ 2) × T × 7.85 ÷ 1000000', source: 'LP!G407:G412', rule: 'round' },
  flat: { name: 'Flat Bar', group: 'sections', description: 'mm × inches × meters', fields: [t, width('inches', 'IN'), meterLength], formula: 'T × W × L × 0.00786 × 25.4', source: 'FB!M10', rule: 'flat', note: 'Length is in meters. Width is in inches; convert source measurements before entering.' },
  beams: { name: 'Wide Flange (lb/ft)', group: 'sections', description: 'Beam · imperial rating', fields: rated('lb/ft'), formula: 'R × (L × 3.28) ÷ 2.20462', source: 'WF!AA11', rule: 'wideImperial', note: 'Excel beam formula, including cut lengths. Replaces the old 20/40 ÷ 2.2 shortcut.' },
  wideMetric: { name: 'Wide Flange (kg/m)', group: 'sections', description: 'Beam · metric rating', fields: rated('kg/m'), formula: 'R × L', source: 'WF!AA9', rule: 'linear' },
  channel: { name: 'Channel Bar', group: 'sections', description: 'Known kg/m rating', fields: rated('kg/m'), formula: 'R × L', source: 'CB!Q8', rule: 'linear', note: 'Use the kg/m rating. Do not infer the rating from depth or width alone.' },
  angle: { name: 'Angle Bar', group: 'sections', description: 'Equal or unequal legs', fields: [t, w1, w2, meterLength], formula: '((W1 × W2) − (W1 − T) × (W2 − T)) × L × 7.85 ÷ 1000', source: 'AB!O20', rule: 'angle' },
  purlins: { name: 'Purlins', group: 'sections', description: 'C / Z section', fields: [{ key: 'purlinType', label: 'Purlin type', kind: 'select', default: 'Z', options: [{ value: 'Z', label: 'Z-Purlin' }, { value: 'C', label: 'C-Purlin' }] }, t, number('height', 'Height', 'mm', 'MM'), number('flange', 'Flange width', 'mm', 'MM'), meterLength, number('developedWidth', 'Developed strip width', 'mm', 'MM', 'Full width of the unfolded strip, including lips. For other profiles, enter the confirmed supplier or workbook width.')], formula: 'T × developed strip width × L × 0.00786', source: 'RF!N304:N305', rule: 'purlins', note: 'Verified Z profile: 1.9 × 200 × 75 mm uses 375 mm developed width. Other profiles require a confirmed developed width.' },
  roll: { name: 'Roll Form', group: 'sections', description: 'Developed strip width', fields: [t, number('width', 'Developed strip width', 'mm', 'MM', 'Use the full developed strip width, not the visible face width.'), meterLength], formula: 'T × W × L × 0.00786', source: 'RF!N8', rule: 'roll' },
  sheetPile: { name: 'Sheet Pile', group: 'sections', description: 'Known kg/m rating', fields: rated('kg/m'), formula: 'R × L', source: 'SP!Q8', rule: 'linear', note: 'Use the supplier or catalogue kg/m rating for the exact section.' },
  pipe: { name: 'Pipe', group: 'tubes', description: 'Actual outside diameter', fields: [number('diameter', 'Outside diameter', 'mm', 'MM', 'Actual OD, not nominal pipe size.'), t, meterLength, profile], formula: '3.1416 × T × (OD − T) × L × 0.00786', source: 'PP!Q11', rule: 'pipe' },
  tubular: { name: 'Tubular', group: 'tubes', description: 'Square or rectangular', fields: [t, w1, w2, meterLength], formula: '2 × T × (W1 + W2 − 2 × T) × L × 0.00786', source: 'TB!O9', rule: 'tubular', note: 'For square / rectangular hollow sections. Use Pipe for circular sections.' },
  knownPiece: { name: 'Known kg per piece', group: 'known', description: 'Use when you know the kg per piece', fields: [number('weight', 'Weight per piece', 'kg/pc', 'KG/PC'), { key: 'description', label: 'Item description', kind: 'text' }], formula: 'Known kg per piece × quantity', source: 'User-supplied per-piece weight', rule: 'knownPiece', basis: 'Known weight', note: 'Enter the weight of one piece. Total = kg per piece x quantity.' },
  knownLinear: { name: 'Known kg per meter', group: 'known', description: 'Use when the supplier gives kg per meter', fields: [...rated('kg/m').slice(0, 2), { key: 'description', label: 'Item description', kind: 'text' }], formula: 'R × L', source: 'User-supplied linear rating', rule: 'linear', basis: 'Known weight', note: 'Enter the supplier-provided kg/m rating. Total = kg per meter x length x quantity.' },
  tagged: { name: 'Tagged batch weight', group: 'known', description: 'Use when you know the whole batch weight', fields: [number('weight', 'Tagged total weight', 'kg', 'KG'), { key: 'description', label: 'Item description', kind: 'text' }], formula: 'Total = tagged kg; average per piece = total ÷ quantity', source: 'User-supplied total; CL / TJCOIL store net weights', rule: 'tagged', basis: 'Tagged total', note: 'Enter the total weight of all pieces. Quantity only calculates the average weight per piece.' },
}
export const MATERIALS = Object.fromEntries(Object.entries(definitions).map(([id, spec]) => [id, { ...spec, id, version: FORMULA_VERSION, fields: [...spec.fields, quantity] }]))
export function initialValues(material) {
  return Object.fromEntries(MATERIALS[material].fields.map(field => [field.key, field.key === 'quantity' ? '1' : field.default ?? '']))
}
