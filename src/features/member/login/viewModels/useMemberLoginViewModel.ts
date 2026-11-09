import { useSearchParams } from 'react-router-dom'
import { useLoginFlow } from '../../../../shared/hooks/useLoginFlow'
import { loginMember } from '../../../../shared/models/apiService'
import { safeNextPath } from '../../../../shared/utils/links'

export const useMemberLoginViewModel = () => {
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))
  const flow = useLoginFlow(loginMember, next ?? '/member')
  return { ...flow, isFinishingCheckIn: !!next?.startsWith('/check-in') }
}
