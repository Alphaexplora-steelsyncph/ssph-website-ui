import type { ReactNode } from 'react'
import type { FeatureKey } from './featureCatalog'
import { useFeature } from './useFeature'

interface Props {
  feature: FeatureKey
  fallback?: ReactNode
  children: ReactNode
}

/** Renders children only when the gym's package (or an override) includes the feature. */
export const FeatureGuard = ({ feature, fallback = null, children }: Props) => {
  const enabled = useFeature(feature)
  return <>{enabled ? children : fallback}</>
}
