import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export const CopyButton = ({ text, label = 'Copy link' }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false) // UI-local
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the link is still visible to copy by hand */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded border border-coal-500 px-3 py-1.5 text-xs font-semibold text-steel hover:border-steel hover:text-zinc-100"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? 'Copied' : label}
    </button>
  )
}
