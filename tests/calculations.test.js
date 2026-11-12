import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calculateWeight, positiveNumber, formatWeight } from '../src/lib/calculations.js'
import { MATERIALS, initialValues } from '../src/data/formulas.js'
import { generateItemName } from '../src/lib/item-name.js'
const fixtures = JSON.parse(readFileSync(new URL('./fixtures/workbook-weights.json', import.meta.url)))
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`)

test('nonzero source workbook rows match the actual calculator engine', () => {
  for (const sample of fixtures) {
    const { result, errors } = calculateWeight(sample.material, sample.values)
    assert.ok(result, `${sample.source}: ${JSON.stringify(errors)}`)
    near(result.total, sample.expectedTotal)
    near(result.perPiece * result.quantity, sample.expectedTotal)
  }
})
const examples = [
  ['plate', { thickness: '5.5', width: '4', length: '12' }, 192.5352],
  ['checkered', { thickness: '2', width: '4', length: '8' }, 46.6752],
  ['flat', { thickness: '8', width: '3.34', length: '6' }, 32.00692608],
  ['base', { thickness: '12', width: '300', length: '300' }, 8.478129456258912],
  ['baseInches', { thickness: '25', width: '12', length: '16' }, 24.31],
  ['triangle', { thickness: '10', width: '150', length: '200' }, 1.17751798003596],
  ['round', { thickness: '3', diameter: '150' }, 0.416152697625],
  ['beams', { rating: '16', length: '6' }, 142.82733532309425],
  ['wideMetric', { rating: '16.9', length: '2.3' }, 38.87],
  ['channel', { rating: '6.92', length: '6' }, 41.52],
  ['angle', { thickness: '6', width1: '50', width2: '50', length: '6' }, 26.5644],
  ['roll', { thickness: '1.1', width: '202', length: '6' }, 10.478952],
  ['sheetPile', { rating: '48', length: '12' }, 576],
  ['pipe', { thickness: '3.38', diameter: '33.4', length: '6' }, 15.0332220694656],
  ['tubular', { thickness: '1.5', width1: '25', width2: '25', length: '6' }, 6.64956],
  ['knownPiece', { weight: '15.1234', description: 'Supplier bar' }, 15.1234],
  ['knownLinear', { rating: '3.2', length: '2.5', description: 'Supplier section' }, 8],
]
for (const [material, values, expected] of examples) test(`${material}: per-piece, quantity and item name`, () => {
  for (const quantity of ['1', '3']) {
    const { result } = calculateWeight(material, { ...values, quantity })
    assert.ok(result)
    near(result.perPiece, expected)
    near(result.total, expected * Number(quantity))
    assert.ok(generateItemName(material, values))
  }
})
test('tagged total is never multiplied; per-piece is an average', () => {
  const { result } = calculateWeight('tagged', { weight: '100', description: 'Coil batch', quantity: '4' })
  assert.equal(result.total, 100)
  assert.equal(result.perPiece, 25)
  assert.equal(result.average, true)
})
test('precision, naming and Excel rules replace previous rules', () => {
  const flat = { thickness: '8.00', width: '3.340', length: '6', quantity: '1' }
  assert.equal(formatWeight(calculateWeight('flat', flat).result.total), '32.01')
  assert.equal(generateItemName('flat', flat), 'FLAT BAR 8MM X 3.34IN X 6M')
  assert.equal(generateItemName('plate', { thickness: '5.50', width: '4', length: '12' }), 'MS PLATE 5.5MM X 4FT X 12FT')
  assert.equal(generateItemName('plate', { thickness: '1', width: '4', length: '8', plateType: 'GI SHEET' }), 'GI SHEET 1MM X 4FT X 8FT')
  near(calculateWeight('checkered', { thickness: '2', width: '4', length: '8', quantity: '1033' }).result.total, 48215.4816)
  assert.equal(calculateWeight('beams', { lbs: '22', beamLength: '6', quantity: '1' }).result, null)
})
test('empty states and invalid dimensions never produce results or copyable names', () => {
  for (const material of Object.keys(MATERIALS)) {
    assert.equal(calculateWeight(material, initialValues(material)).result, null)
    assert.equal(generateItemName(material, initialValues(material)), '')
  }
  const values = { thickness: '6', width: '4', length: '8', quantity: '1' }
  for (const invalid of ['', ' ', '-1', '0', 'bad', 'Infinity', '0x10', '1,000']) {
    assert.equal(positiveNumber(invalid), null)
    assert.equal(calculateWeight('plate', { ...values, thickness: invalid }).result, null)
  }
  for (const quantity of ['1.5', '0', '-1', String(Number.MAX_SAFE_INTEGER + 1)]) assert.equal(calculateWeight('plate', { ...values, quantity }).result, null)
  for (const thickness of [Number.MIN_VALUE, Number.MAX_VALUE]) assert.equal(calculateWeight('plate', { ...values, thickness, width: thickness }).result, null)
  assert.equal(calculateWeight('plate', { ...values, plateType: 'unknown' }).result, null)
  assert.equal(calculateWeight('missing', values).result, null)
})
test('hollow sections and angle geometry boundaries', () => {
  for (const diameter of ['4', '3']) assert.equal(calculateWeight('pipe', { diameter, thickness: '2', length: '6', quantity: '1' }).result, null)
  assert.equal(generateItemName('pipe', { diameter: '4', thickness: '2', length: '6' }), '')
  for (const material of ['angle', 'tubular']) assert.equal(calculateWeight(material, { thickness: '5', width1: '5', width2: '50', length: '6', quantity: '1' }).result, null)
  assert.equal(calculateWeight('tubular', { thickness: '5', width1: '10', width2: '50', length: '6', quantity: '1' }).result, null)
})

test('converter, full precision totals, CSV escaping and invalid units', async () => {
  const { convertLength, decimalInput, summaryCsv, grandTotal } = await import('../src/lib/computation-tools.js')
  near(convertLength('25.4', 'mm', 'inches'), 1)
  near(convertLength('6', 'meters', 'feet'), 19.68503937007874)
  for (const invalid of ['', '-1', '0', 'bad']) assert.equal(convertLength(invalid, 'mm', 'inches'), null)
  assert.equal(convertLength('1', 'kg', 'mm'), null)
  assert.equal(positiveNumber(decimalInput(1e-12)), 1e-12)
  const rows = [{ name: '=HYPERLINK("x")', quantity: 1, perPiece: 0.004, total: 0.004 }, { name: 'A, B', quantity: 1, perPiece: 0.004, total: 0.004 }]
  near(grandTotal(rows), 0.008)
  assert.equal(formatWeight(grandTotal(rows)), '0.01')
  assert.ok(summaryCsv(rows).includes("'=HYPERLINK"))
  assert.ok(summaryCsv(rows).includes('"A, B"'))
  assert.equal(calculateWeight('catalogue', {}).result, null)
})
