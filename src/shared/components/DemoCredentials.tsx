import { Info } from 'lucide-react'

/** POC-only hint. Remove when the real backend is connected. */
export const DemoCredentials = ({ email, password }: { email: string; password: string }) => (
  <div className="mt-6 flex gap-3 rounded-lg border border-coal-500 bg-coal-800 p-4 text-sm text-steel">
    <Info size={18} className="mt-0.5 shrink-0 text-ember" />
    <p>
      <span className="font-semibold text-zinc-100">POC demo account</span>
      <br />
      {email} · {password}
    </p>
  </div>
)
