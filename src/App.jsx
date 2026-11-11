import { useMemo, useState } from 'react'
import { Calculator, Copy, Layers, Grid2X2, Columns3, RectangleHorizontal, RotateCcw, ArrowUpRight, Info, Ruler, Weight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MATERIALS } from './data/formulas'
import { calculateWeight, formatWeight } from './lib/calculations'
import { generateItemName } from './lib/item-name'
import './App.css'

const icons = { plate: Layers, checkered: Grid2X2, beams: Columns3, flat: RectangleHorizontal }
const emptyValues = () => ({ thickness: '', width: '', length: '', lbs: '', quantity: '1', beamLength: '6' })

export default function App() {
  const [material, setMaterial] = useState('plate')
  const [values, setValues] = useState(emptyValues)
  const [touched, setTouched] = useState({})
  const [copyStatus, setCopyStatus] = useState(null)
  const itemName = generateItemName(material, values)
  async function copyItemName() {
    try {
      await navigator.clipboard.writeText(itemName)
      setCopyStatus({ name: itemName, message: 'Copied!' })
    } catch {
      setCopyStatus({ name: itemName, message: 'Copy unavailable. Select the item name and copy it manually.' })
    }
  }
  const spec = MATERIALS[material]
  const { errors, result } = useMemo(() => calculateWeight(material, values), [material, values])
  const update = (field, value) => {
    setCopyStatus(null)
    setValues(previous => ({ ...previous, [field]: value }))
  }
  function reset() {
    setValues(emptyValues())
    setTouched({})
    setCopyStatus(null)
  }
  function selectMaterial(nextMaterial) {
    setMaterial(nextMaterial)
    reset()
  }
  function field(name, label) {
    const invalid = errors[name] && (touched[name] || values[name] !== '')
    const unit = { thickness: 'mm', width: material === 'flat' ? 'inches' : 'feet', length: 'feet', lbs: 'lb/ft', quantity: 'pcs' }[name]
    return <div className="field" key={name}>
      <label htmlFor={name}>{label}</label>
      <div className="input-row">
        <Input id={name} type="text" inputMode={name === 'quantity' ? 'numeric' : 'decimal'} value={values[name]} placeholder={name === 'quantity' ? '1' : '0.00'} onChange={event => update(name, event.target.value)} onBlur={() => setTouched(previous => ({ ...previous, [name]: true }))} aria-invalid={Boolean(invalid)} aria-describedby={`${name}-unit${invalid ? ` ${name}-error` : ''}`} autoComplete="off" />
        <span id={`${name}-unit`} className="unit-label">{unit}</span>
      </div>
      {invalid && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}
    </div>
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-icon"><Calculator size={22} /></span><span>STEEL<span className="brand-light"> / CALC</span></span></div><span className="topbar-note">A practical tool for steel materials</span><span className="version">V1.0</span></header>
    <main>
      <div className="page-intro"><div><p className="eyebrow">MATERIAL WEIGHT COMPUTATION</p><h1>Steel Weight Calculator<span>.</span></h1><p className="intro-description">Choose your material. Enter your dimensions. Get the weight.</p></div><div className="intro-icon"><Ruler size={35} strokeWidth={1.4} /></div></div>
      <section aria-labelledby="material-title" className="material-section"><div className="section-label"><span className="step">01</span><h2 id="material-title">Choose a material</h2></div><div className="material-grid">{Object.entries(MATERIALS).map(([key, item]) => {
        const Icon = icons[key]
        return <button key={key} className={`material-option ${material === key ? 'selected' : ''}`} aria-pressed={material === key} onClick={() => selectMaterial(key)}><div className="material-top"><Icon size={25} strokeWidth={1.5} /><span className="selection-dot" /></div><strong>{item.name}</strong><span>{item.description}</span></button>
      })}</div></section>
      <div className="workspace"><Card className="dimensions-card"><div className="card-heading"><div className="section-label"><span className="step">02</span><h2>Enter {material === 'beams' ? 'beam details' : 'dimensions'}</h2></div><Button variant="ghost" size="sm" onClick={() => reset()}><RotateCcw size={14} /> Reset</Button></div><p className="card-description">{spec.name} <span> / </span> All fields are required</p>
        <div className="fields-grid">{material === 'beams' ? <>{field('lbs', 'LBS')}<div className="field"><label htmlFor="beamLength">Beam length</label><select id="beamLength" value={values.beamLength} onChange={event => update('beamLength', event.target.value)}><option value="6">6 meters</option><option value="12">12 meters</option></select></div></> : ['thickness', 'width', 'length'].map(name => field(name, name[0].toUpperCase() + name.slice(1)))}{field('quantity', 'Quantity')}</div>
        {material === 'checkered' && <p className="card-description">Includes 5 kg per piece before multiplying by quantity.</p>}
        <div className="item-name-field">
          <label htmlFor="item-name">Item Name</label>
          <div className="item-name-row">
            <textarea id="item-name" readOnly rows={2} value={itemName} placeholder="Enter dimensions to generate the item name" onFocus={event => event.target.select()} />
            <Button type="button" variant="outline" disabled={!itemName} onClick={copyItemName}><Copy size={15} /> Copy</Button>
          </div>
          <p role="status">{copyStatus?.name === itemName ? copyStatus.message : ''}</p>
        </div>
        <div className="input-tip"><Info size={16} /><p>Enter values in the units shown. If your measurements use different units, convert them manually first. Results update automatically.</p></div>
      </Card>
      <Card className="result-card"><div className="result-heading"><span><Weight size={18} /> Weight estimate</span><span className={`status ${result ? 'ready' : ''}`}>{result ? 'Calculated' : 'Awaiting inputs'}</span></div><div className="total-block" aria-live="polite" aria-atomic="true"><p>TOTAL WEIGHT</p><div className="weight-value">{result ? formatWeight(result.total) : '—'} <span>kg</span></div><p className="total-caption">{result ? `For ${result.quantity.toLocaleString()} ${result.quantity === 1 ? 'piece' : 'pieces'} of ${spec.name.toLowerCase()}` : 'Enter valid details to see your estimate.'}</p></div><div className="result-details"><div><span>Weight per piece</span><strong>{result ? `${formatWeight(result.perPiece)} kg` : '—'}</strong></div><div><span>Quantity</span><strong>{result ? `${result.quantity.toLocaleString()} pcs` : '—'}</strong></div></div>{errors.result && <p role="alert" className="field-error">{errors.result}</p>}<div className="result-footer"><span className="small-dot" /> Calculated in your browser <ArrowUpRight size={14} /></div></Card></div>
      <Card className="formula-card"><div><span className="formula-icon"><Calculator size={20} /></span><div><h2>The calculation behind the number</h2><p>{material === 'beams' ? '6 meters uses factor 20; 12 meters uses factor 40.' : 'Entered values are used directly in the formula.'}</p></div></div><code>{spec.formula}</code></Card>
      <p className="estimate-note"><Info size={15} /> Estimated weights use the supplied formulas. Actual material weights may vary. Display rounded to 2 decimals; totals use full precision.</p>
    </main><footer><span>STEEL / CALC</span><span>Simple inputs. Clear calculations.</span></footer>
  </div>
}
