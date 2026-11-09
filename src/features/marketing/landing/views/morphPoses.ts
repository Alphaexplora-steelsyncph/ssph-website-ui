import type { MorphPose } from '../../../../shared/hooks/useScrollMorph'

/** Poses of the morphing shape, one per section (`data-morph` names). Radius strings all have 8 values. */
const circle = '50% 50% 50% 50% / 50% 50% 50% 50%'

export const DESKTOP_POSES: Record<string, MorphPose> = {
  plate: { w: 0.56, h: 0.56, radius: circle, rotate: 0, x: 0.77, y: 0.52, hole: 1 },
  notebook: { w: 0.34, h: 0.46, radius: '4% 10% 4% 10% / 3% 7% 3% 7%', rotate: -7, x: 0.82, y: 0.5, hole: 0 },
  phone: { w: 0.24, h: 0.5, radius: '18% 18% 18% 18% / 9% 9% 9% 9%', rotate: 4, x: 0.5, y: 0.52, hole: 0 },
  bar: { w: 1.15, h: 0.035, radius: circle, rotate: -3, x: 0.5, y: 0.5, hole: 0 },
  blob: { w: 0.34, h: 0.34, radius: '42% 58% 63% 37% / 45% 39% 61% 55%', rotate: 12, x: 0.86, y: 0.2, hole: 0 },
  qr: { w: 0.26, h: 0.26, radius: '8% 8% 8% 8% / 8% 8% 8% 8%', rotate: -8, x: 0.86, y: 0.7, hole: 0 },
  facts: { w: 0.18, h: 0.18, radius: circle, rotate: 0, x: 0.9, y: 0.22, hole: 1 },
  faq: { w: 0.12, h: 0.12, radius: circle, rotate: 0, x: 0.08, y: 0.82, hole: 1 },
  // Contact: the plate rests behind the heading; the form card sits above the shape.
  contact: { w: 0.42, h: 0.42, radius: circle, rotate: 0, x: 0.18, y: 0.86, hole: 1 },
}

export const MOBILE_POSES: Record<string, MorphPose> = {
  plate: { w: 0.62, h: 0.62, radius: circle, rotate: 0, x: 0.92, y: 0.2, hole: 1 },
  notebook: { w: 0.32, h: 0.44, radius: '4% 10% 4% 10% / 3% 7% 3% 7%', rotate: -9, x: 0.98, y: 0.25, hole: 0 },
  phone: { w: 0.22, h: 0.46, radius: '18% 18% 18% 18% / 9% 9% 9% 9%', rotate: 6, x: 0.07, y: 0.35, hole: 0 },
  bar: { w: 1.8, h: 0.03, radius: circle, rotate: -4, x: 0.5, y: 0.14, hole: 0 },
  blob: { w: 0.38, h: 0.38, radius: '42% 58% 63% 37% / 45% 39% 61% 55%', rotate: 12, x: 1.0, y: 0.18, hole: 0 },
  qr: { w: 0.26, h: 0.26, radius: '8% 8% 8% 8% / 8% 8% 8% 8%', rotate: -8, x: 0.96, y: 0.16, hole: 0 },
  facts: { w: 0.22, h: 0.22, radius: circle, rotate: 0, x: 0.96, y: 0.12, hole: 1 },
  faq: { w: 0.16, h: 0.16, radius: circle, rotate: 0, x: 0.03, y: 0.9, hole: 1 },
  contact: { w: 0.5, h: 0.5, radius: circle, rotate: 0, x: 1.02, y: 0.12, hole: 1 },
}
