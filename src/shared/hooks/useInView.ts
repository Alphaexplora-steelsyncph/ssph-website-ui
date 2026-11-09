import { useEffect, useRef, useState } from 'react'

/**
 * True once the element has come near the viewport (and stays true). One IntersectionObserver per element,
 * no scroll listeners. Used for reveal animations and for mounting below-the-fold content late.
 */
export const useInView = <T extends Element>({ rootMargin = '0px 0px -12% 0px', once = true } = {}) => {
  const ref = useRef<T>(null)
  // Very old browsers without IntersectionObserver just show everything.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) setInView(false)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return { ref, inView }
}
