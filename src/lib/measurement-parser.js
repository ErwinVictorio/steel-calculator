import { MATERIALS, initialValues } from '../data/formulas.js'
import { calculateWeight } from './calculations.js'
import { convertLength, decimalInput } from './computation-tools.js'

const aliases = [
  [/^(?:M\.?\s*S\.?\s*PLATE)\b/i, 'plate', ['thickness', 'width', 'length']],
  [/^(?:CHECKERED|CHEQUERED)\s+PLATE\b/i, 'checkered', ['thickness', 'width', 'length']],
  [/^FLAT\s+BAR\b/i, 'flat', ['thickness', 'width', 'length']],
  [/^(?:TRIANGLE|TRIANGULAR)(?:\s+BASE)?\s+PLATE\b/i, 'triangle', ['thickness', 'width', 'length']],
  [/^(?:ROUND|CIRCULAR)(?:\s+BASE)?\s+PLATE\b/i, 'round', ['thickness', 'diameter']],
  [/^(?:RECTANGULAR\s+)?BASE\s+PLATE\b/i, 'base', ['thickness', 'width', 'length']],
]
const unitAliases = { mm: 'mm', millimeter: 'mm', millimeters: 'mm', millimetre: 'mm', millimetres: 'mm', m: 'meters', meter: 'meters', meters: 'meters', metre: 'meters', metres: 'meters', ft: 'feet', foot: 'feet', feet: 'feet', "'": 'feet', in: 'inches', inch: 'inches', inches: 'inches', '"': 'inches' }
export function parseMeasurementMessage(text) {
  if (typeof text !== 'string' || text.length > 20000) return { items: [], ignored: 0, error: 'Paste a message of up to 20,000 characters.' }
  const items = []
  let ignored = 0
  for (const [index, original] of text.split(/\r?\n/).entries()) {
    const line = original.trim().replace(/^[•-]\s+/, '').replace(/[′’‘]/g, "'").replace(/[″“”]/g, '"')
    if (!line) continue
    const match = aliases.find(([regex]) => regex.test(line))
    if (!match) {
      if (/\d.*[x×].*\d/i.test(line)) items.push({ line: index + 1, original, error: 'Material not recognized. Use a supported material name, or enter this item manually.' })
      else ignored++
      continue
    }
    const [regex, material, keys] = match
    const item = { line: index + 1, original, material }
    let dimensions = line.replace(regex, '').trim()
    let statedWeight = null
    if (dimensions.includes('=')) {
      const parts = dimensions.split('=')
      const weight = parts.length === 2 && parts[1].trim().match(/^(\d+(?:\.\d+)?)\s*(?:kg|kgs|kls|kilos|kilograms?)(?:\s*(?:\/\s*(?:pc|piece)|per\s+piece))?\s*$/i)
      if (!weight || !Number.isFinite(Number(weight[1])) || Number(weight[1]) <= 0) {
        items.push({ ...item, error: 'Use “= 137.81 kg” for the supplied weight. Enter quantities or other notes separately.' }); continue
      }
      statedWeight = Number(weight[1])
      dimensions = parts[0].trim()
    }
    const parts = dimensions.split(/\s*[x×*]\s*/i)
    if (parts.length !== keys.length) {
      items.push({ ...item, error: `Expected ${keys.length} dimensions in this order: ${keys.join(', ')}. Put one item on each line.` }); continue
    }
    const values = initialValues(material)
    const conversions = []
    let error = ''
    for (let i = 0; i < keys.length; i++) {
      const token = parts[i].trim().match(/^(\d*\.?\d+)\s*([a-z]+|['"])\s*$/i)
      const from = token && unitAliases[token[2].toLowerCase()]
      const field = MATERIALS[material].fields.find(field => field.key === keys[i])
      const converted = from ? convertLength(token[1], from, field.unit) : null
      if (converted === null) { error = `Add a positive decimal value and unit (mm, inches, feet or meters) for ${field.label.toLowerCase()}. Fractions and missing units need manual entry.`; break }
      values[field.key] = decimalInput(converted)
      conversions.push({ label: field.label, entered: `${token[1]} ${from}`, converted: values[field.key], unit: field.unit })
    }
    if (error) { items.push({ ...item, error }); continue }
    const calculation = calculateWeight(material, values)
    if (!calculation.result) { items.push({ ...item, error: Object.values(calculation.errors).join(' ') }); continue }
    items.push({ ...item, values, conversions, result: calculation.result, statedWeight, difference: statedWeight === null ? null : calculation.result.perPiece - statedWeight })
  }
  return { items, ignored, error: null }
}
