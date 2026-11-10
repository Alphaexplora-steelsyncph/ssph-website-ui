import { PaymentDatesCard } from '../../../../shared/components/PaymentDatesCard'
import type { MemberRecord } from '../../../../shared/models/types'
import { useMemberPaymentDatesViewModel } from '../viewModels/useMemberPaymentDatesViewModel'

export const MemberPaymentDates = ({ member }: { member: MemberRecord }) => {
  const vm = useMemberPaymentDatesViewModel(member)
  return <PaymentDatesCard dates={vm.dates} isLoading={vm.isLoading} error={vm.error} summary={vm.summary} />
}
