import PropertyInput from '../../ui/PropertyInput'

/**
 * SizeSection Component
 * Position and dimension controls (X, Y, Width, Height)
 */
export default function SizeSection({ element, onUpdate }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PropertyInput
        label="X"
        value={Math.round(element.x)}
        onChange={(val) => onUpdate({ x: val })}
      />
      <PropertyInput
        label="Y"
        value={Math.round(element.y)}
        onChange={(val) => onUpdate({ y: val })}
      />
      <PropertyInput
        label="Width"
        value={Math.round(element.width)}
        onChange={(val) => onUpdate({ width: val })}
      />
      <PropertyInput
        label="Height"
        value={Math.round(element.height)}
        onChange={(val) => onUpdate({ height: val })}
      />
    </div>
  )
}
