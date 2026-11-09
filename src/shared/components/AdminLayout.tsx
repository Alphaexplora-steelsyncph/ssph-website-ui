import { Outlet } from 'react-router-dom'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { ImpersonationBanner } from './ImpersonationBanner'

/** Admin workspace shell: header + permission-gated sidebar + routed content. */
const AdminLayout = () => (
  <div className="flex min-h-screen flex-col">
    <ImpersonationBanner />
    <AdminHeader />
    <div className="flex flex-1 flex-col lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  </div>
)

export default AdminLayout
