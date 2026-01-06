import useProjectStore from '../../../stores/useProjectStore'
import NumberInput from '../ui/NumberInput'
import CollapsibleSection from './sections/CollapsibleSection'

/**
 * MultiElementProperties Component
 * Shows shared properties when multiple elements are selected
 */
export default function MultiElementProperties({ elements }) {
  const { selectedElementIds, updateElements } = useProjectStore()

  /**
   * Get a shared value across all elements
   * Returns the value if all elements have the same value, or 'mixed' if they differ
   */
  const getSharedValue = (prop, defaultValue = undefined) => {
    const values = elements
      .map(el => el[prop])
      .filter(v => v !== undefined)

    if (values.length === 0) return defaultValue
    const allSame = values.every(v => v === values[0])
    return allSame ? values[0] : 'mixed'
  }

  /**
   * Update all selected elements with the same changes
   */
  const handleBatchUpdate = (updates) => {
    updateElements(selectedElementIds, updates)
  }

  // Determine element types in selection
  const types = [...new Set(elements.map(el => el.type))]
  const allImages = types.every(t => t === 'image')
  const allTextBased = types.every(t => ['text', 'speechBubble', 'textEffect'].includes(t))
  const allSpeechBubbles = types.every(t => t === 'speechBubble')

  // Get shared values
  const opacity = getSharedValue('opacity', 100)

  return (
    <div className="space-y-4">
      {/* Selection Info */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-sm font-medium text-white">
          {elements.length} elements selected
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {types.length === 1
            ? `All ${types[0]}${elements.length > 1 ? 's' : ''}`
            : `Mixed types: ${types.join(', ')}`}
        </div>
      </div>

      {/* Shared Properties */}
      <CollapsibleSection title="Transform" defaultOpen>
        <div className="space-y-3">
          <NumberInput
            label="Opacity"
            value={opacity === 'mixed' ? '' : opacity}
            onChange={(val) => handleBatchUpdate({ opacity: val })}
            min={0}
            max={100}
            step={1}
            placeholder={opacity === 'mixed' ? 'Mixed' : undefined}
          />
          <p className="text-xs text-slate-500">
            Drag any selected element to move all.
          </p>
        </div>
      </CollapsibleSection>

      {/* Text Properties - only if all elements are text-based */}
      {allTextBased && (
        <CollapsibleSection title="Text" defaultOpen>
          <div className="space-y-3">
            <NumberInput
              label="Font Size"
              value={getSharedValue('fontSize') === 'mixed' ? '' : getSharedValue('fontSize')}
              onChange={(val) => handleBatchUpdate({ fontSize: val })}
              min={8}
              max={200}
              step={1}
              placeholder={getSharedValue('fontSize') === 'mixed' ? 'Mixed' : undefined}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Actions */}
      <CollapsibleSection title="Actions" defaultOpen>
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-3">
            Use keyboard shortcuts for batch operations:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-500">Delete</div>
            <div className="text-slate-300">Del / Backspace</div>
            <div className="text-slate-500">Nudge</div>
            <div className="text-slate-300">Arrow keys</div>
            <div className="text-slate-500">Add to selection</div>
            <div className="text-slate-300">Ctrl+Click</div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
