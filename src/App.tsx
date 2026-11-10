import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { ScrollToTop } from './shared/components/ScrollToTop'
import { currentGymSlug } from './shared/tenant/tenant'

/** Read once: the address of a page never changes while it is open. */
const gymSlug = currentGymSlug()

// Page-level views are lazy loaded (MVVM house standard)
const AdminLayout = lazy(() => import('./shared/components/AdminLayout'))
const MemberLayout = lazy(() => import('./shared/components/MemberLayout'))
const PlatformLayout = lazy(() => import('./shared/components/PlatformLayout'))
const CoachLayout = lazy(() => import('./shared/components/CoachLayout'))

// Main domain: marketing site. A gym's own address (<slug>.steelsync.ph): the "who are you?" page.
const Landing = lazy(() => import('./features/marketing/landing/views/Landing'))
const GymPortal = lazy(() => import('./features/gym-portal/views/GymPortal'))

// features/legal: public Privacy Policy and Terms of Service (also on a gym's own address)
const PrivacyPolicy = lazy(() => import('./features/legal/views/PrivacyPolicy'))
const Terms = lazy(() => import('./features/legal/views/Terms'))

// features/member/*
const MemberLogin = lazy(() => import('./features/member/login/views/MemberLogin'))
const MemberRegister = lazy(() => import('./features/member/register/views/MemberRegister'))
const MemberDashboard = lazy(() => import('./features/member/dashboard/views/MemberDashboard'))
const MemberVisits = lazy(() => import('./features/member/visits/views/MemberVisits'))
const MemberProfile = lazy(() => import('./features/member/profile/views/MemberProfile'))
const ActivateAccount = lazy(() => import('./features/member/activate/views/ActivateAccount'))
const CheckIn = lazy(() => import('./features/member/check-in/views/CheckIn'))
const ScanQr = lazy(() => import('./features/member/scan/views/ScanQr'))
const MyProgram = lazy(() => import('./features/member/program/views/MyProgram'))

// features/admin/*
const AdminLogin = lazy(() => import('./features/admin/login/views/AdminLogin'))
const AdminHome = lazy(() => import('./features/admin/home/views/AdminHome'))
const UserManagement = lazy(() => import('./features/admin/members/views/UserManagement'))
const MemberDetail = lazy(() => import('./features/admin/member-detail/views/MemberDetail'))
const EnrollMember = lazy(() => import('./features/admin/enroll/views/EnrollMember'))
const AddExistingMember = lazy(() => import('./features/admin/add-member/views/AddExistingMember'))
const Settings = lazy(() => import('./features/admin/settings/views/Settings'))
const Payments = lazy(() => import('./features/admin/payments/views/Payments'))
const Visits = lazy(() => import('./features/admin/visits/views/Visits'))
const Equipment = lazy(() => import('./features/admin/equipment/views/Equipment'))
const Coaches = lazy(() => import('./features/admin/coaches/views/Coaches'))

// features/coach/* (Coach App add-on)
const CoachLogin = lazy(() => import('./features/coach/login/views/CoachLogin'))
const CoachClients = lazy(() => import('./features/coach/clients/views/CoachClients'))
const CoachClient = lazy(() => import('./features/coach/client/views/CoachClient'))
const ProgramEditor = lazy(() => import('./features/coach/program-editor/views/ProgramEditor'))

// features/platform/* (SteelSync super admin)
const PlatformLogin = lazy(() => import('./features/platform/login/views/PlatformLogin'))
const PlatformHome = lazy(() => import('./features/platform/home/views/PlatformHome'))
const PlatformGyms = lazy(() => import('./features/platform/gyms/views/PlatformGyms'))
const AddGym = lazy(() => import('./features/platform/add-gym/views/AddGym'))
const GymDetail = lazy(() => import('./features/platform/gym-detail/views/GymDetail'))
const PlatformBilling = lazy(() => import('./features/platform/billing/views/PlatformBilling'))
const PlatformPackages = lazy(() => import('./features/platform/packages/views/PlatformPackages'))
const AuditLog = lazy(() => import('./features/platform/audit-log/views/AuditLog'))
const PlatformSettingsPage = lazy(() => import('./features/platform/settings/views/PlatformSettingsPage'))

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-charcoal">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-coal-500 border-t-ember" />
  </div>
)

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Member / public */}
          <Route path="/" element={gymSlug ? <GymPortal slug={gymSlug} /> : <Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<MemberLogin />} />
          <Route path="/register" element={<MemberRegister />} />
          <Route path="/activate" element={<ActivateAccount />} />
          {/* Public route: the page itself sends signed-out members to /login?next=… and back */}
          <Route path="/check-in" element={<CheckIn />} />
          <Route element={<ProtectedRoute role="Member" redirectTo="/login" />}>
            <Route path="/member/scan" element={<ScanQr />} />
            <Route element={<MemberLayout />}>
              <Route path="/member" element={<MemberDashboard />} />
              <Route path="/member/program" element={<MyProgram />} />
              <Route path="/member/visits" element={<MemberVisits />} />
              <Route path="/member/profile" element={<MemberProfile />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute role="Admin" redirectTo="/admin/login" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/members" element={<UserManagement />} />
              <Route path="/admin/members/add" element={<AddExistingMember />} />
              <Route path="/admin/members/:memberId" element={<MemberDetail />} />
              <Route path="/admin/enroll" element={<EnrollMember />} />
              <Route path="/admin/payments" element={<Payments />} />
              <Route path="/admin/visits" element={<Visits />} />
              <Route path="/admin/equipment" element={<Equipment />} />
              <Route path="/admin/coaches" element={<Coaches />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Coach (Coach App add-on) */}
          <Route path="/coach/login" element={<CoachLogin />} />
          <Route element={<ProtectedRoute role="Coach" redirectTo="/coach/login" />}>
            <Route element={<CoachLayout />}>
              <Route path="/coach" element={<CoachClients />} />
              <Route path="/coach/clients/:memberId" element={<CoachClient />} />
              <Route path="/coach/clients/:memberId/program/edit" element={<ProgramEditor key="edit" mode="edit" />} />
              <Route path="/coach/clients/:memberId/program/new" element={<ProgramEditor key="new" mode="new" />} />
            </Route>
          </Route>

          {/* Platform (super admin) — not linked from the public site */}
          <Route path="/platform/login" element={<PlatformLogin />} />
          <Route element={<ProtectedRoute role="SuperAdmin" redirectTo="/platform/login" />}>
            <Route element={<PlatformLayout />}>
              <Route path="/platform" element={<PlatformHome />} />
              <Route path="/platform/gyms" element={<PlatformGyms />} />
              <Route path="/platform/gyms/new" element={<AddGym />} />
              <Route path="/platform/gyms/:gymId" element={<GymDetail />} />
              <Route path="/platform/billing" element={<PlatformBilling />} />
              <Route path="/platform/packages" element={<PlatformPackages />} />
              <Route path="/platform/audit" element={<AuditLog />} />
              <Route path="/platform/settings" element={<PlatformSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
