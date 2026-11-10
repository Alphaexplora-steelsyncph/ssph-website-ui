import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../../shared/components/Logo'
import type { LegalBlock, LegalDocument } from '../models/legalContent'

/** "**bold**" inside the legal text becomes <strong>. Nothing else is interpreted. */
const inline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-semibold text-chalk">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )

const Block = ({ block }: { block: LegalBlock }) => {
  if (block.kind === 'p') return <p className="leading-relaxed text-zinc-300">{inline(block.text)}</p>
  if (block.kind === 'ul') {
    return (
      <ul className="list-disc space-y-2 pl-5 text-zinc-300">
        {block.items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {inline(item)}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-coal-600">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead className="bg-coal-800">
          <tr>
            {block.head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold text-chalk">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className="border-t border-coal-700 align-top">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-medium text-chalk' : 'text-zinc-300'}`}>
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Shared layout of the public Privacy Policy and Terms of Service pages. Content comes from models/legalContent. */
export const LegalPage = ({ doc, other }: { doc: LegalDocument; other: { to: string; label: string } }) => (
  <div className="min-h-screen bg-charcoal">
    <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
      <Logo />
      <Link to="/" className="flex items-center gap-1.5 text-sm text-steel hover:text-zinc-100">
        <ArrowLeft size={16} /> Back to home
      </Link>
    </header>
    <main className="mx-auto max-w-3xl px-5 pb-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-none">{doc.title}</h1>
      <p className="mt-4 leading-relaxed text-steel">{doc.intro}</p>
      <nav aria-label="On this page" className="mt-8 rounded-xl border border-coal-600 bg-coal-900 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-steel">On this page</p>
        <ol className="mt-2 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:underline">
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-10 space-y-10">
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-6 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">{s.heading}</h2>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ))}
      </div>
      <p className="mt-14 border-t border-coal-600 pt-6 text-sm text-steel">
        See also the{' '}
        <Link to={other.to} className="font-semibold underline underline-offset-4">
          {other.label}
        </Link>
        .
      </p>
    </main>
  </div>
)
