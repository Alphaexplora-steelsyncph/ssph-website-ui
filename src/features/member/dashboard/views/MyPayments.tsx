import { PaymentDatesCard } from '../../../../shared/components/PaymentDatesCard'
import { useMyPaymentsViewModel } from '../viewModels/useMyPaymentsViewModel'

export const MyPayments = () => {
  const vm = useMyPaymentsViewModel()
  return <PaymentDatesCard dates={vm.dates} isLoading={vm.isLoading} error={vm.error} summary={vm.summary} />
}
