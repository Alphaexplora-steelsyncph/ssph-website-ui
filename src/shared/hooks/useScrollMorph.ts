import { useEffect, useRef } from 'react'

/** One pose of the morphing shape. Sizes are fractions of the smaller screen side; x/y of the screen. */
export interface MorphPose {
  w: number
  h: number
  radius: string // CSS border-radius, same number of values in every pose so it interpolates
  rotate: number // degrees
  x: number // 0..1 of the viewport width (shape centre)
  y: number // 0..1 of the viewport height
  hole: number // 0..1 opacity of the plate's centre hole
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

/** "50% 50% 50% 50% / 50% 50% 50% 50%" -> numbers, so two radii can be blended. */
const radiusNumbers = (r: string) => r.match(/-?\d+(\.\d+)?/g)!.map(Number)
const blendRadius = (a: string, b: string, t: number) => {
  const na = radiusNumbers(a)
  const nb = radiusNumbers(b)
  const v = na.map((n, i) => `${lerp(n, nb[i] ?? n, t).toFixed(2)}%`)
  return `${v.slice(0, 4).join(' ')} / ${v.slice(4, 8).join(' ')}`
}

/**
 * Morphing scroll: one fixed shape that changes form as the page scrolls. Every section that should have a
 * pose carries `data-morph="<pose name>"`. While a section fills the middle of the screen the shape holds that
 * pose; in the last part of the section it morphs into the next one. Styles are written straight to the
 * element (transform, size, radius) in a requestAnimationFrame: no React re-renders while scrolling.
 * Phones use `mobilePoses` (smaller, tucked to the side). Off for "reduce motion": the first pose stays put.
 */
export const useScrollMorph = (poses: Record<string, MorphPose>, mobilePoses: Record<string, MorphPose>) => {
  const shapeRef = useRef<HTMLDivElement>(null)
  const holeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shape = shapeRef.current
    if (!shape) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 767px)')
    let frame = 0

    const apply = (p: MorphPose) => {
      const s = Math.min(window.innerWidth, window.innerHeight)
      const w = p.w * s
      const h = p.h * s
      shape.style.width = `${w}px`
      shape.style.height = `${h}px`
      shape.style.borderRadius = p.radius
      shape.style.transform = `translate3d(${p.x * window.innerWidth - w / 2}px, ${p.y * window.innerHeight - h / 2}px, 0) rotate(${p.rotate}deg)`
      if (holeRef.current) holeRef.current.style.opacity = String(p.hole)
    }

    const update = () => {
      frame = 0
      const table = mobile.matches ? mobilePoses : poses
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-morph]')).filter((el) => table[el.dataset.morph!])
      if (!sections.length) return
      if (reduce.matches) return apply(table[sections[0].dataset.morph!])
      const mid = window.innerHeight * 0.5
      let i = 0
      sections.forEach((el, k) => {
        if (el.getBoundingClientRect().top <= mid) i = k
      })
      const rect = sections[i].getBoundingClientRect()
      const a = table[sections[i].dataset.morph!]
      const next = sections[i + 1] ? table[sections[i + 1].dataset.morph!] : a
      // Hold the pose for most of the section, morph in its last 45%.
      const t = smooth(clamp01((clamp01((mid - rect.top) / Math.max(rect.height, 1)) - 0.55) / 0.45))
      apply({
        w: lerp(a.w, next.w, t),
        h: lerp(a.h, next.h, t),
        radius: blendRadius(a.radius, next.radius, t),
        rotate: lerp(a.rotate, next.rotate, t),
        x: lerp(a.x, next.x, t),
        y: lerp(a.y, next.y, t),
        hole: lerp(a.hole, next.hole, t),
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    mobile.addEventListener('change', schedule)
    // Lazy sections mount later and change the page; re-measure when the DOM grows.
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mobile.removeEventListener('change', schedule)
      observer.disconnect()
    }
  }, [poses, mobilePoses])

  return { shapeRef, holeRef }
}
