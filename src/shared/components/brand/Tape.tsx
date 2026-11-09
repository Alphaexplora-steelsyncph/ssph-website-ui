import type { ReactNode } from 'react'

/** Lifting-tape label (chalk on ink, slightly crooked). */
export const Tape = ({ children, alt = false, className = '' }: { children: ReactNode; alt?: boolean; className?: string }) => (
  <span className={`tape ${alt ? 'tape-alt' : ''} ${className}`}>{children}</span>
)
