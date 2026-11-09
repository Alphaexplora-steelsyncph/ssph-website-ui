import { Reveal } from '../../../../shared/components/brand/Reveal'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** Honest facts as one scoreboard number each: no made-up customer stats. */
export const FactsSection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="facts" className="floor-speckle relative overflow-hidden py-28 sm:py-36">
    <div className="mx-auto max-w-6xl px-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Why it is easy</p>
      <div className="mt-10 divide-y divide-coal-600 border-y border-coal-600">
        {vm.facts.map((f, i) => (
          <Reveal key={f.text} motion="load" delay={i * 0.05}>
            <div className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:gap-10">
              <span className="shrink-0 font-mono text-[clamp(3.5rem,9vw,6.5rem)] font-bold leading-none tracking-tight sm:w-56">{f.big}</span>
              <p className="max-w-2xl text-xl text-chalk-2 sm:text-2xl">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)
