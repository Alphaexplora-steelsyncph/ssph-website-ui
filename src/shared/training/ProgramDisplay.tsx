import type { Ref } from 'react'
import type { TrainingProgram } from '../models/types'
import { ProgramCards } from './ProgramCards'
import { ProgramSheet } from './ProgramSheet'

interface Props {
  program: TrainingProgram
  memberName?: string
  coachName?: string
  gymName?: string
  hideCompletedWeeks?: boolean
  /** When given, an off-screen full-width copy is rendered for PNG/PDF downloads (see useProgramExport). */
  exportRef?: Ref<HTMLDivElement>
}

/** Read-only program: cards on phones, the printable sheet on larger screens, plus the hidden export copy. */
export const ProgramDisplay = ({ program, memberName, coachName, gymName, hideCompletedWeeks = false, exportRef }: Props) => (
  <>
    <div className="sm:hidden">
      <ProgramCards program={program} hideCompletedWeeks={hideCompletedWeeks} />
    </div>
    <div className="hidden sm:block">
      <ProgramSheet program={program} memberName={memberName} coachName={coachName} gymName={gymName} hideCompletedWeeks={hideCompletedWeeks} />
    </div>
    {exportRef && (
      // Off screen, never shown. Not display:none, so it keeps a real layout to capture.
      <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0 w-max min-w-[1000px]">
        <div ref={exportRef} className="w-max min-w-[1000px]">
          <ProgramSheet program={program} memberName={memberName} coachName={coachName} gymName={gymName} forExport />
        </div>
      </div>
    )}
  </>
)
