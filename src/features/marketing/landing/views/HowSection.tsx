import { Reveal } from '../../../../shared/components/brand/Reveal'
import { Tape } from '../../../../shared/components/brand/Tape'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** Three moves along a chalk line that zig-zags down the page (the phone shape rides the line). */
export const HowSection = ({ vm }: { vm: LandingVM }) => (
  <section id="how-it-works" data-morph="phone" className="floor-speckle relative scroll-mt-16 py-28 sm:py-36">
    <div className="mx-auto max-w-6xl px-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">How it works</p>
      <h2 className="mt-3 font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">Three moves.</h2>
      <div className="relative mt-16">
        <div aria-hidden="true" className="absolute bottom-0 left-4 top-0 border-l-2 border-dashed border-coal-500 md:left-1/2" />
        <ol className="space-y-20 md:space-y-8">
          {vm.moves.map((m, i) => (
            <li key={m.n} className={`relative pl-14 md:w-1/2 md:pl-0 ${i % 2 ? 'md:ml-auto md:pl-16' : 'md:pr-16 md:text-right'}`}>
              <span aria-hidden="true" className={`absolute top-6 left-[9px] size-4 rounded-full bg-chalk md:top-10 ${i % 2 ? 'md:-left-2' : 'md:left-auto md:-right-2'}`} />
              <Reveal motion="load" delay={0.05}>
                <p className="font-display text-[clamp(5rem,14vw,10rem)] leading-none text-outline">{m.n}</p>
                <h3 className="-mt-4 font-display text-5xl uppercase sm:text-6xl">{m.title}</h3>
                <p className={`mt-3 max-w-md text-lg text-chalk-2 ${i % 2 ? '' : 'md:ml-auto'}`}>{m.body}</p>
                <Tape alt={i % 2 === 1} className="mt-5">
                  {m.tag}
                </Tape>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
)
