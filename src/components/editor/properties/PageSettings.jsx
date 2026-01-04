import PresetButton from '../ui/PresetButton'
import NumberInput from '../ui/NumberInput'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * PageSettings Component
 * Page dimension settings and presets
 */
export default function PageSettings({ settings, onSettingsChange, onApplyPreset }) {
  const { snapToGrid, setSnapToGrid, snapGridSize, setSnapGridSize } = useProjectStore()

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
        <p className="text-sm text-slate-400">
          Select an element on the canvas to edit its properties.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Page Settings</h4>
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={settings?.width || 800}
                  onChange={(e) => onSettingsChange('width', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Height</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={settings?.height || 1200}
                  onChange={(e) => onSettingsChange('height', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Presets</p>
            <div className="grid grid-cols-1 gap-1.5">
              <PresetButton label="Standard Comic" size="800x1200" onClick={() => onApplyPreset(800, 1200)} />
              <PresetButton label="Manga" size="600x900" onClick={() => onApplyPreset(600, 900)} />
              <PresetButton label="Square" size="1000x1000" onClick={() => onApplyPreset(1000, 1000)} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50">
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
                  step={1}
                  suffix="px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
