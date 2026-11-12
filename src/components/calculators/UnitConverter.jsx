import { useState } from 'react'
import { Button } from '../ui/button'
import { LENGTH_UNITS, convertLength, decimalInput } from '../../lib/computation-tools.js'
export function UnitConverter({ fields, onApply }) {
  const dimensions = fields.filter(field => Object.hasOwn(LENGTH_UNITS, field.unit || ''))
  const [target, setTarget] = useState(dimensions[0]?.key || '')
  const [from, setFrom] = useState('mm')
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  if (!dimensions.length) return null
  const field = dimensions.find(item => item.key === target)
  const converted = convertLength(value, from, field.unit)
  return <details className="converter"><summary>Need to convert a measurement?</summary><div className="converter-fields">
    <label>Apply to<select aria-label="Convert for field" value={target} onChange={e => { setTarget(e.target.value); setMessage('') }}>{dimensions.map(item => <option key={item.key} value={item.key}>{item.label} ({item.unit})</option>)}</select></label>
    <label>Value<input aria-label="Value to convert" inputMode="decimal" value={value} onChange={e => { setValue(e.target.value); setMessage('') }} placeholder="Enter measurement" /></label>
    <label>From<select aria-label="Convert from unit" value={from} onChange={e => { setFrom(e.target.value); setMessage('') }}>{Object.keys(LENGTH_UNITS).map(unit => <option key={unit}>{unit}</option>)}</select></label>
  </div><div className="converter-result"><span>{converted === null ? `Enter a positive value to convert to ${field.unit}.` : `${decimalInput(converted)} ${field.unit}`}</span><Button disabled={converted === null} onClick={() => { onApply(target, decimalInput(converted)); setMessage(`Applied to ${field.label}.`) }}>Apply</Button></div><p aria-live="polite">{message}</p></details>
}
