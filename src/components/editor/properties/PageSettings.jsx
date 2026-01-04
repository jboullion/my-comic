import PresetButton from '../ui/PresetButton'
import NumberInput from '../ui/NumberInput'
import CollapsibleSection from './sections/CollapsibleSection'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * PageSettings Component
 * Page dimension settings and presets
 */
export default function PageSettings({ settings, onSettingsChange, onApplyPreset }) {
  const { snapToGrid, setSnapToGrid, snapGridSize, setSnapGridSize } = useProjectStore()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Page</h3>
      </div>

      <CollapsibleSection title="Page Size" storageKey="page-size">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width"
            value={settings?.width || 800}
            onChange={(val) => onSettingsChange('width', val)}
            min={100}
            max={4000}
            step={10}
          />
          <NumberInput
            label="Height"
            value={settings?.height || 1200}
            onChange={(val) => onSettingsChange('height', val)}
            min={100}
            max={4000}
            step={10}
          />
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Presets</p>
          <div className="grid grid-cols-1 gap-1.5">
            <PresetButton label="Standard Comic" size="800x1200" onClick={() => onApplyPreset(800, 1200)} />
            <PresetButton label="Manga" size="600x900" onClick={() => onApplyPreset(600, 900)} />
            <PresetButton label="Square" size="1000x1000" onClick={() => onApplyPreset(1000, 1000)} />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Interaction" storageKey="page-interaction">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            <span className="text-sm text-slate-300">Snap to Grid</span>
          </label>
          <div className="w-20">
            <NumberInput
              value={snapGridSize}
              onChange={(val) => setSnapGridSize(val)}
              min={1}
              max={100}
              step={1}
              suffix="px"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
