import NumberInput from '../../ui/NumberInput'

/**
 * SizeSection Component
 * Dimension controls (Width, Height)
 */
export default function SizeSection({ element, onUpdate }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput
        label="Width"
        value={Math.round(element.width)}
        onChange={(val) => onUpdate({ width: val })}
        min={1}
        step={1}
      />
      <NumberInput
        label="Height"
        value={Math.round(element.height)}
        onChange={(val) => onUpdate({ height: val })}
        min={1}
        step={1}
      />
    </div>
  )
}
