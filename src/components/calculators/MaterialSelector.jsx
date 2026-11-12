import { Layers, Columns3, Circle, Weight } from 'lucide-react'
import { GROUPS, MATERIALS } from '../../data/formulas.js'
const icons = { plates: Layers, sections: Columns3, tubes: Circle, known: Weight }
export function MaterialSelector({ material, onSelect }) {
  const currentGroup = MATERIALS[material].group
  return <section aria-labelledby="material-title" className="material-section">
    <div className="section-label"><span className="step">01</span><h2 id="material-title">Choose a material</h2></div>
    <div className="group-tabs" aria-label="Material groups">{Object.entries(GROUPS).map(([group, label]) => <button type="button" key={group} aria-pressed={currentGroup === group} onClick={() => onSelect(Object.keys(MATERIALS).find(key => MATERIALS[key].group === group))}>{label}</button>)}</div>
    <div className="material-grid">{Object.entries(MATERIALS).filter(([, spec]) => spec.group === currentGroup).map(([key, spec]) => {
      const Icon = icons[spec.group]
      return <button type="button" key={key} className={`material-option ${material === key ? 'selected' : ''}`} aria-pressed={material === key} onClick={() => onSelect(key)}><div className="material-top"><Icon size={23} strokeWidth={1.5} /><span className="selection-dot" /></div><strong>{spec.name}</strong><span>{spec.description}</span></button>
    })}</div>
  </section>
}
