import { MATERIALS } from '../data/formulas.js'
import { calculateWeight } from './calculations.js'
const clean = value => String(value).trim().replace(/^0+(?=\d)/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '').replace(/^\./, '0.')
export function generateItemName(material, values) {
  const spec = MATERIALS[material]
  if (!spec || !calculateWeight(material, { ...values, quantity: '1' }).result) return ''
  if (material === 'purlins') return `${values.purlinType || 'Z'}-PURLIN ${clean(values.thickness)}MM X ${clean(values.height)}MM X ${clean(values.flange)}MM X ${clean(values.length)}M`
  if (spec.basis) return values.description.trim().toUpperCase()
  const name = material === 'plate' ? (values.plateType || 'MS PLATE') : { baseInches: 'BASE PLATE', beams: 'WIDE FLANGE', wideMetric: 'WIDE FLANGE' }[material] || spec.name.toUpperCase()
  const dimensions = spec.fields.filter(field => !field.kind && field.key !== 'quantity').map(field => `${clean(values[field.key])}${field.suffix}`)
  return `${name}${values.profile?.trim() ? ` ${values.profile.trim().toUpperCase()}` : ''} ${dimensions.join(' X ')}`
}
