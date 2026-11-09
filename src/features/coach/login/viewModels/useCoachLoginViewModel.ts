import { useLoginFlow } from '../../../../shared/hooks/useLoginFlow'
import { loginCoach } from '../../../../shared/models/apiService'

export const useCoachLoginViewModel = () => useLoginFlow(loginCoach, '/coach')
