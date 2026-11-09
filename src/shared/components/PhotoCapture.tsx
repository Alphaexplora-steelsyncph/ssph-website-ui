import { Camera, RefreshCw, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface Props {
  title?: string
  isSaving?: boolean
  onCapture: (file: File) => void
  onClose: () => void
}

/**
 * Front desk takes the member's photo with the webcam (or phone camera), or picks a file.
 * The caller resizes and uploads it. Render only while open, so the camera stops when it closes.
 */
export const PhotoCapture = ({ title = 'Member photo', isSaving = false, onCapture, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [shot, setShot] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    let active: MediaStream | null = null
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() => !cancelled && setCameraError('This browser cannot open the camera. Choose a photo file instead.'))
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } }, audio: false })
        .then((s) => {
          if (cancelled) return s.getTracks().forEach((t) => t.stop())
          active = s
          setStream(s)
        })
        .catch(() => !cancelled && setCameraError('No camera found, or camera access was blocked. Choose a photo file instead.'))
    }
    return () => {
      cancelled = true
      active?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream, shot])

  useEffect(() => () => {
    if (shot) URL.revokeObjectURL(shot.url)
  }, [shot])

  const take = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' })
      setShot({ file, url: URL.createObjectURL(blob) })
    }, 'image/jpeg', 0.9)
  }

  const pick = (file: File | undefined) => {
    if (file) setShot({ file, url: URL.createObjectURL(file) })
  }

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => shot && onCapture(shot.file)} disabled={!shot || isSaving}>
            {isSaving ? 'Saving…' : 'Use this photo'}
          </Button>
        </>
      }
    >
      <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-coal-900">
        {shot ? (
          <img src={shot.url} alt="Preview of the new photo" className="size-full object-cover" />
        ) : stream ? (
          <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Camera preview" />
        ) : (
          <div className="flex size-full items-center justify-center p-6 text-center text-sm text-steel">{cameraError ?? 'Opening the camera…'}</div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-steel">Face the camera, no cap or sunglasses, so the desk can match them at check-in.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {shot ? (
          <button type="button" onClick={() => setShot(null)} className="inline-flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2 text-sm font-semibold text-steel hover:text-zinc-100">
            <RefreshCw size={16} /> Retake
          </button>
        ) : (
          stream && (
            <button type="button" onClick={take} className="inline-flex items-center gap-2 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-charcoal hover:bg-ember-600">
              <Camera size={16} /> Take photo
            </button>
          )
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-coal-500 px-4 py-2 text-sm font-semibold text-steel hover:text-zinc-100">
          <Upload size={16} /> Choose a file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="sr-only"
          data-testid="photo-file"
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    </Modal>
  )
}
