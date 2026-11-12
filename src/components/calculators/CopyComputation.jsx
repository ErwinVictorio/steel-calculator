import { useState } from 'react'
import { Button } from '../ui/button'
export function CopyComputation({ text }) {
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(text); setMessage('Computation copied.'); setFallback(false) }
    catch { setMessage('Select and copy the text below.'); setFallback(true) }
  }
  return <div className="copy-computation"><Button variant="outline" disabled={!text} onClick={copy}>Copy computation</Button><p aria-live="polite">{message}</p>{fallback && <textarea aria-label="Computation text to copy" readOnly value={text} onFocus={e => e.target.select()} rows={5} />}</div>
}
