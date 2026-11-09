import { CalendarCheck, Gauge, QrCode, ReceiptText, ScanLine, ShieldCheck, Users, UserRoundCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface StepItem {
  icon: LucideIcon
  title: string
  description: string
}

const memberFeatures: FeatureItem[] = [
  { icon: CalendarCheck, title: 'Visit history', description: 'Every gym visit logged with date and time.' },
  { icon: UserRoundCheck, title: 'Membership at a glance', description: 'See your member-since date and when your plan expires.' },
  { icon: Gauge, title: 'Gym crowd check', description: 'Know roughly how many people are lifting before you go.' },
]

const adminFeatures: FeatureItem[] = [
  { icon: Users, title: 'Member management', description: 'Enroll, view, renew or terminate members in a few taps.' },
  { icon: ReceiptText, title: 'Payment tracking', description: 'Record cash, GCash, Maya or bank transfers and approve e-receipts.' },
  { icon: ShieldCheck, title: 'Visit reports', description: 'Filter visits by day, week or month and see who is in the gym now.' },
]

const steps: StepItem[] = [
  { icon: UserRoundCheck, title: 'Log in', description: 'Sign in to your SteelSync account once on your phone.' },
  { icon: ScanLine, title: 'Scan', description: 'Scan the QR code at the gym entrance.' },
  { icon: QrCode, title: 'Sync', description: 'Get an instant Success, Expired or Access Denied result. Visit logged.' },
]

export const useHomeViewModel = () => ({ memberFeatures, adminFeatures, steps })
