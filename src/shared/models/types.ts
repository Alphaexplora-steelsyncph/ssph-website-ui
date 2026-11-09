import type { Permission } from '../auth/permissions'
import type { FeatureKey } from '../features/featureCatalog'

export type Role = 'SuperAdmin' | 'Admin' | 'Member' | 'Coach'

export interface Gym {
  id: string
  slug: string
  name: string
  memberDuesEnabled?: boolean // Alphaexplora switched on a fixed member payment day for this gym
  memberDueDay?: number | null // the day (1–28) the gym admin picked
}

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  permissions: Permission[]
  gymId: string // empty for SuperAdmin
  gymName: string
  features?: FeatureKey[] // enabled for the user's gym
  idleTimeoutMinutes?: number // SuperAdmin only
  impersonation?: { byName: string; expiresAt: string } // super admin viewing a gym (read only)
  memberDueDay?: number | null // gym's fixed member payment day (1–28), null = none
}

/** What a successful login / registration returns. */
export interface AuthSession {
  user: User
  token: string // short-lived access token
  refreshToken?: string // absent for the read-only view-as-gym session
  expiresAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterMemberPayload extends LoginPayload {
  fullName: string
  gymId: string
}

/** Plan name as shown to people. Plans are defined per gym in Settings. */
export type MembershipPlan = string
export type MembershipStatus = 'Active' | 'Expired' | 'Terminated'

export interface MemberRecord {
  id: string
  fullName: string
  email: string // empty for walk-ins enrolled without an email
  phone?: string
  city?: string // city / municipality only, e.g. "Calamba City, Laguna"
  plan: MembershipPlan
  memberSince: string // ISO date
  expiresAt: string // ISO date
  status: MembershipStatus
  balanceDue: number // what the member still owes the gym (0 = fully paid)
  balanceDueOn?: string // ISO date the rest is expected, when the admin set one
  balanceOverdue: boolean // balance is unpaid and the due date has passed
  balanceUpcoming: boolean // the balance is the plan price scheduled for the gym's payment day, not due yet
  photoUrl?: string // short-lived link to the member's photo (absent = no photo yet)
  daysLeft: number | null // days until the plan ends (0 = last day today); null unless Active
  expiringSoon: boolean // Active and ending within 14 days: member is notified, plan can be upgraded
  checkInBlocked: boolean // the front desk stopped this member from checking in
  blockReason?: string
}

export type DurationUnit = 'days' | 'months'

/** Fields an admin edits for a plan. */
export interface PlanInput {
  name: string
  price: number
  durationValue: number
  durationUnit: DurationUnit
  isActive: boolean // offered at the desk / in Enroll
}

export interface PlanOption extends PlanInput {
  id: string
}

export interface GymSettingsUpdate {
  name: string
}

/** Returned after the gym is renamed: the gym plus the refreshed signed-in user. */
export interface GymRenameResult {
  gym: Gym
  user: User
}

export type PaymentMethod = 'Cash' | 'GCash' | 'Maya' | 'Bank Transfer'
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected'

export interface PaymentInput {
  amount: number
  method: PaymentMethod
  referenceNo?: string
  receiptPath?: string // object path from uploadReceipt (private Supabase Storage bucket)
  receiptFileName?: string
}

export interface ReceiptUpload {
  path: string
  fileName: string
}

export interface PaymentRecord extends PaymentInput {
  id: string
  memberId: string
  status: PaymentStatus
  recordedAt: string // ISO timestamp
  recordedBy: string
}

export interface BalanceInput {
  dueOn?: string // YYYY-MM-DD
}

export interface EnrollMemberPayload {
  fullName: string
  email?: string
  phone?: string
  city?: string
  planId: string
  startDate: string // YYYY-MM-DD
  payment: PaymentInput
  /** Keep the unpaid part of the price as a balance to collect later (optionally with a due date). */
  balance?: BalanceInput
  /** Gym with a fixed payment day + plan longer than a month: payment covers only the days until that day. */
  alignToDueDate?: boolean
  logFirstVisit: boolean
}

/** Reinstate a terminated member: the plan they continue on and what they paid for it. */
export interface ReinstateMemberPayload {
  planId: string
  payment: PaymentInput
  balance?: BalanceInput
}

/** Pay all or part of a member's balance. dueOn moves the due date of what is still owed. */
export interface CollectBalancePayload {
  payment: PaymentInput
  dueOn?: string
}

export interface CollectBalanceResult {
  member: MemberRecord
  payment: PaymentRecord
}

export interface ReinstateResult {
  member: MemberRecord
  payment: PaymentRecord
}

export interface EnrollmentResult {
  member: MemberRecord
  payment: PaymentRecord
  visitLogged: boolean
  inviteToken?: string // present when the member has an email and no account yet
}

export interface AddExistingMemberResult {
  member: MemberRecord
  inviteToken?: string
}

/* ---------- Gym QR ---------- */

export interface GymQr {
  gymName: string
  gymSlug: string
  token: string // secret part of the static QR; regenerating it retires old posters
}

/* ---------- Member account activation ---------- */

export interface InviteDetails {
  fullName: string
  email: string
  gymName: string
  role: Role
  kind: 'activate' | 'reset' // reset = set a new password on an existing account
  alreadyActivated: boolean
  expired?: boolean // the link is past its expiry (14 days for invites, 24 hours for resets)
}

export interface ActivateAccountPayload {
  token: string
  password: string
}

/* ---------- Member area ---------- */

export type MyMembershipStatus = MembershipStatus | 'Pending'

export interface MyMembership {
  status: MyMembershipStatus
  gymName: string
  member: MemberRecord | null // null while Pending (no membership on file yet)
}

export interface Visit {
  id: string
  checkedInAt: string // ISO timestamp
}

/** A member's own record for the admin: the membership plus whether they already have a login (which locks the email). */
export interface MemberDetail {
  member: MemberRecord
  hasLogin: boolean
  inviteToken?: string // present after saving a new email for a member with no login yet
}

/** Editable contact details. Leave email out to keep it as it is. */
export interface UpdateMemberPayload {
  fullName: string
  phone?: string
  city?: string // '' removes it
  email?: string
}

export interface GymCrowd {
  count: number // distinct people who checked in within the window
  windowHours: number
  asOf: string // ISO timestamp
}

export type CheckInOutcome = 'success' | 'already' | 'expired' | 'denied'

export interface CheckInPayload {
  gymSlug: string
  token: string
}

export interface CheckInResult {
  outcome: CheckInOutcome
  message: string
  gymName: string
  memberName?: string
  checkedInAt?: string // the new visit (success) or the earlier one (already)
  expiresAt?: string
}

/** A member who already had a running membership before the gym moved to SteelSync. */
export interface AddExistingMemberPayload {
  fullName: string
  email: string
  phone?: string
  city?: string
  planId: string
  memberSince: string // YYYY-MM-DD, today or earlier
  expiresAt: string // YYYY-MM-DD, taken from the gym's old records
  balanceAmount?: number // what they still owe, from the gym's old records
  balanceDueOn?: string // YYYY-MM-DD
}

/** Mirrors the backend error contract: { error: { code, message, details } } */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'

/* ---------- Platform (super admin) ---------- */

export type GymStatus = 'Active' | 'Suspended' | 'Archived'
export type SuspendReason = 'manual' | 'overdue'
export type BillingState = 'paid' | 'upcoming' | 'due_soon' | 'overdue' | 'suspended'

export interface PackageInput {
  name: string
  price: number // per month
  memberLimit: number | null // null = unlimited
  features: FeatureKey[] // add-ons included; "core" is always included
}

export interface PackageOption extends PackageInput {
  id: string
  gymCount: number
}

export interface GymBillingSnapshot {
  period: string // YYYY-MM
  periodLabel: string // "November 2026"
  paid: boolean
  amountDue: number
  dueDate: string // YYYY-MM-DD
  suspendsOn: string // due date + grace period
  state: BillingState
  daysUntilDue: number // negative when past due
}

export interface GymSummary {
  id: string
  name: string
  slug: string
  status: GymStatus
  suspendReason?: SuspendReason
  packageId: string
  packageName: string
  activeMembers: number
  totalMembers: number
  memberLimit: number | null
  billing: GymBillingSnapshot
  createdAt: string
}

export interface BillingPeriodRow {
  period: string
  periodLabel: string
  dueDate: string
  amount: number
  paid: boolean
  method?: PaymentMethod
  referenceNo?: string
  recordedAt?: string
  recordedBy?: string
  paidOn?: string // date the gym paid (YYYY-MM-DD)
  notes?: string
  proofUrl?: string // short-lived link to the proof of payment
  proofFileName?: string
}

/** One entry of a gym's SteelSync payment log (newest first). Voided entries stay in the log. */
export interface GymPaymentLogEntry {
  id: string
  event: 'Recorded' | 'Voided'
  period: string
  periodLabel: string
  amount: number
  method?: PaymentMethod
  referenceNo?: string
  paidOn?: string
  proofUrl?: string
  proofFileName?: string
  notes?: string
  reason?: string // why it was voided
  recordedBy: string
  recordedAt: string // ISO timestamp
}

/** Record the gym's SteelSync payment for one month. */
export interface RecordGymPaymentPayload {
  period: string // YYYY-MM
  amount: number
  method: PaymentMethod
  referenceNo?: string
  paidOn: string // YYYY-MM-DD
  proofPath?: string
  proofFileName?: string
  notes?: string
}

export interface GymAdminAccount {
  id: string
  email: string
  status: 'Active' | 'Invited' | 'Disabled'
}

export interface GymFeatureState {
  key: FeatureKey
  label: string
  description: string
  availability: 'available' | 'coming_soon'
  alwaysOn: boolean
  includedInPackage: boolean
  override: boolean | null // null = follow the package
  enabled: boolean
}

export interface GymDetail extends GymSummary {
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
  billingDay: number
  memberDuesEnabled: boolean // switched on by the super admin
  memberDueDay: number | null // day picked by the gym admin (1–28), null = not picked yet
  suspendNote?: string
  admins: GymAdminAccount[]
  billingHistory: BillingPeriodRow[]
  paymentLog: GymPaymentLogEntry[]
  features: GymFeatureState[]
}

export interface GymProfileInput {
  name: string
  slug: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
  packageId: string
  billingDay: number // 1–28
}

export interface CreateGymPayload extends GymProfileInput {
  adminEmail: string
}

export interface CreateGymResult {
  gym: GymSummary
  adminInviteToken: string
}

export interface AuditEntry {
  id: string
  at: string
  actorName: string
  actorRole: Role | 'System'
  gymId?: string
  gymName?: string
  action: string
  details?: string
}

export interface PlatformOverview {
  gymCounts: { active: number; suspended: number; archived: number; dueSoon: number; overdue: number }
  activeMembers: number
  checkInsToday: number
  attention: GymSummary[]
  recentActivity: AuditEntry[]
}

export interface BillingOverview {
  period: string
  periodLabel: string
  rows: (GymSummary & { periodPaid: boolean; periodAmount: number; periodDueDate: string })[]
  expected: number
  collected: number
}

export interface DefaultPlan {
  name: string
  price: number
  durationValue: number
  durationUnit: DurationUnit
}

export interface PlatformSettings {
  graceDays: number
  reminderDays: number
  checkInCooldownHours: number
  crowdWindowHours: number
  paymentMethods: PaymentMethod[]
  sessionTimeoutMinutes: number
  maxFailedLogins: number // account locks for 15 minutes after this many wrong passwords
  defaultPlans: DefaultPlan[]
}

/** Shown to a gym admin when the SteelSync bill is coming up or overdue. */
export interface MyGymBillingNotice {
  state: BillingState
  periodLabel: string
  dueDate: string
  suspendsOn: string
  daysUntilDue: number
  amountDue: number
}

/** One line of the front-desk live feed: who just scanned, with the photo to compare. */
export interface RecentCheckIn {
  id: string
  checkedInAt: string // ISO timestamp
  member: Pick<MemberRecord, 'id' | 'fullName' | 'plan' | 'status' | 'balanceDue' | 'balanceUpcoming' | 'photoUrl'>
}

/* ---------- Admin: payments, visits, reports, email notices ---------- */

export interface ListRange {
  from?: string // YYYY-MM-DD (Manila day, included)
  to?: string
  q?: string // member name or email
}

/** One member payment (enroll, renew, upgrade, reinstate, balance). */
export interface PaymentListItem {
  id: string
  member: { id: string; fullName: string; email: string }
  amount: number
  method: PaymentMethod
  referenceNo?: string
  receiptUrl?: string // short-lived link to the e-receipt
  receiptFileName?: string
  recordedAt: string
  recordedBy: string
}

export interface PaymentsSummary {
  amount: number
  count: number
  byMethod: Partial<Record<PaymentMethod, number>>
}

export interface PaymentsPage {
  payments: PaymentListItem[]
  total: number
  summary: PaymentsSummary
}

export interface VisitListItem {
  id: string
  checkedInAt: string
  member: { id: string; fullName: string; email: string; plan: string }
}

export interface VisitsPage {
  visits: VisitListItem[]
  total: number
}

/** A notice email the system prepared for a member (logged only until an email provider is set up). */
export interface EmailNotice {
  id: string
  kind: 'plan_ending' | 'balance_due' | 'balance_overdue'
  to: string
  memberName?: string
  memberId?: string
  subject: string
  body: string
  status: 'logged' | 'sent' | 'failed'
  createdAt: string
}

/* ---------- Add-on: Equipment Status ---------- */

export type EquipmentStatus = 'Available' | 'Under maintenance' | 'Broken'

export interface Equipment {
  id: string
  name: string
  area?: string // e.g. "Free weights", "Cardio"
  status: EquipmentStatus
  note?: string // shown to members, e.g. "Back by Friday"
  statusChangedAt: string
  updatedBy?: string // admin only
}

export interface EquipmentInput {
  name?: string
  area?: string
  status?: EquipmentStatus
  note?: string
}

/* ---------- Add-on: Coach App ---------- */

/** One row of an exercise table. Column values are keyed by the category type's column keys. */
export interface ExerciseRow {
  id: string
  name: string // the row's identifier (exercise, type of run, HYROX station)
  fixed: Record<string, string> // columns that do not change week to week (rest, tempo, distance…)
  progression: Record<string, string>[] // one value bag per program week (e.g. { set: '3', rep: '10' })
}

export type CategoryTypeId = 'running' | 'workout' | 'hyrox'

export interface ProgramCategory {
  id: string
  name: string // e.g. "UB MXS"
  categoryType: CategoryTypeId // decides the table's columns; fixed once added
  subtitle: string // optional, e.g. "Push" vs "Pull"
  exercises: ExerciseRow[]
}

export interface ProgramWeek {
  id: number // 1-based week number
  am: string[] // 7 days, Monday first
  pm: string[]
  showPm: boolean // the week has a second (PM) session row
}

export interface TrainingProgram {
  title: string
  startDate: string // YYYY-MM-DD
  endDate: string
  weeks: ProgramWeek[]
  categories: ProgramCategory[]
}

/** Body details the coach keeps (the member sees them read only). */
export interface TrainingProfile {
  weightKg: number | null
  heightCm: number | null
  remarks: string
  updatedAt?: string
}

export interface ProgramVersion {
  id: string
  savedAt: string
  note: string
  savedBy?: string
  program: TrainingProgram
}

/** Result of saving or restoring. `unchanged`: same as the current program, so no version and no notification. */
export interface ProgramSaveResult {
  program: TrainingProgram
  version: ProgramVersion | null
  unchanged: boolean
}

/** A coach's client as shown on the coach dashboard and client page. */
export interface CoachClient {
  memberId: string
  fullName: string
  email: string
  photoUrl?: string
  plan: string
  expiresAt: string
  status: MembershipStatus
  checkInBlocked: boolean
  programVisible: boolean // false while the plan is expired / check-in blocked: the member cannot see it
  assignedAt: string
  programTitle?: string
  programUpdatedAt?: string
}

export interface CoachClientDetail {
  client: CoachClient
  profile: TrainingProfile
  program: TrainingProgram | null // null = no program saved yet
}

/** A member the coach can still take (active plan, no coach yet). */
export interface AvailableMember {
  id: string
  fullName: string
  email: string
  plan: string
  expiresAt: string
  photoUrl?: string
}

/** Admin "Coaches" page. */
export interface GymCoach {
  id: string
  fullName: string
  email: string
  disabled: boolean
  createdAt: string
  clients: { memberId: string; fullName: string; assignedAt: string }[]
}

export interface CoachInvite {
  id: string
  fullName: string
  email: string
  createdAt: string
  expiresAt: string
  expired: boolean
}

export interface CoachesOverview {
  coaches: GymCoach[]
  pendingInvites: CoachInvite[]
}

/** The member's own program page. */
export interface MyProgram {
  visible: boolean
  hiddenReason?: string // why it is hidden (plan expired, check-in blocked)
  coachName?: string
  profile?: TrainingProfile
  program: TrainingProgram | null
}

export interface MemberNotification {
  id: string
  message: string
  createdAt: string
  read: boolean
}

/* ---------- Gym addresses (<slug>.steelsync.ph) ---------- */

/** Public info for a gym's own page, before anyone signs in. */
export interface GymSite {
  id: string
  slug: string
  name: string
  status: 'Active' | 'Suspended' | 'Archived'
  roles: ('Member' | 'Admin' | 'Coach')[] // Coach only when the gym has the Coach App
}

/** Website "Contact us" form. Emailed to the Alphaexplora team (and a copy to the sender); not stored. */
export interface InquiryPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  gymName: string
  location: {
    regionCode: string
    region: string
    province: string
    provinceIsCity: boolean
    city: string
    barangay: string
    street: string
  }
  landmark: string
  /** Hidden anti-spam field: always empty for people. */
  website: string
}

export interface InquiryResult {
  /** False when the team got the inquiry but the copy to the sender could not be sent. */
  confirmationSent: boolean
}
