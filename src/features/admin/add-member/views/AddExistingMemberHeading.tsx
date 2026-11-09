import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AddExistingMemberHeading = () => (
  <>
    <Link to="/admin/members" className="mb-4 inline-flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
      <ArrowLeft size={16} /> Back to members
    </Link>
    <h1 className="font-display text-5xl font-extrabold uppercase">Add existing member</h1>
    <p className="mb-8 mt-2 max-w-2xl text-steel">
      For members who already have a running membership from your old records. No payment is recorded here.
      For a new sign-up or a walk-in, use Enroll instead.
    </p>
  </>
)
