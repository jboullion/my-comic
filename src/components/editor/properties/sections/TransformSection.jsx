import RangeInput from '../../ui/RangeInput'

/**
 * TransformSection Component
 * Opacity and rotation controls (shared across all element types)
 */
export default function TransformSection({ element, onUpdate }) {
  return (
    <>
      <RangeInput
        label="Opacity"
        value={element.opacity ?? 1}
        onChange={(val) => onUpdate({ opacity: val })}
        min={0}
        max={1}
        step={0.01}
      />

      <RangeInput
        label="Rotation"
        value={element.rotation || 0}
        onChange={(val) => onUpdate({ rotation: val })}
        min={-180}
        max={180}
        step={1}
      />
    </>
  )
}
