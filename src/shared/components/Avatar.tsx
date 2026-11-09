import { useState } from 'react'

const SIZES = { sm: 'size-9 text-xs', md: 'size-14 text-base', lg: 'size-24 text-2xl', xl: 'size-40 text-4xl' } as const

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

/** Member photo, or the initials when there is none (or the link has expired). */
export const Avatar = ({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string; size?: keyof typeof SIZES }) => {
  // Remember which link failed, so a fresh link for the same member gets another try.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showPhoto = !!photoUrl && failedUrl !== photoUrl
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-coal-600 font-display font-bold text-steel ${SIZES[size]}`}>
      {showPhoto ? (
        <img src={photoUrl} alt={`Photo of ${name}`} loading="lazy" decoding="async" className="size-full object-cover" onError={() => setFailedUrl(photoUrl)} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}
