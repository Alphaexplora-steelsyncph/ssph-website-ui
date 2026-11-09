import { ArrowLeft } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AddGymPanel } from './AddGymPanel'

/** Page container: composes sections only. */
const AddGym = memo(() => (
  <>
    <Link to="/platform/gyms" className="mb-4 inline-flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
      <ArrowLeft size={16} /> All gyms
    </Link>
    <h1 className="font-display text-5xl font-extrabold uppercase">Add gym</h1>
    <p className="mb-8 mt-2 max-w-2xl text-steel">
      Creates the gym with the default plans from Platform Settings and an invite for its first admin.
    </p>
    <AddGymPanel />
  </>
))
AddGym.displayName = 'AddGym'

export default AddGym
