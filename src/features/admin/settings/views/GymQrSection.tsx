import { Printer, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Button } from '../../../../shared/components/Button'
import { CopyButton } from '../../../../shared/components/CopyButton'
import { useGymQrViewModel } from '../viewModels/useGymQrViewModel'

/** The static check-in QR members scan at the entrance. The poster part is what gets printed. */
export const GymQrSection = () => {
  const vm = useGymQrViewModel()
  const [confirmRegenerate, setConfirmRegenerate] = useState(false) // UI-local

  return (
    <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Check-in QR</h2>
      <p className="mt-1 text-sm text-steel">
        Print this and post it at the entrance, or show it on a screen. Members scan it with their phone camera to log a visit.
      </p>

      {vm.error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</div>
      )}
      {vm.isLoading && <p className="mt-4 text-sm text-steel">Loading QR…</p>}

      {vm.qr && (
        <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start">
          {/* Printable poster */}
          <div className="print-area mx-auto w-full max-w-[300px] rounded-xl bg-white p-6 text-center text-charcoal md:mx-0">
            <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-ember">Scan to check in</p>
            <div className="mx-auto mt-3 w-fit">
              <QRCodeSVG value={vm.link} size={220} level="M" aria-label="Gym check-in QR code" />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight">{vm.qr.gymName}</p>
            <p className="mt-1 text-xs text-zinc-600">Log in on SteelSync PH first, then scan with your phone camera.</p>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-steel">Check-in link</span>
              <p className="break-all rounded bg-coal-900 px-3 py-2 font-mono text-xs text-steel">{vm.link}</p>
              <div className="mt-2">
                <CopyButton text={vm.link} />
              </div>
            </div>
            <Button type="button" onClick={vm.print}>
              <Printer size={18} /> Print poster
            </Button>

            <div className="rounded-lg border border-coal-600 p-4">
              <p className="text-sm font-semibold">QR shared outside the gym?</p>
              <p className="mt-1 text-sm text-steel">Make a new QR. Old posters and photos of the QR stop working right away.</p>
              {confirmRegenerate ? (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={vm.isRegenerating}
                    onClick={async () => {
                      await vm.regenerate()
                      setConfirmRegenerate(false)
                    }}
                    className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {vm.isRegenerating ? 'Making new QR…' : 'Yes, replace the QR'}
                  </button>
                  <button type="button" onClick={() => setConfirmRegenerate(false)} className="text-xs text-steel hover:text-zinc-100">Cancel</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRegenerate(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw size={14} /> Make a new QR
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
