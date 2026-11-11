import { Reveal } from '../../../../shared/components/brand/Reveal'
import { Tape } from '../../../../shared/components/brand/Tape'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** Rows get narrower like plates on a bar: 25 kg is the widest, 5 kg the slimmest. Add-ons are dashed. */
const WIDTH: Record<string, string> = { '25': 'md:w-full', '20': 'md:w-[94%]', '15': 'md:w-[88%]', '10': 'md:w-[82%]', '5': 'md:w-[76%]', '+': 'md:w-[70%]' }

/** Features as plates loaded onto the bar (the morphing shape becomes the bar here). */
export const PlatesSection = ({ vm }: { vm: LandingVM }) => (
  <section id="features" data-morph="bar" className="relative scroll-mt-16 overflow-hidden py-28 sm:py-36">
    <div className="mx-auto max-w-6xl px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Gym management features</p>
          <h2 className="mt-3 font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">Load the bar.</h2>
        </div>
        <p className="max-w-sm text-chalk-2">Every part of {vm.productName} is a plate. Start with the core, add the add-ons when your gym is ready.</p>
      </div>
      <div className="mt-14 flex flex-col items-center gap-4">
        {vm.plates.map((p, i) => (
          <Reveal key={p.title} motion="load" delay={i * 0.05} className={`w-full ${WIDTH[p.weight] ?? ''}`}>
            <article
              className={`flex flex-col gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:gap-7 sm:rounded-full sm:py-5 sm:pl-5 sm:pr-10 ${
                p.addOn ? 'border-2 border-dashed border-coal-500 bg-ink/60' : 'bg-coal-800'
              }`}
            >
              <span
                className={`flex size-20 shrink-0 items-center justify-center rounded-full font-mono text-2xl font-bold ${
                  p.addOn ? 'border-2 border-dashed border-chalk/60 text-chalk' : 'bg-chalk text-ink'
                }`}
                aria-hidden="true"
              >
                {p.weight}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-3xl uppercase leading-none">{p.title}</h3>
                  {p.addOn && <Tape alt>Add-on</Tape>}
                </div>
                <p className="mt-1 text-chalk-2">{p.body}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-chalk-2 sm:max-w-xs">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-chalk" />
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)
