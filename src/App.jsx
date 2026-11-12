import { useMemo, useState } from 'react'
import { Calculator, RotateCcw, Info, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { verifiedPurlinWidth } from './data/purlin-profiles.js'
import { MATERIALS, initialValues } from './data/formulas.js'
import { calculateWeight } from './lib/calculations.js'
import { generateItemName } from './lib/item-name.js'
import { MaterialSelector } from './components/calculators/MaterialSelector'
import { DimensionFields } from './components/calculators/DimensionFields'
import { WeightResult } from './components/calculators/WeightResult'
import { ItemName } from './components/calculators/ItemName'
import { UnitConverter } from './components/calculators/UnitConverter'
import { CopyComputation } from './components/calculators/CopyComputation'
import { ComputationList } from './components/calculators/ComputationList'
import { computationText } from './lib/computation-tools.js'
import { PasteMeasurement } from './components/calculators/PasteMeasurement'
import './App.css'

export default function App() {
  const [material, setMaterial] = useState('plate')
  const [values, setValues] = useState(() => initialValues('plate'))
  const [touched, setTouched] = useState({})
  const [revision, setRevision] = useState(0)
  const spec = MATERIALS[material]
  const { errors, result } = useMemo(() => calculateWeight(material, values), [material, values])
  const itemName = generateItemName(material, values)
  function update(field, value) {
    setValues(previous => ({ ...previous, ...(material === 'purlins' && ['purlinType', 'thickness', 'height', 'flange'].includes(field) ? { developedWidth: '' } : {}), [field]: value }))
    setRevision(previous => previous + 1)
  }
  function reset(next = material) {
    setValues(initialValues(next))
    setTouched({})
    setRevision(previous => previous + 1)
  }
  function selectMaterial(next) {
    setMaterial(next)
    reset(next)
  }
  const current = result && itemName ? { ...result, name: itemName, material, values: { ...values } } : null
  function editItem(row) {
    setMaterial(row.material)
    setValues({ ...row.values })
    setTouched({})
    setRevision(previous => previous + 1)
    document.querySelector('.dimensions-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const units = spec.fields.filter(field => field.unit && field.key !== 'quantity').map(field => `${field.label}: ${field.unit}`).join(' · ')
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-icon"><Calculator size={22} /></span><span>STEEL<span className="brand-light"> / CALC</span></span></div><span className="topbar-note">Quick, simple weight calculations</span><span className="version">V2.1</span></header>
    <main><div className="page-intro"><div><p className="eyebrow">MATERIAL WEIGHT COMPUTATION</p><h1>Steel Weight Calculator<span>.</span></h1><p className="intro-description">Choose your material. Enter your dimensions. Get the weight.</p></div><div className="intro-icon"><Ruler size={35} strokeWidth={1.4} /></div></div>
      <PasteMeasurement onApply={item => {
        setMaterial(item.material)
        setValues({ ...item.values })
        setTouched({})
        setRevision(previous => previous + 1)
      }} />
      <MaterialSelector material={material} onSelect={selectMaterial} />
      <div className="workspace"><Card className="dimensions-card"><div className="card-heading"><div className="section-label"><span className="step">02</span><h2>Enter material details</h2></div><Button variant="ghost" size="sm" onClick={() => reset()}><RotateCcw size={14} /> Reset</Button></div><p className="card-description">{spec.name} <span> / </span> {spec.basis || 'Enter measurements below'}</p>
        <DimensionFields spec={spec} values={values} touched={touched} errors={errors} onChange={update} onBlur={field => setTouched(previous => ({ ...previous, [field]: true }))} />
        <UnitConverter key={`${material}-${verifiedPurlinWidth(values) ?? 'manual'}`} fields={spec.fields.filter(field => !(material === 'purlins' && verifiedPurlinWidth(values) !== null && field.key === 'developedWidth'))} onApply={update} />
        {spec.note && <p className="material-note">{spec.note}</p>}
        <ItemName key={`${material}-${revision}`} name={itemName} />
        <div className="input-tip"><Info size={16} /><p>Enter values in the fixed units shown. Use the converter above if your measurement uses another unit. Results update automatically.</p></div>
      </Card><div className="result-column"><WeightResult spec={spec} result={result} error={errors.result} /><CopyComputation key={`${material}-${revision}`} text={current ? computationText(current) : ''} /></div></div>
      <ComputationList current={current} onEdit={editItem} />
      <details className="formula-details"><summary>View formula</summary><Card className="formula-card"><div><span className="formula-icon"><Calculator size={20} /></span><div><h2>The calculation behind the number</h2><p>{units}</p></div></div><code>{spec.formula}</code></Card></details>
      <p className="estimate-note"><Info size={15} /> {spec.basis ? 'Known weights use the supplied rating or tagged value.' : 'Estimated weights follow the workbook formulas. Actual material weights may vary.'} Display rounded to 2 decimals; totals use full precision.</p>
    </main><footer><span>STEEL / CALC</span><span>Simple inputs. Clear calculations.</span></footer>
  </div>
}
