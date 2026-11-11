import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

/** Crosses out its text with a hand-drawn chalk line. Unlike ChalkStroke, it draws one line per wrapped line of text. */
export const ChalkStrike = ({ children, delay = 0.3 }: { children: ReactNode; delay?: number }) => {
  const { ref, inView } = useInView<HTMLSpanElement>()
  return (
    <span ref={ref} className={`chalk-strike ${inView ? 'is-in' : ''}`} style={{ '--delay': `${delay}s` } as CSSProperties}>
      {children}
    </span>
  )
}
