/**
 * MODEL layer — HTTP client for ssph-backend (/api/v1).
 *
 * - This is the ONLY file that attaches the Authorization header (from the token store).
 * - Every function keeps the signature the ViewModels already use; responses are unwrapped
 *   from the backend envelope { data, message, meta } and errors become ApiError.
 * - An expired access token is refreshed once, silently, then the request is retried.
 */
import type { FeatureKey } from '../features/featureCatalog'
import { currentGymSlug } from '../tenant/tenant'
import {
  getAuthToken,
  getRefreshToken,
  notifySessionExpired,
  notifySessionRefreshed,
  setAuthTokens,
} from '../auth/tokenStore'
import type {
  ActivateAccountPayload,
  AddExistingMemberPayload,
  AddExistingMemberResult,
  ApiErrorCode,
  AuditEntry,
  AuthSession,
  BillingOverview,
  CheckInPayload,
  CheckInResult,
  CreateGymPayload,
  CreateGymResult,
  EnrollMemberPayload,
  EnrollmentResult,
  Gym,
  GymSite,
  GymCrowd,
  GymDetail,
  GymProfileInput,
  GymQr,
  GymRenameResult,
  GymSettingsUpdate,
  GymSummary,
  InquiryPayload,
  InquiryResult,
  InviteDetails,
  LoginPayload,
  RecordGymPaymentPayload,
  CollectBalancePayload,
  CollectBalanceResult,
  MemberDetail,
  MemberRecord,
  MyGymBillingNotice,
  MyMembership,
  PackageInput,
  PackageOption,
  PaymentMethod,
  PlanInput,
  PlanOption,
  UpdateMemberPayload,
  PlatformOverview,
  PlatformSettings,
  ReceiptUpload,
  RecentCheckIn,
  EmailNotice,
  Equipment,
  EquipmentInput,
  ListRange,
  PaymentListItem,
  PaymentsPage,
  PaymentsSummary,
  VisitListItem,
  VisitsPage,
  RegisterMemberPayload,
  ReinstateMemberPayload,
  ReinstateResult,
  User,
  Visit,
  AvailableMember,
  CoachClient,
  CoachClientDetail,
  CoachesOverview,
  MemberNotification,
  MyProgram,
  ProgramSaveResult,
  ProgramVersion,
  TrainingProfile,
  TrainingProgram,
} from './types'

export class ApiError extends Error {
  code: ApiErrorCode
  details: Record<string, unknown>
  constructor(code: ApiErrorCode, message: string, details: Record<string, unknown> = {}) {
    super(message)
    this.code = code
    this.details = details
  }
}

/** Same-origin by default: Vite proxies /api to the backend in development (works through tunnels too). */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '/api/v1'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  body?: unknown
  form?: FormData
  auth?: boolean // default true
  query?: Record<string, string | number | undefined>
}

interface Envelope<T> {
  data: T
  message: string
  meta: Record<string, unknown>
}

const KNOWN_CODES: ApiErrorCode[] = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_ALREADY_EXISTS',
  'RATE_LIMITED',
  'INTERNAL_SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
]

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const qs = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v))
  })
  const s = qs.toString()
  return `${API_URL}${path}${s ? `?${s}` : ''}`
}

/** Single place where the Authorization header is built. */
const buildHeaders = (opts: RequestOptions): Record<string, string> => {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAuthToken()
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`
  return headers
}

const send = async <T>(method: Method, path: string, opts: RequestOptions): Promise<Envelope<T>> => {
  let res: Response
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers: buildHeaders(opts),
      body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    })
  } catch {
    throw new ApiError('INTERNAL_SERVER_ERROR', 'Cannot reach SteelSync. Check your connection and try again.')
  }
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const err = json?.error
    const code = KNOWN_CODES.includes(err?.code) ? (err.code as ApiErrorCode) : 'INTERNAL_SERVER_ERROR'
    throw new ApiError(code, err?.message ?? 'Something went wrong. Please try again.', err?.details ?? {})
  }
  return json as Envelope<T>
}

/* ---------- silent refresh (one at a time) ---------- */

let refreshing: Promise<boolean> | null = null

const refreshSession = () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)
  refreshing ??= send<AuthSession>('POST', '/auth/refresh', { body: { refreshToken }, auth: false })
    .then(({ data }) => {
      setAuthTokens(data.token, data.refreshToken ?? null)
      notifySessionRefreshed(data)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

const request = async <T>(method: Method, path: string, opts: RequestOptions = {}): Promise<Envelope<T>> => {
  try {
    return await send<T>(method, path, opts)
  } catch (err) {
    const expired = err instanceof ApiError && err.code === 'UNAUTHORIZED' && err.details.reason === 'TOKEN_EXPIRED'
    if (!expired || opts.auth === false) throw err
    if (await refreshSession()) return send<T>(method, path, opts)
    notifySessionExpired()
    throw err
  }
}

const data = async <T>(method: Method, path: string, opts?: RequestOptions) => (await request<T>(method, path, opts)).data

/* ---------- live events (Server-Sent Events read with fetch, so the token stays in a header) ---------- */

export type LiveEventName = 'ready' | 'check-in'

/**
 * Reads the gym's live stream until it ends (resolves) or fails (throws ApiError). One open request: the server
 * writes an event when something happens, so a quiet dashboard makes no requests at all. A 404 means the
 * backend has no stream (older deploy): the caller falls back to refreshing on a timer.
 */
export const readGymLiveStream = async (onEvent: (name: LiveEventName) => void, signal: AbortSignal): Promise<void> => {
  const open = () => fetch(buildUrl('/check-ins/stream'), { headers: buildHeaders({}), signal, cache: 'no-store' })
  let res = await open()
  if (res.status === 401 && (await refreshSession())) res = await open()
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => null)
    const code = res.status === 404 ? 'RESOURCE_NOT_FOUND' : res.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR'
    throw new ApiError(code, err?.error?.message ?? 'The live updates are not available.')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += decoder.decode(value, { stream: true })
    let end: number
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      const name = /^event: (.+)$/m.exec(block)?.[1]?.trim()
      if (name === 'ready' || name === 'check-in') onEvent(name) // ": ping" heartbeats and unknown events are ignored
    }
  }
}
const get = <T>(path: string, query?: RequestOptions['query']) => data<T>('GET', path, { query })
const post = <T>(path: string, body?: unknown) => data<T>('POST', path, { body: body ?? {} })
const put = <T>(path: string, body: unknown) => data<T>('PUT', path, { body })
const patch = <T>(path: string, body?: unknown) => data<T>('PATCH', path, { body: body ?? {} })
const del = <T>(path: string) => data<T>('DELETE', path)
const publicPost = <T>(path: string, body: unknown) => data<T>('POST', path, { body, auth: false })
const enc = encodeURIComponent

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

type Portal = 'admin' | 'member' | 'platform' | 'coach'
/** On a gym's own address only that gym's accounts may sign in (the backend checks gymSlug). */
const login = (payload: LoginPayload, portal: Portal) =>
  publicPost<AuthSession>('/auth/login', { ...payload, portal, gymSlug: portal === 'platform' ? undefined : (currentGymSlug() ?? undefined) })

export const loginAdmin = (payload: LoginPayload) => login(payload, 'admin')
export const loginMember = (payload: LoginPayload) => login(payload, 'member')
export const loginSuperAdmin = (payload: LoginPayload) => login(payload, 'platform')
export const loginCoach = (payload: LoginPayload) => login(payload, 'coach')

/** Revokes the refresh token on the server. Never throws: logging out always works locally. */
export const logout = () => send('POST', '/auth/logout', { body: {} }).then(() => undefined, () => undefined)

/** The signed-in user as the server sees it now (features, gym name, permissions). */
export const fetchMe = () => get<User>('/auth/me')

/** Public gym list for member sign-up: only gyms that are currently active. */
export const fetchGyms = () => data<Gym[]>('GET', '/gyms', { auth: false })
/** Public: the gym behind <slug>.steelsync.ph. */
export const fetchGymSite = (slug: string) => data<GymSite>('GET', `/gyms/site/${enc(slug)}`, { auth: false })

/** Landing page "Contact us" form (public). */
export const sendInquiry = (payload: InquiryPayload) => publicPost<InquiryResult>('/inquiries', payload)

export const registerMember = (payload: RegisterMemberPayload) => publicPost<AuthSession>('/auth/register', payload)

/* ------------------------------------------------------------------ */
/* Gym admin                                                           */
/* ------------------------------------------------------------------ */

export const fetchMembers = () => get<MemberRecord[]>('/members', { limit: 1000 })

export const fetchMember = (memberId: string) => get<MemberDetail>(`/members/${enc(memberId)}`)

/** The latest visits of one member, newest first, with the total on record. */
export const fetchMemberVisits = async (memberId: string, limit = 20) => {
  const res = await request<Visit[]>('GET', `/members/${enc(memberId)}/visits`, { query: { limit } })
  return { visits: res.data, total: typeof res.meta.total === 'number' ? res.meta.total : res.data.length }
}

/** Edit name, contact number and email (the email is locked once the member has a login). */
export const updateMember = (memberId: string, payload: UpdateMemberPayload) =>
  patch<MemberDetail>(`/members/${enc(memberId)}`, payload)

export const terminateMember = (memberId: string) => patch<MemberRecord>(`/members/${enc(memberId)}/terminate`)

/** Undo a termination: the member continues on the chosen plan, starting today, and the payment is recorded. */
export const reinstateMember = (memberId: string, payload: ReinstateMemberPayload) =>
  patch<ReinstateResult>(`/members/${enc(memberId)}/reinstate`, payload)

/** Renew an expired membership: a plan and payment, new period from today. Same shape as reinstating. */
export const renewMember = (memberId: string, payload: ReinstateMemberPayload) =>
  patch<ReinstateResult>(`/members/${enc(memberId)}/renew`, payload)

/** Upgrade an active member to another plan: its period is added after the days they still have. */
export const upgradeMember = (memberId: string, payload: ReinstateMemberPayload) =>
  patch<ReinstateResult>(`/members/${enc(memberId)}/upgrade`, payload)

/** Record a payment against a member's balance. */
export const collectBalance = (memberId: string, payload: CollectBalancePayload) =>
  post<CollectBalanceResult>(`/members/${enc(memberId)}/balance/payments`, payload)

/** Change (or clear, with null) the date a member's balance is due. */
export const setBalanceDueDate = (memberId: string, dueOn: string | null) =>
  patch<MemberRecord>(`/members/${enc(memberId)}/balance/due-date`, { dueOn })

/** Plans the gym currently offers (Enroll / Add existing member). */
export const fetchPlans = () => get<PlanOption[]>('/plans')

/** E-wallet / bank receipt screenshot, stored in a private bucket. Returns its path for enrollMember. */
export const uploadReceipt = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return data<ReceiptUpload>('POST', '/receipts', { form })
}

/** One database transaction on the server: member + payment + first visit + invite. */
export const enrollMember = (payload: EnrollMemberPayload) => post<EnrollmentResult>('/members/enroll', payload)

export const addExistingMember = (payload: AddExistingMemberPayload) =>
  post<AddExistingMemberResult>('/members/existing', payload)

export const fetchMyGym = () => get<Gym>('/gym')

export const updateGymSettings = (update: GymSettingsUpdate) => patch<GymRenameResult>('/gym', update)
/** The day of the month this gym's members pay on (only when Alphaexplora switched the feature on). */
export const setMemberDueDay = (dueDay: number) => patch<GymRenameResult>('/gym/member-due-day', { dueDay })

export const fetchAllPlans = () => get<PlanOption[]>('/plans/all')
export const createPlan = (input: PlanInput) => post<PlanOption>('/plans', input)
export const updatePlan = (planId: string, input: PlanInput) => put<PlanOption>(`/plans/${enc(planId)}`, input)
export const deletePlan = (planId: string) => del<{ id: string }>(`/plans/${enc(planId)}`)

export const fetchGymQr = () => get<GymQr>('/gym/qr')
export const regenerateGymQr = () => post<GymQr>('/gym/qr/regenerate')

export const fetchPaymentMethods = () => get<PaymentMethod[]>('/gym/payment-methods')
export const fetchMyBillingNotice = () => get<MyGymBillingNotice | null>('/gym/billing-notice')

/* ------------------------------------------------------------------ */
/* Invites & account activation (public)                               */
/* ------------------------------------------------------------------ */

export const fetchInvite = (token: string) => data<InviteDetails>('GET', `/invites/${enc(token)}`, { auth: false })

export const activateAccount = ({ token, password }: ActivateAccountPayload) =>
  publicPost<AuthSession>(`/invites/${enc(token)}/activate`, { password })

/* ------------------------------------------------------------------ */
/* Member                                                              */
/* ------------------------------------------------------------------ */

export const fetchMyMembership = () => get<MyMembership>('/me/membership')
export const fetchMyVisits = () => get<Visit[]>('/me/visits', { limit: 1000 })
/** The front desk takes or uploads a member's photo (already resized by the browser). */
export const setMemberPhoto = (memberId: string, file: Blob) => {
  const form = new FormData()
  form.append('file', file, file.type === 'image/webp' ? 'photo.webp' : 'photo.jpg')
  return data<MemberRecord>('PUT', `/members/${enc(memberId)}/photo`, { form })
}
/** Stop (with a reason) or allow again a member's check-in. */
export const setMemberBlocked = (memberId: string, blocked: boolean, reason?: string) =>
  patch<MemberRecord>(`/members/${enc(memberId)}/block`, { blocked, reason })
/** Front desk removes a photo that does not show the member. */
export const removeMemberPhoto = (memberId: string) => del<{ removed: boolean }>(`/members/${enc(memberId)}/photo`)
/** Front desk: members who checked in within the last 1, 2 or 3 hours. */
export const fetchGymCrowdNow = (hours: 1 | 2 | 3) => get<GymCrowd>('/check-ins/crowd', { hours })
/** Latest check-ins of the gym, newest first (the Dashboard live feed). */
export const fetchRecentCheckIns = (limit = 8) => get<RecentCheckIn[]>('/check-ins/recent', { limit })
/** Every member payment, newest first, with totals for the same filters. */
export const fetchPayments = async (filter: ListRange & { method?: PaymentMethod }, limit = 50, offset = 0): Promise<PaymentsPage> => {
  const res = await request<PaymentListItem[]>('GET', '/payments', { query: { ...filter, limit, offset } })
  const meta = res.meta as { total?: number; summary?: PaymentsSummary }
  return { payments: res.data, total: meta?.total ?? res.data.length, summary: meta?.summary ?? { amount: 0, count: 0, byMethod: {} } }
}
/** Every check-in, newest first. */
export const fetchVisits = async (filter: ListRange, limit = 50, offset = 0): Promise<VisitsPage> => {
  const res = await request<VisitListItem[]>('GET', '/visits', { query: { ...filter, limit, offset } })
  return { visits: res.data, total: (res.meta as { total?: number })?.total ?? res.data.length }
}
/** Notice emails prepared for members (logged only for now). */
export const fetchEmailNotices = () => get<EmailNotice[]>('/gym/email-notices')
/* Add-on: Equipment Status */
export const fetchEquipment = () => get<Equipment[]>('/equipment')
export const createEquipment = (input: EquipmentInput) => post<Equipment>('/equipment', input)
export const updateEquipment = (id: string, input: EquipmentInput) => patch<Equipment>(`/equipment/${enc(id)}`, input)
export const deleteEquipment = (id: string) => del<{ removed: boolean }>(`/equipment/${enc(id)}`)
/* Add-on: Coach App (gym admin) */
export const fetchCoaches = () => get<CoachesOverview>('/coaches')
export const inviteCoach = (input: { fullName: string; email: string }) =>
  post<{ inviteToken: string; email: string; fullName: string }>('/coaches', input)
export const resendCoachInvite = (inviteId: string) =>
  post<{ inviteToken: string; email: string; fullName: string }>(`/coaches/invites/${enc(inviteId)}/resend`)
export const cancelCoachInvite = (inviteId: string) => del<{ cancelled: boolean }>(`/coaches/invites/${enc(inviteId)}`)
export const setCoachDisabled = (coachId: string, disabled: boolean) =>
  patch<{ disabled: boolean; freedClients: number }>(`/coaches/${enc(coachId)}`, { disabled })
export const resetCoachPassword = (coachId: string) => post<{ resetToken: string; email: string }>(`/coaches/${enc(coachId)}/reset-password`)
export const releaseCoachClient = (memberId: string) => del<{ released: boolean }>(`/coaches/clients/${enc(memberId)}`)
/** Member: the gym's machine list, read only. */
export const fetchMyEquipment = () => get<Equipment[]>('/me/equipment')
export const fetchGymCrowd = () => get<GymCrowd>('/me/crowd')
/* Add-on: Coach App (member) */
export const fetchMyProgram = () => get<MyProgram>('/me/program')
export const fetchMyNotifications = () => get<{ notifications: MemberNotification[]; unread: number }>('/me/notifications')
export const markMyNotificationsRead = () => post<{ read: boolean }>('/me/notifications/read')
export const clearMyNotifications = () => del<{ cleared: boolean }>('/me/notifications')
export const checkIn = (payload: CheckInPayload) => post<CheckInResult>('/check-ins', payload)

/* ------------------------------------------------------------------ */
/* Coach portal (Coach App add-on)                                     */
/* ------------------------------------------------------------------ */

export const fetchCoachClients = async () => (await get<{ clients: CoachClient[] }>('/coach/clients')).clients
export const fetchAvailableMembers = async (q?: string) =>
  (await get<{ members: AvailableMember[] }>('/coach/available-members', { q: q || undefined })).members
export const addCoachClient = (memberId: string) => post<CoachClientDetail>('/coach/clients', { memberId })
export const removeCoachClient = (memberId: string) => del<{ removed: boolean }>(`/coach/clients/${enc(memberId)}`)
export const fetchCoachClient = (memberId: string) => get<CoachClientDetail>(`/coach/clients/${enc(memberId)}`)
export const saveTrainingProfile = async (memberId: string, input: Omit<TrainingProfile, 'updatedAt'>) =>
  (await put<{ profile: TrainingProfile }>(`/coach/clients/${enc(memberId)}/profile`, input)).profile
export const saveTrainingProgram = (memberId: string, program: TrainingProgram, note?: string) =>
  put<ProgramSaveResult>(`/coach/clients/${enc(memberId)}/program`, { program, note })
export const fetchProgramHistory = async (memberId: string) =>
  (await get<{ versions: ProgramVersion[] }>(`/coach/clients/${enc(memberId)}/history`)).versions
export const restoreProgramVersion = (memberId: string, versionId: string) =>
  post<ProgramSaveResult>(`/coach/clients/${enc(memberId)}/history/${enc(versionId)}/restore`)

/* ------------------------------------------------------------------ */
/* Platform (Alphaexplora super admin)                                 */
/* ------------------------------------------------------------------ */

export const fetchPlatformOverview = () => get<PlatformOverview>('/platform/overview')
export const fetchPlatformGyms = () => get<GymSummary[]>('/platform/gyms')
export const fetchPlatformGym = (gymId: string) => get<GymDetail>(`/platform/gyms/${enc(gymId)}`)
export const createGym = (payload: CreateGymPayload) => post<CreateGymResult>('/platform/gyms', payload)
export const updateGymProfile = (gymId: string, input: GymProfileInput) => put<GymDetail>(`/platform/gyms/${enc(gymId)}`, input)

/** Lets this gym use a fixed member payment day; the gym admin picks the day. */
export const setGymMemberDues = (gymId: string, enabled: boolean) =>
  patch<GymDetail>(`/platform/gyms/${enc(gymId)}/member-dues`, { enabled })

export const setGymSuspended = (gymId: string, suspended: boolean, note?: string) =>
  patch<GymDetail>(`/platform/gyms/${enc(gymId)}/suspension`, { suspended, note })

export const setGymArchived = (gymId: string, archived: boolean) =>
  patch<GymDetail>(`/platform/gyms/${enc(gymId)}/archive`, { archived })

/** Proof of payment (screenshot) for a gym's SteelSync bill. Returns its path for recordGymPayment. */
export const uploadBillingProof = (gymId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return data<ReceiptUpload>('POST', `/platform/gyms/${enc(gymId)}/billing/proof`, { form })
}

/** Records the gym's payment for one month; it is added to the payment log. */
export const recordGymPayment = (gymId: string, payload: RecordGymPaymentPayload) =>
  post<GymDetail>(`/platform/gyms/${enc(gymId)}/billing/payments`, payload)

/** Voids a wrong entry (the month is unpaid again); the log keeps both entries. */
export const voidGymPayment = (gymId: string, period: string, reason: string) =>
  post<GymDetail>(`/platform/gyms/${enc(gymId)}/billing/payments/${enc(period)}/void`, { reason })

/** null = follow the package again. */
export const setGymFeatureOverride = (gymId: string, feature: FeatureKey, value: boolean | null) =>
  put<GymDetail>(`/platform/gyms/${enc(gymId)}/features/${enc(feature)}`, { value })

export const inviteGymAdmin = (gymId: string, email: string) =>
  post<{ detail: GymDetail; inviteToken: string }>(`/platform/gyms/${enc(gymId)}/admins`, { email })

export const setGymAdminDisabled = (gymId: string, userId: string, disabled: boolean) =>
  patch<GymDetail>(`/platform/gyms/${enc(gymId)}/admins/${enc(userId)}`, { disabled })

export const resetGymAdminPassword = (gymId: string, userId: string) =>
  post<{ resetToken: string; email: string }>(`/platform/gyms/${enc(gymId)}/admins/${enc(userId)}/reset-password`)

/** Read-only "View as gym" (30 minutes, logged). */
export const startImpersonation = (gymId: string) => post<AuthSession>(`/platform/gyms/${enc(gymId)}/view-as`)

/** Called with the view-as token still active, so the server knows which gym. */
export const endImpersonation = () => post<{ gymId: string }>('/auth/view-as/end')

export const fetchBillingOverview = (period: string) => get<BillingOverview>('/platform/billing', { period })

export const fetchPackages = () => get<PackageOption[]>('/platform/packages')
export const createPackage = (input: PackageInput) => post<PackageOption>('/platform/packages', input)
export const updatePackage = (packageId: string, input: PackageInput) =>
  put<PackageOption>(`/platform/packages/${enc(packageId)}`, input)
export const deletePackage = (packageId: string) => del<{ id: string }>(`/platform/packages/${enc(packageId)}`)

/** One page of the audit log, newest first, with the total for the same filters. */
export const fetchAuditLog = (filter: { gymId?: string; query?: string } = {}, limit = 10, offset = 0) =>
  request<AuditEntry[]>('GET', '/platform/audit', { query: { gymId: filter.gymId, query: filter.query?.trim(), limit, offset } }).then((res) => ({
    entries: res.data,
    total: (res.meta as { total?: number })?.total ?? res.data.length,
  }))

export const fetchPlatformSettings = () => get<PlatformSettings>('/platform/settings')
export const updatePlatformSettings = (next: PlatformSettings) => put<PlatformSettings>('/platform/settings', next)
