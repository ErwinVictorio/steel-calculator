import { Input } from '../ui/input'
export function DimensionFields({ spec, values, touched, errors, onChange, onBlur }) {
  return <div className="fields-grid">{spec.fields.map(field => {
    const invalid = errors[field.key] && (touched[field.key] || Boolean(values[field.key]))
    const description = [field.unit && `${field.key}-unit`, field.help && `${field.key}-help`, invalid && `${field.key}-error`].filter(Boolean).join(' ') || undefined
    const common = { id: field.key, value: values[field.key] ?? '', onChange: event => onChange(field.key, event.target.value), onBlur: () => onBlur(field.key), 'aria-invalid': Boolean(invalid), 'aria-describedby': description }
    return <div key={field.key} className={`field ${field.kind === 'text' ? 'wide-field' : ''}`}>
      <label htmlFor={field.key}>{field.label}{field.optional ? ' (optional)' : ''}</label>
      {field.kind === 'select' ? <select {...common}>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <div className="input-row"><Input {...common} type="text" inputMode={field.kind === 'text' ? 'text' : field.key === 'quantity' ? 'numeric' : 'decimal'} placeholder={field.kind === 'text' ? 'Enter specification' : field.key === 'quantity' ? '1' : '0.00'} autoComplete="off" maxLength={field.kind === 'text' ? 160 : undefined} />{field.unit && <span id={`${field.key}-unit`} className="unit-label">{field.unit}</span>}</div>}
      {field.key === 'length' && field.unit === 'meters' && <div className="length-presets"><button type="button" onClick={() => onChange('length', '6')}>6 m</button><button type="button" onClick={() => onChange('length', '12')}>12 m</button><span>or enter a cut length</span></div>}
      {field.help && <p className="field-help" id={`${field.key}-help`}>{field.help}</p>}
      {invalid && <p className="field-error" id={`${field.key}-error`}>{errors[field.key]}</p>}
    </div>
  })}</div>
}
