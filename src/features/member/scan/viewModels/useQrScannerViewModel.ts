import QrScanner from 'qr-scanner'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkInPath, parseCheckInLink } from '../../../../shared/utils/links'

export type ScannerStatus = 'starting' | 'scanning' | 'insecure' | 'denied' | 'no-camera' | 'error'

const WRONG_QR_MESSAGE = 'That is not a SteelSync gym QR. Point the camera at the poster by the entrance.'

/**
 * Opens the phone's back camera inside the app and reads the gym QR.
 * A valid gym QR sends the member to /check-in, which logs the visit and shows the result.
 */
export const useQrScannerViewModel = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const handledRef = useRef(false)

  // The camera needs HTTPS (or localhost); known before trying, so it is derived.
  const [status, setStatus] = useState<ScannerStatus>(() => (window.isSecureContext ? 'starting' : 'insecure'))
  const [hint, setHint] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const onDecode = useCallback(
    (result: QrScanner.ScanResult) => {
      if (handledRef.current) return
      const link = parseCheckInLink(result.data)
      if (!link) {
        setHint(WRONG_QR_MESSAGE)
        return
      }
      handledRef.current = true
      scannerRef.current?.stop()
      if (navigator.vibrate) navigator.vibrate(60)
      navigate(checkInPath(link.gymSlug, link.token), { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || !window.isSecureContext) return

    const scanner = new QrScanner(video, onDecode, {
      preferredCamera: 'environment',
      returnDetailedScanResult: true,
      highlightScanRegion: false,
      highlightCodeOutline: true,
      maxScansPerSecond: 8,
    })
    scannerRef.current = scanner
    let cancelled = false

    scanner
      .start()
      .then(async () => {
        if (cancelled) return
        setStatus('scanning')
        setHasFlash(await scanner.hasFlash().catch(() => false))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const text = String(err instanceof Error ? `${err.name} ${err.message}` : err)
        if (/NotAllowed|Permission|denied/i.test(text)) setStatus('denied')
        else if (/not found|NotFound|no camera|Overconstrained/i.test(text)) setStatus('no-camera')
        else setStatus('error')
      })

    return () => {
      cancelled = true
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
  }, [onDecode, attempt])

  const toggleFlash = async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    await scanner.toggleFlash().catch(() => undefined)
    setFlashOn(scanner.isFlashOn())
  }

  /** Try the camera again, e.g. after the member allowed it in the browser settings. */
  const retry = () => {
    handledRef.current = false
    setHint(null)
    setStatus(window.isSecureContext ? 'starting' : 'insecure')
    setAttempt((n) => n + 1)
  }

  return { videoRef, status, hint, hasFlash, flashOn, toggleFlash, retry }
}
