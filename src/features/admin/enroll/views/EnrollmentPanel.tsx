import { useEnrollMemberViewModel } from '../viewModels/useEnrollMemberViewModel'
import { EnrollmentSuccess } from './EnrollmentSuccess'
import { EnrollmentSummary } from './EnrollmentSummary'
import { MemberDetailsFields } from './MemberDetailsFields'
import { PaymentDayFields } from './PaymentDayFields'
import { PaymentFields } from './PaymentFields'
import { PlanPicker } from './PlanPicker'

/**
 * Section that owns the enrollment ViewModel. The form parts below are presentational
 * and receive the same ViewModel instance, so they share one form state.
 */
export const EnrollmentPanel = () => {
  const vm = useEnrollMemberViewModel()

  if (vm.result) return <EnrollmentSuccess result={vm.result} photoFailed={vm.photoFailed} onEnrollAnother={vm.reset} />

  return (
    <form onSubmit={vm.submit} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <MemberDetailsFields vm={vm} />
        <PlanPicker vm={vm} />
        <PaymentDayFields vm={vm} />
        <PaymentFields vm={vm} />
      </div>
      <EnrollmentSummary vm={vm} />
    </form>
  )
}
