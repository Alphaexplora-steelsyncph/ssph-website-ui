import { memo } from 'react'
import { AuditLogTable } from './AuditLogTable'

/** Page container: composes sections only. */
const AuditLog = memo(() => (
  <>
    <h1 className="font-display text-5xl font-extrabold uppercase">Audit log</h1>
    <p className="mb-8 mt-2 max-w-2xl text-steel">
      Every change made by ALPHAEXPLORA (super admin), gym admins and the system. Entries cannot be edited or deleted.
    </p>
    <AuditLogTable />
  </>
))
AuditLog.displayName = 'AuditLog'

export default AuditLog
