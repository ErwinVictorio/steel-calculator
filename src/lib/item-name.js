import { MATERIALS, BEAM_FACTORS } from '../data/formulas'
import { positiveNumber } from './calculations'

export function generateItemName(material, values) {
  if (!MATERIALS[material]) return ''
  const fields = material === 'beams' ? ['lbs'] : ['thickness', 'width', 'length']
  if (fields.some(field => positiveNumber(values[field]) === null)) return ''
  // Normalize decimal text without rounding dimensions or converting units.
  const clean = value => String(value).trim().replace(/^0+(?=\d)/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '').replace(/^\./, '0.')
  if (material === 'beams') {
    return Object.hasOwn(BEAM_FACTORS, values.beamLength) ? `BEAMS ${clean(values.lbs)}LBS/FT X ${values.beamLength}M` : ''
  }
  return `${MATERIALS[material].name.toUpperCase()} ${clean(values.thickness)}MM X ${clean(values.width)}${material === 'flat' ? 'IN' : 'FT'} X ${clean(values.length)}FT`
}
