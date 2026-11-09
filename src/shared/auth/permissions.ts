/** Declarative permission constants. Views and ViewModels reference these, never raw role strings. */
export const PERMISSIONS = {
  VIEW_MEMBERS: 'members.view',
  ENROLL_MEMBERS: 'members.enroll',
  TERMINATE_MEMBERS: 'members.terminate',
  APPROVE_PAYMENTS: 'payments.approve',
  VIEW_VISITS: 'visits.view',
  MANAGE_SETTINGS: 'settings.manage',
  VIEW_OWN_PROFILE: 'profile.view_own',
  VIEW_OWN_VISITS: 'visits.view_own',
  CHECK_IN: 'visits.check_in',
  // Add-on: Coach App
  MANAGE_COACHES: 'coaches.manage',
  COACH_CLIENTS: 'coach.clients',
  VIEW_OWN_PROGRAM: 'program.view_own',
  // Platform (SteelSync super admin)
  PLATFORM_VIEW: 'platform.view',
  PLATFORM_MANAGE_GYMS: 'platform.gyms.manage',
  PLATFORM_MANAGE_BILLING: 'platform.billing.manage',
  PLATFORM_MANAGE_PACKAGES: 'platform.packages.manage',
  PLATFORM_MANAGE_SETTINGS: 'platform.settings.manage',
  PLATFORM_VIEW_AUDIT: 'platform.audit.view',
  PLATFORM_IMPERSONATE: 'platform.impersonate',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/** Default permission sets per role. The backend will own this mapping later; the mock uses it now. */
export const ADMIN_PERMISSIONS: Permission[] = [
  PERMISSIONS.VIEW_MEMBERS,
  PERMISSIONS.ENROLL_MEMBERS,
  PERMISSIONS.TERMINATE_MEMBERS,
  PERMISSIONS.APPROVE_PAYMENTS,
  PERMISSIONS.VIEW_VISITS,
  PERMISSIONS.MANAGE_SETTINGS,
  PERMISSIONS.MANAGE_COACHES,
]

export const MEMBER_PERMISSIONS: Permission[] = [
  PERMISSIONS.VIEW_OWN_PROFILE,
  PERMISSIONS.VIEW_OWN_VISITS,
  PERMISSIONS.CHECK_IN,
  PERMISSIONS.VIEW_OWN_PROGRAM,
]

export const COACH_PERMISSIONS: Permission[] = [PERMISSIONS.COACH_CLIENTS]

export const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  PERMISSIONS.PLATFORM_VIEW,
  PERMISSIONS.PLATFORM_MANAGE_GYMS,
  PERMISSIONS.PLATFORM_MANAGE_BILLING,
  PERMISSIONS.PLATFORM_MANAGE_PACKAGES,
  PERMISSIONS.PLATFORM_MANAGE_SETTINGS,
  PERMISSIONS.PLATFORM_VIEW_AUDIT,
  PERMISSIONS.PLATFORM_IMPERSONATE,
]

/** What a super admin gets while viewing a gym as its admin: read only. */
export const READ_ONLY_ADMIN_PERMISSIONS: Permission[] = [PERMISSIONS.VIEW_MEMBERS, PERMISSIONS.VIEW_VISITS]
