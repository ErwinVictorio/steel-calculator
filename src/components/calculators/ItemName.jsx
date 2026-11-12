import { useRef, useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '../ui/button'
export function ItemName({ name }) {
  const [status, setStatus] = useState('')
  const attempt = useRef(0)
  async function copy() {
    const id = ++attempt.current
    try {
      await navigator.clipboard.writeText(name)
      if (id === attempt.current) setStatus('Copied!')
    } catch {
      if (id === attempt.current) setStatus('Copy unavailable. Select the item name and copy it manually.')
    }
  }
  return <div className="item-name-field"><label htmlFor="item-name">Item Name</label><div className="item-name-row"><textarea id="item-name" readOnly rows={2} value={name} placeholder="Enter valid details to generate the item name" onFocus={event => event.target.select()} /><Button type="button" variant="outline" disabled={!name} onClick={copy}><Copy size={15} /> Copy</Button></div><p role="status">{status}</p></div>
}
