import { useEffect, useState, type MouseEvent } from 'react'
import { useAuth } from '../../../../shared/auth/useAuth'
import { PRODUCT_NAME, exampleGymAddress } from '../../../../shared/brand/product'

/**
 * Marketing landing page (main domain) for gym owners. All copy lives here so views stay presentational.
 * No pricing on purpose: every call to action leads to the "Contact us" form (or the inquiry email).
 */
export const INQUIRY_EMAIL = 'inquire@alphaexplora.com'

const inquiryBody = [
  'Hi ALPHAEXPLORA team,',
  '',
  `I'd like to know more about ${PRODUCT_NAME} for my gym.`,
  '',
  'Gym name:',
  'City / location:',
  'Number of members (approx.):',
  'Contact number:',
  'Best time to call:',
].join('\n')

export const inquiryHref = (topic = `${PRODUCT_NAME} for my gym`) =>
  `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(`Inquiry: ${topic}`)}&body=${encodeURIComponent(inquiryBody)}`

export interface OldWayItem {
  text: string
  note: string
}

export interface Move {
  n: string
  title: string
  body: string
  tag: string
}

export interface PlateFeature {
  weight: string
  title: string
  body: string
  points: string[]
  addOn?: boolean
}

export interface RoleNote {
  role: string
  line: string
  points: string[]
}

export interface Fact {
  big: string
  text: string
}

export interface Faq {
  q: string
  a: string
}

const oldWay: OldWayItem[] = [
  { text: 'A logbook at the front desk', note: 'Pages of names nobody ever reads.' },
  { text: 'GCash screenshots on your phone', note: 'Good luck finding who paid, and when.' },
  { text: '"Wait, his plan expired?"', note: 'Found out three weeks after it did.' },
  { text: '"Is it packed right now?"', note: 'No way to know before heading over.' },
  { text: 'Programs sent on Messenger', note: 'The workout gets buried in the chat.' },
]

const moves: Move[] = [
  { n: '01', title: 'Enroll', body: 'The front desk adds a member in under a minute: plan, payment (cash, GCash, Maya or bank), photo and an invite to their own login.', tag: 'Front desk' },
  { n: '02', title: 'Scan', body: "Members scan the gym's QR at the door with their phone. Expired, blocked or not a member? The scan says so on the spot.", tag: 'At the door' },
  { n: '03', title: 'Know', body: 'Who is inside right now, who paid, whose plan ends this week, and every visit, from your phone, wherever you are.', tag: 'Gym owner' },
]

const plates: PlateFeature[] = [
  {
    weight: '25',
    title: 'Members & plans',
    body: 'Day pass to one year: your own plans and prices.',
    points: ['Enroll, renew, upgrade, reinstate', 'Balances with due dates', 'Same payment day for everyone, if you want'],
  },
  {
    weight: '20',
    title: 'QR check-in',
    body: 'One printed poster at the door, no hardware to buy.',
    points: ['Scan with any phone camera', 'Blocks expired and on-hold members', 'Photo shown at the desk to match faces'],
  },
  {
    weight: '15',
    title: 'Payments',
    body: 'Every peso, with the receipt.',
    points: ['Cash, GCash, Maya, bank transfer', 'E-receipt screenshots saved privately', 'Totals per mode, export to CSV'],
  },
  {
    weight: '10',
    title: 'Visits & crowd',
    body: 'The logbook, done for you.',
    points: ['Live "in the gym now" count', 'Every check-in by date or member', 'Members see how busy it is before they go'],
  },
  {
    weight: '5',
    title: 'Member app',
    body: 'In the browser. Nothing to download.',
    points: ['Plan, days left and balance', 'Visit history', 'Notice when the plan is about to end'],
  },
  {
    weight: '+',
    title: 'Coach App',
    body: 'Add-on for gyms with coaches.',
    points: ['Coaches pick members as clients', 'Weekly program + exercise tables', 'Members get it on their phone, PDF download'],
    addOn: true,
  },
  {
    weight: '+',
    title: 'Equipment Status',
    body: 'Add-on: no more "is the treadmill broken?"',
    points: ['Available, under maintenance or broken', 'Notes like "back by Friday"', 'Members check before they go'],
    addOn: true,
  },
]

const roles: RoleNote[] = [
  { role: 'Owner', line: 'Know what is happening, even when you are not there.', points: ['Live count and latest check-ins', 'Payments and balances', 'One login for the whole gym'] },
  { role: 'Front desk', line: 'Fast, and no more logbook.', points: ['Enroll in a minute', 'Collect a balance in two taps', 'Block or allow a check-in'] },
  { role: 'Member', line: 'Scan, then lift.', points: ['QR check-in with their phone', 'Their plan and visits', 'Crowd check before going'] },
  { role: 'Coach', line: 'Programs that do not get lost in the chat.', points: ['Clients in one list', 'Weekly calendar + tables', 'History and restore'] },
]

const facts: Fact[] = [
  { big: '0', text: 'apps to download. It runs in the phone browser, for members, staff and coaches.' },
  { big: '1', text: 'printed QR at the door. No scanner, turnstile or tablet to buy.' },
  { big: '1', text: `address per gym: ${exampleGymAddress('yourgym')}, with its own login for members, admins and coaches.` },
  { big: '100%', text: "separate data per gym. Receipts and member photos are private files, opened with short-lived links." },
]

const faqs: Faq[] = [
  { q: 'Do members need to download an app?', a: 'No. It works in the phone browser (Chrome, Safari). They can add it to their home screen if they want.' },
  { q: 'What do we need to get started?', a: 'A phone or laptop at the front desk, internet, and a printer for the QR poster. We set up your gym and the admin account for you.' },
  { q: 'What if the internet is down?', a: 'The front desk and the member’s phone need internet to scan. Mobile data is enough.' },
  { q: 'Can members pay with GCash or Maya?', a: 'Yes. The front desk records cash, GCash, Maya or bank transfer, with the reference number and a screenshot of the receipt.' },
  { q: 'Can we bring over members from our logbook?', a: 'Yes. "Add existing member" handles anyone with a running membership, keeping their original start and end dates.' },
  { q: 'How much does it cost?', a: `It depends on the size of your gym and the add-ons you need. Send us a message below (or email ${INQUIRY_EMAIL}) and we will get back to you quickly.` },
]

const SECTION_IDS = ['how-it-works', 'features', 'faq', 'contact']
const hashSection = () => {
  const id = window.location.hash.slice(1)
  return SECTION_IDS.includes(id) ? id : null
}
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scrolls to a section once it exists (the sections below the hero are mounted lazily). */
const scrollToSection = (id: string, smooth: boolean) => {
  let tries = 0
  const tick = () => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: smooth && !reducedMotion() ? 'smooth' : 'auto', block: 'start' })
    else if (tries++ < 120) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export const useLandingViewModel = () => {
  const { isAuthenticated, homePath } = useAuth()
  const [copied, setCopied] = useState(false)
  // Below-the-fold sections normally mount when scrolled near; a section link (or #contact in the URL) mounts them now.
  const [showAll, setShowAll] = useState(() => !!hashSection())

  useEffect(() => {
    const id = hashSection()
    if (id) scrollToSection(id, false)
  }, [])

  /** onClick for in-page links: `<a href="#contact" onClick={vm.goTo('contact')}>`. */
  const goTo = (id: string) => (e?: MouseEvent) => {
    e?.preventDefault()
    setShowAll(true)
    window.history.replaceState(null, '', `#${id}`)
    scrollToSection(id, true)
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(INQUIRY_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the email is visible anyway */
    }
  }

  return {
    productName: PRODUCT_NAME,
    exampleAddress: exampleGymAddress(),
    email: INQUIRY_EMAIL,
    inquiryHref: inquiryHref(),
    copyEmail,
    copied,
    showAll,
    goTo,
    contactHref: '#contact',
    isAuthenticated,
    homePath,
    marquee: ['QR check-in', 'Members', 'GCash · Maya · Cash', 'Balances', 'Live crowd', 'Coach programs', 'Equipment status', 'Built for local gyms'],
    oldWay,
    moves,
    plates,
    roles,
    facts,
    faqs,
  }
}

export type LandingVM = ReturnType<typeof useLandingViewModel>
