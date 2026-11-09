import type { ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

/**
 * Renders its children only when they get close to the screen (default: 600px before). Below-the-fold sections
 * use it together with React.lazy, so their code and markup are only fetched / built when someone scrolls there.
 * `minHeight` keeps the page height stable (and the scroll position honest) until then. `force` mounts right away
 * (e.g. when a link jumps to a section further down).
 */
export const LazyMount = ({ children, minHeight = '60vh', id, force = false }: { children: ReactNode; minHeight?: string; id?: string; force?: boolean }) => {
  const { ref, inView: near } = useInView<HTMLDivElement>({ rootMargin: '600px 0px 600px 0px' })
  const inView = near || force
  return (
    <div ref={ref} id={id} style={inView ? undefined : { minHeight }}>
      {inView ? children : null}
    </div>
  )
}
