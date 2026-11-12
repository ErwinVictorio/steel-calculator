import { positiveNumber, formatWeight } from './calculations.js'
export const LENGTH_UNITS = { mm: 0.001, inches: 0.0254, feet: 0.3048, meters: 1 }
export function convertLength(value, from, to) {
  const n = positiveNumber(value)
  if (n === null || !Object.hasOwn(LENGTH_UNITS, from) || !Object.hasOwn(LENGTH_UNITS, to)) return null
  const converted = n * LENGTH_UNITS[from] / LENGTH_UNITS[to]
  return Number.isFinite(converted) && converted > 0 ? converted : null
}
export const decimalInput = value => value.toLocaleString('en-US', { useGrouping: false, maximumSignificantDigits: 21 })
export function computationText(row) {
  return `${row.name}\nQuantity: ${row.quantity} pcs\n${row.average ? 'Average weight/piece' : 'Weight/piece'}: ${formatWeight(row.perPiece)} kg\nTotal weight: ${formatWeight(row.total)} kg`
}
export const grandTotal = rows => rows.reduce((total, row) => total + row.total, 0)
export function summaryText(rows) {
  return rows.map(computationText).join('\n\n') + `\n\nGrand total: ${formatWeight(grandTotal(rows))} kg`
}
export function summaryCsv(rows) {
  const quote = value => {
    let text = String(value)
    if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text
    return `"${text.replaceAll('"', '""')}"`
  }
  const data = [['Item name', 'Quantity (pcs)', 'Weight per piece (kg)', 'Total weight (kg)', 'Basis'], ...rows.map(row => [row.name, row.quantity, row.perPiece, row.total, row.average ? 'Tagged total; per-piece is average' : 'Per-piece calculation']), ['Grand total', '', '', grandTotal(rows), '']]
  return '\uFEFF' + data.map(row => row.map(quote).join(',')).join('\r\n')
}
