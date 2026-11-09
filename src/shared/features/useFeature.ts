import { useAuth } from '../auth/useAuth'
import type { FeatureKey } from './featureCatalog'

/** True when the signed-in user's gym has this feature (package + super admin overrides). */
export const useFeature = (key: FeatureKey) => {
  const { user } = useAuth()
  return !!user?.features?.includes(key)
}
