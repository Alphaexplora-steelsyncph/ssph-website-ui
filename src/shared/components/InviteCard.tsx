import { Mail } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { inviteLink } from '../utils/links'
import { CopyButton } from './CopyButton'

/**
 * Shown to the admin after Enroll / Add existing member.
 * POC: the member scans this QR at the desk. With the backend, the same link is emailed.
 */
interface Props {
  token: string
  email: string
  title?: string
  description?: string
}

export const InviteCard = ({ token, email, title = 'Member login invite', description }: Props) => {
  const link = inviteLink(token)
  return (
    <div className="mt-6 rounded-lg border border-ember/40 bg-coal-900 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Mail size={16} className="text-ember" /> {title}
      </p>
      <p className="mt-1 text-sm text-steel">
        {description ??
          `Have the member scan this with their phone to set a password. It will also be emailed to ${email} once email sending is connected.`}
      </p>
      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="rounded-lg bg-white p-2">
          <QRCodeSVG value={link} size={120} aria-label="Invite QR code" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-all rounded bg-coal-800 px-3 py-2 font-mono text-xs text-steel">{link}</p>
          <div className="mt-2">
            <CopyButton text={link} />
          </div>
        </div>
      </div>
    </div>
  )
}
