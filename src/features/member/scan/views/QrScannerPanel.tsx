import { CameraOff, Flashlight, FlashlightOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../../shared/components/Button'
import { useQrScannerViewModel, type ScannerStatus } from '../viewModels/useQrScannerViewModel'

const PROBLEM: Partial<Record<ScannerStatus, { title: string; body: string }>> = {
  insecure: {
    title: 'Camera needs a secure link',
    body: 'Open SteelSync using its https:// address to use the camera. You can also scan the gym QR with your phone camera app.',
  },
  denied: {
    title: 'Camera access is blocked',
    body: 'Allow camera access for this site in your browser settings, then tap Try again.',
  },
  'no-camera': {
    title: 'No camera found',
    body: 'This device has no camera we can use. Scan the gym QR with your phone instead.',
  },
  error: {
    title: 'Camera could not start',
    body: 'Close other apps that may be using the camera, then tap Try again.',
  },
}

export const QrScannerPanel = () => {
  const { videoRef, status, hint, hasFlash, flashOn, toggleFlash, retry } = useQrScannerViewModel()
  const problem = PROBLEM[status]

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <Link
          to="/member"
          aria-label="Close scanner"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X size={22} />
        </Link>
        {hasFlash && status === 'scanning' && (
          <button
            type="button"
            onClick={toggleFlash}
            aria-label={flashOn ? 'Turn flashlight off' : 'Turn flashlight on'}
            aria-pressed={flashOn}
            className={`flex h-11 w-11 items-center justify-center rounded-full ${flashOn ? 'bg-ember text-charcoal' : 'bg-black/60 text-white'}`}
          >
            {flashOn ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
          </button>
        )}
      </div>

      {/* Camera */}
      <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />

      {status === 'scanning' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-64 w-64 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
            {['left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-3xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-3xl'].map((c) => (
              <span key={c} className={`absolute h-12 w-12 border-ember ${c}`} />
            ))}
            <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-ember/80" />
          </div>
        </div>
      )}

      {/* Bottom text */}
      <div className="relative z-20 mt-auto p-6 pb-10 text-center" aria-live="polite">
        {status === 'starting' && <p className="text-white">Opening camera…</p>}
        {status === 'scanning' && (
          <>
            <p className="font-display text-3xl font-extrabold uppercase text-white">Scan the gym QR</p>
            <p className="mt-1 text-sm text-zinc-300">Point your camera at the poster by the entrance.</p>
            {hint && <p className="mx-auto mt-3 max-w-sm rounded-lg bg-amber-500/20 px-4 py-2 text-sm text-amber-300">{hint}</p>}
          </>
        )}
      </div>

      {problem && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-charcoal p-6">
          <div className="max-w-sm text-center">
            <CameraOff size={48} className="mx-auto text-ember" />
            <h1 className="mt-4 font-display text-3xl font-extrabold uppercase">{problem.title}</h1>
            <p className="mt-2 text-steel">{problem.body}</p>
            <div className="mt-6 flex flex-col gap-3">
              {status !== 'insecure' && status !== 'no-camera' && <Button onClick={retry}>Try again</Button>}
              <Button to="/member" variant="outline">Back to home</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
