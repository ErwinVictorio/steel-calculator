import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { MATERIALS } from '../../data/formulas.js'
import { formatWeight } from '../../lib/calculations.js'
import { parseMeasurementMessage } from '../../lib/measurement-parser.js'
export function PasteMeasurement({ onApply }) {
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  const preview = useMemo(() => parseMeasurementMessage(text), [text])
  return <details className="paste-measurement"><summary>Paste measurement from a message</summary>
    <label htmlFor="measurement-message">Paste one item per line</label>
    <textarea id="measurement-message" rows={4} maxLength={20000} placeholder={"MS PLATE 2mm x 4' x 7.2m = 137.81kls"} value={text} onChange={event => { setText(event.target.value); setNotice('') }} />
    <p className="paste-help">Supports MS Plate, GI Sheet, Checkered Plate, Flat Bar, Base Plate, Triangle Plate and Round Plate. Include a unit for each dimension. Use decimals; for round plates, enter thickness × diameter. A weight after = or - is treated as kg per piece when no weight unit is written.</p>
    {preview.error && <p className="field-error">{preview.error}</p>}
    {text.trim() && !preview.items.length && !preview.error && <p className="field-error">No measurements found. Start a line with a supported material name.</p>}
    {preview.ignored > 0 && <p className="paste-help">Skipped {preview.ignored} other message {preview.ignored === 1 ? 'line' : 'lines'}.</p>}
    <div className="paste-previews">{preview.items.map(item => <article key={item.line} className="paste-preview" aria-label={`Preview line ${item.line}`}>
      <strong>{item.material ? MATERIALS[item.material].name : 'Unrecognized item'} · line {item.line}</strong><p className="pasted-original">{item.original}</p>
      {item.error ? <p className="field-error">{item.error}</p> : <>
        <dl>{item.conversions.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.entered} → <strong>{field.converted} {field.unit}</strong></dd></div>)}</dl>
        <p className="paste-weight">Calculated: <strong>{formatWeight(item.result.perPiece)} kg / piece</strong></p>
        {item.statedWeight !== null && <p className="paste-comparison">Message weight: {formatWeight(item.statedWeight)} kg · Difference (calculated − message): {item.difference > 0 ? '+' : ''}{formatWeight(item.difference)} kg.<br />Compared against one piece. The supplied weight is for reference only.</p>}
        <div className="paste-apply"><span>Apply sets quantity to 1. Adjust it after applying.</span><Button onClick={() => { onApply(item); setNotice(`Applied line ${item.line}. Check the fields below; quantity is 1.`) }}>Apply line {item.line}</Button></div>
      </>}
    </article>)}</div><p className="paste-notice" aria-live="polite">{notice}</p>
  </details>
}
