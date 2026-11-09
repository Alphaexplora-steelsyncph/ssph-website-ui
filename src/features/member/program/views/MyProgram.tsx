import { ClipboardList, EyeOff, UserRound } from 'lucide-react'
import { memo } from 'react'
import { FeatureGuard } from '../../../../shared/features/FeatureGuard'
import { LockedFeature } from '../../../../shared/features/LockedFeature'
import { ExportMenu } from '../../../../shared/training/ExportMenu'
import { ProgramDisplay } from '../../../../shared/training/ProgramDisplay'
import { TrainingProfileCard } from '../../../../shared/training/TrainingProfileCard'
import { useMyProgramViewModel } from '../viewModels/useMyProgramViewModel'

const Empty = ({ icon: Icon, title, text }: { icon: typeof EyeOff; title: string; text: string }) => (
  <div className="rounded-xl border border-dashed border-coal-500 p-8 text-center">
    <Icon size={30} className="mx-auto text-steel" />
    <h2 className="mt-3 font-display text-3xl font-bold uppercase">{title}</h2>
    <p className="mt-1 text-steel">{text}</p>
  </div>
)

const MyProgramPage = () => {
  const vm = useMyProgramViewModel()
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">My program</h1>
          {vm.coachName && <p className="mt-1 text-steel">by Coach {vm.coachName}</p>}
        </div>
        {vm.program && <ExportMenu exporter={vm.exporter} />}
      </div>

      {vm.error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{vm.error}</p>}
      {vm.isLoading && <div className="h-40 animate-pulse rounded-xl bg-coal-800" />}

      {!vm.isLoading && vm.hidden && <Empty icon={EyeOff} title="Program on hold" text={vm.hiddenReason ?? 'Please see the front desk.'} />}
      {!vm.isLoading && !vm.hidden && !vm.error && !vm.program && (
        vm.coachName ? (
          <Empty icon={ClipboardList} title="Coming soon" text={`Coach ${vm.coachName} is still preparing your program. You'll get a notification when it's ready.`} />
        ) : (
          <Empty icon={UserRound} title="No coach yet" text="Ask the front desk about getting a coach. Your program will show up here." />
        )
      )}

      {vm.program && (
        <div className="space-y-6">
          {vm.profile && <TrainingProfileCard profile={vm.profile} />}
          <div className="flex justify-end">
            <button type="button" onClick={vm.toggleFinished} className="text-sm text-steel underline-offset-2 hover:text-zinc-100 hover:underline">
              {vm.showFinished ? 'Hide finished weeks' : 'Show finished weeks'}
            </button>
          </div>
          <ProgramDisplay
            program={vm.program}
            memberName={vm.memberName}
            coachName={vm.coachName}
            gymName={vm.gymName}
            hideCompletedWeeks={!vm.showFinished}
            exportRef={vm.exporter.exportRef}
          />
        </div>
      )}
    </>
  )
}

/** Page container: the member's coach program (Coach App add-on). */
const MyProgram = memo(() => (
  <FeatureGuard feature="coach_app" fallback={<LockedFeature feature="coach_app" audience="member" />}>
    <MyProgramPage />
  </FeatureGuard>
))
MyProgram.displayName = 'MyProgram'

export default MyProgram
