import { Outlet } from 'react-router-dom'
import { MemberHeader } from './MemberHeader'
import { MemberNav } from './MemberNav'

/** Signed-in member shell: header with profile menu, tab bar, routed page. */
const MemberLayout = () => (
  <div className="min-h-screen">
    <MemberHeader />
    <MemberNav />
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Outlet />
    </main>
  </div>
)

export default MemberLayout
