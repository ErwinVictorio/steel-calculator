// Apply the supplied formulas directly to entered values.
export const MATERIALS = {
  plate: { name: 'MS Plate', description: 'Mild steel plate', coefficient: 0.7293, formula: 'Thickness × Width × Length × 0.7293' },
  checkered: { name: 'Checkered Plate', description: 'Patterned steel plate', coefficient: 0.7293, formula: 'Thickness × Width × Length × 0.7293 + 5 kg' },
  beams: { name: 'Beams', description: '6 or 12 meter lengths', formula: 'LBS × Length factor ÷ 2.2' },
  flat: { name: 'Flat Bar', description: 'Solid rectangular bar', coefficient: 0.0608, formula: 'Thickness × Width × Length × 0.0608' },
}
export const BEAM_FACTORS = { 6: 20, 12: 40 }
