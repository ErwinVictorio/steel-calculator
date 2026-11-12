import { useState } from 'react'
import { Button } from '../ui/button'
import { formatWeight } from '../../lib/calculations.js'
import { grandTotal, summaryCsv, summaryText } from '../../lib/computation-tools.js'
export function ComputationList({ current, onEdit }) {
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(false)
  function save() {
    if (!current) return
    const next = editing ? rows.map(row => row.id === editing ? { ...current, id: editing } : row) : [...rows, { ...current, id: crypto.randomUUID() }]
    if (!Number.isFinite(grandTotal(next))) { setMessage('Grand total is too large. Reduce the values.'); return }
    setRows(next); setEditing(null); setFallback(false); setMessage(editing ? 'Item updated.' : 'Item added to the list.')
  }
  async function copy() {
    try { await navigator.clipboard.writeText(summaryText(rows)); setMessage('List copied.'); setFallback(false) }
    catch { setFallback(true); setMessage('Select and copy the list below.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([summaryCsv(rows)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'steel-weight-computation.csv'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="computation-list" aria-labelledby="list-title"><div className="list-heading"><div><h2 id="list-title">Computation list</h2><p>Add calculated items to get a grand total. This list clears when you reload.</p></div><Button disabled={!current} onClick={save}>{editing ? 'Update item' : 'Add to list'}</Button></div>
    {editing && <div className="editing-note">Editing an item. Change the values above, then choose Update item. <button onClick={() => { setEditing(null); setMessage('Edit cancelled. The saved item is unchanged.') }}>Cancel edit</button></div>}
    {!rows.length ? <p className="empty-list">Your list is empty. Calculate an item above, then select Add to list.</p> : <><div className="list-table"><table><thead><tr><th>Item name</th><th>Qty</th><th>kg / piece</th><th>Total kg</th><th className="no-print">Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.name}{row.average && <small>Average per piece · tagged batch total</small>}</td><td>{row.quantity}</td><td>{formatWeight(row.perPiece)}</td><td>{formatWeight(row.total)}</td><td className="row-actions no-print"><button aria-label={`Edit ${row.name}`} onClick={() => { setEditing(row.id); onEdit(row); setMessage('Item loaded for editing.') }}>Edit</button><button aria-label={`Remove ${row.name}`} onClick={() => { setRows(previous => previous.filter(item => item.id !== row.id)); if (editing === row.id) setEditing(null); setMessage('Item removed.'); setFallback(false) }}>Remove</button></td></tr>)}</tbody></table></div><div className="grand-total">Grand total <strong>{formatWeight(grandTotal(rows))} kg</strong></div><div className="list-toolbar no-print"><Button variant="outline" onClick={copy}>Copy list</Button><Button variant="outline" onClick={() => window.print()}>Print</Button><Button variant="outline" onClick={download}>Export CSV</Button><span>CSV opens in Excel. Full precision is retained.</span></div></>}
    <p className="no-print" aria-live="polite">{message}</p>{fallback && <textarea className="no-print" aria-label="List text to copy" rows={8} value={summaryText(rows)} readOnly onFocus={e => e.target.select()} />}
  </section>
}
