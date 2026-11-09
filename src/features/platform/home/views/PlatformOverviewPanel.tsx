import { usePlatformHomeViewModel } from '../viewModels/usePlatformHomeViewModel'
import { AttentionList } from './AttentionList'
import { OverviewKpis } from './OverviewKpis'
import { RecentActivity } from './RecentActivity'

/** Section that owns the overview ViewModel; the parts below are presentational. */
export const PlatformOverviewPanel = () => {
  const { overview, error, isLoading } = usePlatformHomeViewModel()
  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-coal-800" />
  if (error || !overview) return <p role="alert" className="text-red-300">{error}</p>
  return (
    <div className="space-y-6">
      <OverviewKpis overview={overview} />
      <div className="grid gap-6 xl:grid-cols-2">
        <AttentionList gyms={overview.attention} />
        <RecentActivity entries={overview.recentActivity} />
      </div>
    </div>
  )
}
