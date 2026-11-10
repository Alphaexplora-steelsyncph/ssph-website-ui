import { Printer, RefreshCw, Undo2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../../../shared/components/Button'
import { CopyButton } from '../../../../shared/components/CopyButton'
import type { SettingsVM } from '../viewModels/useSettingsViewModel'

/** The static check-in QR members scan at the entrance. The poster part is what gets printed. */
export const GymQrSection = ({ vm }: { vm: SettingsVM }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="font-display text-2xl font-bold uppercase">Check-in QR</h2>
    <p className="mt-1 text-sm text-steel">
      Print this and post it at the entrance, or show it on a screen. Members scan it with their phone camera to log a visit.
    </p>

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

          {vm.editing && (
            <div className="rounded-lg border border-coal-600 p-4">
              <p className="text-sm font-semibold">QR shared outside the gym?</p>
              <p className="mt-1 text-sm text-steel">Make a new QR. Old posters and photos of the QR stop working once you press Done.</p>
              {vm.replaceQr ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span role="status" className="rounded bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300">
                    A new QR will be made when you press Done
                  </span>
                  <button type="button" onClick={() => vm.setReplaceQr(false)} className="inline-flex items-center gap-1 text-xs text-steel hover:text-zinc-100">
                    <Undo2 size={14} /> Keep the current QR
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => vm.setReplaceQr(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw size={14} /> Make a new QR
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </section>
)
