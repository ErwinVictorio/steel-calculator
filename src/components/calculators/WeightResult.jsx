import { Weight, ArrowUpRight } from 'lucide-react'
import { Card } from '../ui/card'
import { formatWeight } from '../../lib/calculations.js'
export function WeightResult({ spec, result, error }) {
  return <Card className="result-card"><div className="result-heading"><span><Weight size={18} /> {spec.basis || 'Weight estimate'}</span><span className={`status ${result ? 'ready' : ''}`}>{result ? 'Calculated' : 'Awaiting inputs'}</span></div>
    <div className="total-block" aria-live="polite" aria-atomic="true"><p>TOTAL WEIGHT</p><div className="weight-value">{result ? formatWeight(result.total) : '—'} <span>kg</span></div><p className="total-caption">{result ? `For ${result.quantity.toLocaleString()} ${result.quantity === 1 ? 'piece' : 'pieces'}` : 'Enter valid details to see your estimate.'}</p></div>
    <div className="result-details"><div><span>{spec.rule === 'tagged' ? 'Average weight per piece' : 'Weight per piece'}</span><strong>{result ? `${formatWeight(result.perPiece)} kg` : '—'}</strong></div><div><span>Quantity</span><strong>{result ? `${result.quantity.toLocaleString()} pcs` : '—'}</strong></div></div>
    {error && <p role="alert" className="field-error">{error}</p>}
    <p className="result-explanation">{spec.rule === 'tagged' ? 'The entered batch total is retained. Average weight is total ÷ quantity.' : 'Total = complete per-piece weight × quantity.'}</p>
    <div className="result-footer"><span className="small-dot" /> Calculated in your browser <ArrowUpRight size={14} /></div>
  </Card>
}
