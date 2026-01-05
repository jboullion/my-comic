import PresetButton from '../ui/PresetButton'
import NumberInput from '../ui/NumberInput'
import CollapsibleSection from './sections/CollapsibleSection'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * PageSettingsPanel Component
 * Per-page settings (dimensions, background) and interaction settings
 */
export default function PageSettingsPanel() {
  const {
    currentProject,
    activePageIndex,
    updatePageSettings,
    snapToGrid,
    setSnapToGrid,
    snapGridSize,
    setSnapGridSize
  } = useProjectStore()

  const currentPage = currentProject?.pages?.[activePageIndex]
  // Get page settings with fallback to project settings for backward compatibility
  const pageSettings = currentPage?.settings || currentProject?.settings || {
    width: 800,
    height: 1200,
    backgroundColor: '#ffffff'
  }

  const handleSettingsChange = (key, value) => {
    updatePageSettings(activePageIndex, { [key]: value })
  }

  const applyPreset = (width, height) => {
    updatePageSettings(activePageIndex, { width, height })
  }

  if (!currentProject) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Page {activePageIndex + 1} Settings
        </h3>
      </div>

      <CollapsibleSection title="Page Size" storageKey="page-size">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width"
            value={pageSettings.width}
            onChange={(val) => handleSettingsChange('width', val)}
            min={100}
            max={4000}
            step={10}
          />
          <NumberInput
            label="Height"
            value={pageSettings.height}
            onChange={(val) => handleSettingsChange('height', val)}
            min={100}
            max={4000}
            step={10}
          />
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Presets</p>
          <div className="grid grid-cols-1 gap-1.5">
            <PresetButton
              label="Standard Comic"
              size="800x1200"
              onClick={() => applyPreset(800, 1200)}
              active={pageSettings.width === 800 && pageSettings.height === 1200}
            />
            <PresetButton
              label="Manga"
              size="600x900"
              onClick={() => applyPreset(600, 900)}
              active={pageSettings.width === 600 && pageSettings.height === 900}
            />
            <PresetButton
              label="Square"
              size="1000x1000"
              onClick={() => applyPreset(1000, 1000)}
              active={pageSettings.width === 1000 && pageSettings.height === 1000}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Background" storageKey="page-background">
        <div className="space-y-3">
          {/* Transparent toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pageSettings.backgroundColor === 'transparent'}
              onChange={(e) => handleSettingsChange('backgroundColor', e.target.checked ? 'transparent' : '#ffffff')}
            />
            <span className="text-sm text-slate-300">Transparent background</span>
          </label>

          {/* Color picker - disabled when transparent */}
          {pageSettings.backgroundColor !== 'transparent' && (
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={pageSettings.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={pageSettings.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
                />
              </div>
            </div>
          )}
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
