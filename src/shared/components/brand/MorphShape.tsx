import { useScrollMorph, type MorphPose } from '../../hooks/useScrollMorph'

interface Props {
  poses: Record<string, MorphPose>
  mobilePoses: Record<string, MorphPose>
}

/**
 * The chalk shape that travels with the scroll (plate → notebook → phone → QR → barbell …).
 * `mix-blend-mode: difference` turns any text it passes behind dark, so it never hides content.
 */
export const MorphShape = ({ poses, mobilePoses }: Props) => {
  const { shapeRef, holeRef } = useScrollMorph(poses, mobilePoses)
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden mix-blend-difference">
      <div ref={shapeRef} className="absolute left-0 top-0 bg-chalk will-change-transform" style={{ width: 0, height: 0 }}>
        <div ref={holeRef} className="absolute inset-[34%] rounded-full bg-ink transition-opacity" />
      </div>
    </div>
  )
}
