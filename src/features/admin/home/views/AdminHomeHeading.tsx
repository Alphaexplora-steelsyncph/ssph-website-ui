import { useAdminHomeViewModel } from '../viewModels/useAdminHomeViewModel'

export const AdminHomeHeading = () => {
  const { user } = useAdminHomeViewModel()
  return (
    <>
      <p className="text-sm uppercase tracking-widest text-ember">{user?.gymName}</p>
      <h1 className="mt-1 font-display text-5xl font-extrabold uppercase">Admin dashboard</h1>
      <p className="mt-2 text-steel">Signed in as {user?.fullName}.</p>
    </>
  )
}
