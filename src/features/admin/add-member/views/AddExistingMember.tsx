import { memo } from 'react'
import { AddExistingMemberHeading } from './AddExistingMemberHeading'
import { AddExistingMemberPanel } from './AddExistingMemberPanel'

/** Page container: composes sections only. */
const AddExistingMember = memo(() => (
  <>
    <AddExistingMemberHeading />
    <AddExistingMemberPanel />
  </>
))
AddExistingMember.displayName = 'AddExistingMember'

export default AddExistingMember
