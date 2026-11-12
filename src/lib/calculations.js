import { MATERIALS } from '../data/formulas.js'

export function positiveNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (typeof value === 'string' && !/^\d*\.?\d+$/.test(value.trim())) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}
const plateWeight = n => n.thickness * n.width * n.length * 0.7293
const baseWeight = n => n.thickness * (n.width / 25.4 / 12) * (n.length / 25.4 / 12) * 0.7293
const rules = {
  plate: plateWeight,
  base: baseWeight,
  baseInches: n => n.thickness * (n.width / 12) * (n.length / 12) * 0.7293,
  triangle: n => baseWeight(n) / 2,
  round: n => 3.141516 * (n.diameter / 2 * n.diameter / 2) * n.thickness * 7.85 / 1000000,
  flat: n => n.thickness * n.width * n.length * 0.00786 * 25.4,
  linear: n => n.rating * n.length,
  wideImperial: n => n.rating * (n.length * 3.28) / 2.20462,
  angle: n => ((n.width1 * n.width2) - (n.width1 - n.thickness) * (n.width2 - n.thickness)) * n.length * 7.85 / 1000,
  roll: n => n.thickness * n.width * n.length * 0.00786,
  pipe: n => 3.1416 * n.thickness * (n.diameter - n.thickness) * n.length * 0.00786,
  tubular: n => 2 * n.thickness * (n.width1 + n.width2 - 2 * n.thickness) * n.length * 0.00786,
  knownPiece: n => n.weight,
  tagged: n => n.weight / n.quantity,
}
export function calculateWeight(material, values = {}) {
  const spec = MATERIALS[material]
  if (!spec) return { errors: { material: 'Choose a material.' }, result: null }
  const errors = {}, numbers = {}
  for (const field of spec.fields) {
    const value = values[field.key]
    if (field.kind === 'text') {
      if (!field.optional && (typeof value !== 'string' || !value.trim())) errors[field.key] = 'Enter an item description.'
    } else if (field.kind === 'select') {
      if (!field.options.some(option => option.value === (value ?? field.default))) errors[field.key] = 'Choose a valid option.'
    } else {
      numbers[field.key] = positiveNumber(value)
      if (numbers[field.key] === null) errors[field.key] = 'Enter a number greater than zero.'
    }
  }
  if (numbers.quantity !== null && !Number.isSafeInteger(numbers.quantity)) errors.quantity = 'Enter a whole number of pieces.'
  if (spec.rule === 'pipe' && numbers.diameter > 0 && numbers.thickness > 0 && numbers.diameter <= 2 * numbers.thickness) errors.thickness = 'Thickness must be less than half the outside diameter.'
  if (['angle', 'tubular'].includes(spec.rule) && numbers.thickness > 0) {
    const factor = spec.rule === 'tubular' ? 2 : 1
    for (const key of ['width1', 'width2']) if (numbers[key] > 0 && numbers[key] <= factor * numbers.thickness) errors[key] = `Must be greater than ${factor === 2 ? 'twice the' : 'the'} thickness.`
  }
  if (Object.keys(errors).length) return { errors, result: null }
  const perPiece = rules[spec.rule](numbers, values)
  const total = spec.rule === 'tagged' ? numbers.weight : perPiece * numbers.quantity
  if (![perPiece, total].every(value => Number.isFinite(value) && value > 0)) return { errors: { result: 'These inputs are outside the supported calculation range.' }, result: null }
  return { errors, result: { perPiece, total, quantity: numbers.quantity, average: spec.rule === 'tagged' } }
}
export const formatWeight = value => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
