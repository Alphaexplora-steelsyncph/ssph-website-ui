import { Reveal } from '../../../../shared/components/brand/Reveal'
import { Tape } from '../../../../shared/components/brand/Tape'
import type { LandingVM } from '../viewModels/useLandingViewModel'

const TILT = ['-rotate-2', 'rotate-[1.5deg]', '-rotate-1', 'rotate-2']
const DROP = ['md:mt-0', 'md:mt-16', 'md:-mt-6', 'md:mt-10']

/** Notes pinned on the gym's board: one per person who uses the system. */
export const RolesSection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="blob" className="floor-speckle relative overflow-hidden py-28 sm:py-36">
    <div className="mx-auto max-w-6xl px-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Gym software for the whole gym</p>
      <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">
        One system, <span className="text-outline">four people.</span>
      </h2>
      <div className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-12 md:justify-between">
        {vm.roles.map((r, i) => (
          <Reveal key={r.role} delay={i * 0.08} className={`w-full max-w-[17rem] sm:w-[calc(50%-1.5rem)] md:w-[calc(25%-1.5rem)] ${DROP[i]}`}>
            <article className={`relative bg-chalk px-5 pb-6 pt-9 text-ink shadow-[6px_8px_0_rgba(0,0,0,0.45)] ${TILT[i]}`}>
              <Tape className="absolute -top-3 left-1/2 -translate-x-1/2 !bg-coal-500 !text-chalk">{r.role}</Tape>
              <p className="font-display text-3xl uppercase leading-[0.95]">{r.line}</p>
              <ul className="mt-4 space-y-1.5 border-t-2 border-dashed border-ink/25 pt-3 text-sm">
                {r.points.map((pt) => (
                  <li key={pt}>— {pt}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)
