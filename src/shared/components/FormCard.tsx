import type { ReactNode } from 'react'

/** Numbered form section card (enroll, add existing member). */
export const FormCard = ({ step, title, children }: { step: number; title: string; children: ReactNode }) => (
  <section className="rounded-xl border border-coal-600 bg-coal-800 p-5 sm:p-6">
    <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-bold uppercase">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember text-base text-charcoal">{step}</span>
      {title}
    </h2>
    {children}
  </section>
)
