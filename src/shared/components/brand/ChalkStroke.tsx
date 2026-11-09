import type { CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'

/** Hand-drawn chalk marks that draw themselves in when they scroll into view. Pure SVG. */
const PATHS = {
  underline: { viewBox: '0 0 300 40', d: 'M6 28 C 70 10, 150 34, 294 14', len: 320 },
  circle: { viewBox: '0 0 300 120', d: 'M150 10 C 60 8, 8 40, 14 66 C 22 104, 120 114, 196 106 C 268 98, 300 64, 278 36 C 258 12, 196 6, 120 16', len: 900 },
  strike: { viewBox: '0 0 300 30', d: 'M4 18 C 90 8, 200 24, 296 10', len: 310 },
  arrow: { viewBox: '0 0 120 90', d: 'M8 12 C 40 70, 70 78, 108 70 M92 56 L110 70 L90 84', len: 260 },
} as const

interface Props {
  variant: keyof typeof PATHS
  className?: string
  strokeWidth?: number
  delay?: number
}

export const ChalkStroke = ({ variant, className = '', strokeWidth = 6, delay = 0.15 }: Props) => {
  const { ref, inView } = useInView<SVGSVGElement>()
  const p = PATHS[variant]
  return (
    <svg
      ref={ref}
      viewBox={p.viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`chalk-draw pointer-events-none ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--len': p.len, '--delay': `${delay}s` } as CSSProperties}
    >
      <path d={p.d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
