import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateWeight, positiveNumber, formatWeight } from '../src/lib/calculations.js'

const values = { thickness: '6', width: '4', length: '8', quantity: '3' }
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`)

test('MS plate uses supplied constant and full precision quantity multiplication', () => {
  const { result } = calculateWeight('plate', values)
  near(result.perPiece, 140.0256)
  near(result.total, 420.0768)
  assert.equal(formatWeight(result.total), '420.08')
})
test('MS plate uses entered values directly for the actual-system example', () => {
  const { result } = calculateWeight('plate', { thickness: '5.5', width: '4', length: '12', quantity: '1' })
  near(result.perPiece, 192.5352)
  assert.equal(formatWeight(result.total), '192.54')
})
test('checkered adds 5 kg per piece before multiplying quantity', () => {
  near(calculateWeight('checkered', values).result.total, 435.0768)
  near(calculateWeight('checkered', values).result.perPiece, 145.0256)
})
test('beam length switches factors 20 and 40 without changing supplied conversion', () => {
  for (const [beamLength, expected] of [['6', 200], ['12', 400]]) {
    near(calculateWeight('beams', { lbs: '22', beamLength, quantity: '2' }).result.perPiece, expected)
    near(calculateWeight('beams', { lbs: '22', beamLength, quantity: '2' }).result.total, expected * 2)
  }
  assert.equal(calculateWeight('beams', { lbs: '22', beamLength: '8', quantity: '2' }).result, null)
})
test('flat bar applies the original constant directly', () => {
  near(calculateWeight('flat', { thickness: '6', width: '2', length: '6', quantity: '4' }).result.total, 17.5104)
})
test('empty, negative, nonnumeric, zero and fractional quantities suppress results', () => {
  for (const invalid of ['', ' ', '-1', '0', 'no', 'Infinity', '0x10', '1,000']) {
    assert.equal(positiveNumber(invalid), null)
    assert.equal(calculateWeight('plate', { ...values, thickness: invalid }).result, null)
  }
  assert.equal(calculateWeight('plate', { ...values, quantity: '1.5' }).result, null)
})
test('overflow and underflow never display valid results', () => {
  assert.equal(calculateWeight('plate', { ...values, thickness: Number.MAX_VALUE, width: Number.MAX_VALUE }).result, null)
  assert.equal(calculateWeight('plate', { ...values, thickness: Number.MIN_VALUE, width: Number.MIN_VALUE }).result, null)
})


