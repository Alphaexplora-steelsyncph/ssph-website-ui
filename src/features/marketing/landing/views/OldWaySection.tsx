import { ChalkStroke } from '../../../../shared/components/brand/ChalkStroke'
import { Reveal } from '../../../../shared/components/brand/Reveal'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** The problem: the notebook way, crossed out line by line in chalk. */
export const OldWaySection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="notebook" className="relative overflow-hidden py-28 sm:py-36">
    <div className="mx-auto max-w-6xl px-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">The old way</p>
      <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">Sound familiar?</h2>
      <ul className="mt-14 space-y-9">
        {vm.oldWay.map((item, i) => (
          <li key={item.text} style={{ marginLeft: `${[0, 12, 4, 18, 8][i] ?? 0}%` }} className="max-w-xl">
            <Reveal motion="load" delay={i * 0.06}>
              <p className="relative inline-block font-display text-3xl uppercase text-chalk-2 sm:text-5xl">
                {item.text}
                <ChalkStroke variant="strike" className="absolute -inset-x-2 top-1/2 h-5 w-[calc(100%+1rem)] -translate-y-1/2 text-chalk" delay={0.35 + i * 0.08} />
              </p>
              <p className="mt-2 font-mono text-sm text-steel">{item.note}</p>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-20 text-right">
        <p className="font-display text-[clamp(3rem,9vw,7.5rem)] uppercase leading-none">
          Stop <span className="text-outline">guessing.</span>
        </p>
      </Reveal>
    </div>
  </section>
)
