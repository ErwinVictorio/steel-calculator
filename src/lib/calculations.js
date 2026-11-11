import { BEAM_FACTORS, MATERIALS } from '../data/formulas.js'

export function positiveNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (typeof value === 'string' && !/^\d*\.?\d+$/.test(value.trim())) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function calculateWeight(material, values) {
  const spec = MATERIALS[material]
  const errors = {}
  if (!spec) return { errors: { material: 'Choose a material.' }, result: null }
  const fields = material === 'beams' ? ['lbs', 'quantity'] : ['thickness', 'width', 'length', 'quantity']
  const numbers = {}
  for (const field of fields) {
    numbers[field] = positiveNumber(values[field])
    if (numbers[field] === null) errors[field] = 'Enter a number greater than zero.'
  }
  if (numbers.quantity !== null && !Number.isSafeInteger(numbers.quantity)) errors.quantity = 'Enter a whole number of pieces.'
  if (material === 'beams' && !Object.hasOwn(BEAM_FACTORS, values.beamLength)) errors.beamLength = 'Choose 6 or 12 meters.'
  if (Object.keys(errors).length) return { errors, result: null }
  const base = material === 'beams'
    ? numbers.lbs * BEAM_FACTORS[values.beamLength] / 2.2
    : numbers.thickness * numbers.width * numbers.length * spec.coefficient
  const perPiece = base + (material === 'checkered' ? 5 : 0)
  const total = perPiece * numbers.quantity
  if (![perPiece, total].every(value => Number.isFinite(value) && value > 0)) return { errors: { result: 'These dimensions are outside the supported range.' }, result: null }
  return { errors, result: { perPiece, total, quantity: numbers.quantity } }
}

export const formatWeight = value => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
