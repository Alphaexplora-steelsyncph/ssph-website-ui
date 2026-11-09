import { ArrowLeft } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { GymDetailPanel } from './GymDetailPanel'

/** Page container: composes sections only. */
const GymDetail = memo(() => (
  <>
    <Link to="/platform/gyms" className="mb-4 inline-flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
      <ArrowLeft size={16} /> All gyms
    </Link>
    <GymDetailPanel />
  </>
))
GymDetail.displayName = 'GymDetail'

export default GymDetail
