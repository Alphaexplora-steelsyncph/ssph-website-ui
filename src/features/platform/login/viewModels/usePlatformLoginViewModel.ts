import { useSearchParams } from 'react-router-dom'
import { useLoginFlow } from '../../../../shared/hooks/useLoginFlow'
import { loginSuperAdmin } from '../../../../shared/models/apiService'

export const usePlatformLoginViewModel = () => {
  const [params] = useSearchParams()
  const flow = useLoginFlow(loginSuperAdmin, '/platform')
  return { ...flow, signedOutForIdle: params.get('reason') === 'idle' }
}
