import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { JsonLd } from '../../../../shared/seo/JsonLd'
import type { LandingVM } from '../viewModels/useLandingViewModel'

/** Native <details> accordion: works without JavaScript, keyboard friendly. */
export const FaqSection = ({ vm }: { vm: LandingVM }) => {
  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: vm.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }),
    [vm.faqs],
  )
  return (
  <section id="faq" data-morph="faq" className="relative scroll-mt-16 py-28 sm:py-36">
    <JsonLd id="ld-faq" data={schema} />
    <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_1.6fr]">
      <div className="md:sticky md:top-28 md:self-start">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">FAQ</p>
        <h2 className="mt-3 font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9]">Questions.</h2>
        <p className="mt-4 text-chalk-2">
          Don&apos;t see your question?{' '}
          <a href={vm.contactHref} onClick={vm.goTo('contact')} className="font-semibold underline underline-offset-4">
            Send us a message
          </a>
          .
        </p>
      </div>
      <div className="divide-y divide-coal-600 border-y border-coal-600">
        {vm.faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus size={22} className="mt-0.5 shrink-0 transition group-open:rotate-45" />
            </summary>
            <p className="mt-3 max-w-2xl text-chalk-2">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
  )
}
