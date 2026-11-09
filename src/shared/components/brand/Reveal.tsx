import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

interface Props {
  children: ReactNode
  /** load = slides in like a plate onto a bar; rise = comes up from below */
  motion?: 'load' | 'rise'
  delay?: number // seconds
  as?: ElementType
  className?: string
}

/** Plays its entrance animation the first time it scrolls into view (CSS only, see index.css). */
export const Reveal = ({ children, motion = 'rise', delay = 0, as: Tag = 'div', className = '' }: Props) => {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={`${motion === 'load' ? 'load-in' : 'rise-in'} ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
