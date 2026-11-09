import { useLoginFlow } from '../../../../shared/hooks/useLoginFlow'
import { loginAdmin } from '../../../../shared/models/apiService'

export const useAdminLoginViewModel = () => useLoginFlow(loginAdmin, '/admin')
