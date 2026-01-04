import NumberInput from '../../ui/NumberInput'

/**
 * SizeSection Component
 * Position and dimension controls (X, Y, Width, Height)
 */
export default function SizeSection({ element, onUpdate }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberInput
        label="X"
        value={Math.round(element.x)}
        onChange={(val) => onUpdate({ x: val })}
        step={1}
      />
      <NumberInput
        label="Y"
        value={Math.round(element.y)}
        onChange={(val) => onUpdate({ y: val })}
        step={1}
      />
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
