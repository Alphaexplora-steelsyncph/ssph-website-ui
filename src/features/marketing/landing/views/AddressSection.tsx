import { Dumbbell, ShieldCheck, UserRound } from 'lucide-react'
import { Reveal } from '../../../../shared/components/brand/Reveal'
import type { LandingVM } from '../viewModels/useLandingViewModel'

const ROLES = [
  { icon: UserRound, label: 'Member' },
  { icon: ShieldCheck, label: 'Admin' },
  { icon: Dumbbell, label: 'Coach' },
]

/** Every gym gets its own address with a "who are you?" page. Shown as a small phone-browser mock (HTML, no image). */
export const AddressSection = ({ vm }: { vm: LandingVM }) => (
  <section data-morph="qr" className="relative overflow-hidden py-28 sm:py-36">
    <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Your own gym portal</p>
        <h2 className="mt-3 font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">A link of your own.</h2>
        <p className="mt-6 max-w-lg text-lg text-chalk-2">
          Every gym gets its own address. Members, the front desk and coaches open it, pick who they are, and log in. Only your gym&apos;s
          accounts work there.
        </p>
        <p className="mt-6 inline-block break-all rounded-lg bg-coal-800 px-4 py-3 font-mono text-lg text-chalk sm:text-xl">{vm.exampleAddress}</p>
      </div>
      <Reveal motion="load" className="mx-auto w-full max-w-[19rem]">
        <div className="rounded-[2.4rem] border-[10px] border-coal-700 bg-ink p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 rounded-full bg-coal-800 px-3 py-2 font-mono text-[11px] text-chalk-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="truncate">{vm.exampleAddress}</span>
          </div>
          <div className="px-3 pb-6 pt-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Welcome to</p>
            <p className="mt-1 font-display text-3xl uppercase leading-none">Barbell Bros Gym</p>
            <p className="mt-6 text-xs text-steel">Who are you?</p>
            <div className="mt-3 space-y-2.5">
              {ROLES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-full border-2 border-chalk/80 px-4 py-2.5 text-left">
                  <Icon size={16} />
                  <span className="font-display text-xl uppercase">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
)
