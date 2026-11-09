/**
 * Every feature SteelSync can sell. Packages bundle these; a gym can also get a single
 * feature switched on or off by the super admin. "core" is the Basic Gym Management System.
 */
export const FEATURE_KEYS = ['core', 'equipment_status', 'coach_app'] as const
export type FeatureKey = (typeof FEATURE_KEYS)[number]

export interface FeatureDefinition {
  key: FeatureKey
  label: string
  description: string
  availability: 'available' | 'coming_soon'
  alwaysOn?: boolean
  /** What the add-on does, in plain words, shown on the locked card to gym admins and to members. */
  pitch?: { admin: string; member: string }
}

export const FEATURE_CATALOG: FeatureDefinition[] = [
  {
    key: 'core',
    label: 'Basic Gym Management',
    description: 'Members, enroll, QR check-in, visits, payments, plans and settings.',
    availability: 'available',
    alwaysOn: true,
  },
  {
    key: 'equipment_status',
    label: 'Equipment Status',
    description: 'Machine list with Available / Under maintenance / Broken status that members can see.',
    pitch: {
      admin: 'List your machines and show members which ones are working, under maintenance or broken, with a note like "back by Friday". Fewer questions at the desk.',
      member: 'See which machines are working, under maintenance or broken before you go to the gym.',
    },
    availability: 'available',
  },
  {
    key: 'coach_app',
    label: 'Coach App',
    description: 'Coach logins, coaches pick members as clients and write their training programs (weekly calendar + exercise tables).',
    pitch: {
      admin: 'Invite your coaches. Each coach picks members as clients and writes their training program: a weekly calendar plus exercise tables, with history and PDF download.',
      member: 'Get your training program from your coach right in the app: your weekly schedule, your exercises, and a notification whenever it changes.',
    },
    availability: 'available',
  },
]

export const featureLabel = (key: FeatureKey) => FEATURE_CATALOG.find((f) => f.key === key)?.label ?? key
