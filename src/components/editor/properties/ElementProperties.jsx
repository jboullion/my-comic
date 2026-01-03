import { FiTrash2 } from 'react-icons/fi'
import PropertyInput from '../ui/PropertyInput'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * ElementProperties Component
 * Properties panel for selected element
 */
export default function ElementProperties({ element }) {
  const { currentProject, activePageIndex, updateElement } = useProjectStore()
  const currentPage = currentProject?.pages[activePageIndex]
  const panels = currentPage?.elements?.filter(el => el.type === 'panel' && el.id !== element.id) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
        </h3>
        <button 
          onClick={() => useProjectStore.getState().deleteSelectedElements()}
          className="text-slate-500 hover:text-red-400 transition-colors"
          title="Delete element"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PropertyInput 
          label="X" 
          value={Math.round(element.x)} 
          onChange={(val) => updateElement(element.id, { x: val })}
        />
        <PropertyInput 
          label="Y" 
          value={Math.round(element.y)} 
          onChange={(val) => updateElement(element.id, { y: val })}
        />
        <PropertyInput 
          label="Width" 
          value={Math.round(element.width)} 
          onChange={(val) => updateElement(element.id, { width: val })}
        />
        <PropertyInput 
          label="Height" 
          value={Math.round(element.height)} 
          onChange={(val) => updateElement(element.id, { height: val })}
        />
      </div>

      {/* Panel Assignment */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Parent Panel</label>
        <select 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          value={element.panelId || ''}
          onChange={(e) => updateElement(element.id, { panelId: e.target.value || null })}
        >
          <option value="">None (Base Layer)</option>
          {panels.map(panel => (
            <option key={panel.id} value={panel.id}>
              Panel ({Math.round(panel.x)}, {Math.round(panel.y)})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Opacity</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={element.opacity ?? 1}
          onChange={(e) => updateElement(element.id, { opacity: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Rotation</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={element.rotation || 0}
            onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) })}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-400 w-8">{Math.round(element.rotation || 0)}°</span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Border Shape</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Color</label>
            <input 
              type="color" 
              value={element.stroke || '#000000'}
              onChange={(e) => updateElement(element.id, { stroke: e.target.value })}
              className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
            <input 
              type="number" 
              min="0"
              value={element.strokeWidth || 0}
              onChange={(e) => updateElement(element.id, { strokeWidth: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Radius</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max={Math.min(element.width, element.height) / 2} 
              value={element.cornerRadius || 0}
              onChange={(e) => updateElement(element.id, { cornerRadius: parseInt(e.target.value) })}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-xs text-slate-400 w-8">{element.cornerRadius || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Style</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={
                element.cornerRadius === 0 ? 'square' :
                element.cornerRadius === 8 ? 'rounded' :
                element.cornerRadius === 24 ? 'extra-rounded' :
                element.cornerRadius >= Math.min(element.width, element.height) / 2 ? 'pill' : 'custom'
              }
              onChange={(e) => {
                const val = e.target.value
                const maxRadius = Math.min(element.width, element.height) / 2
                if (val === 'square') updateElement(element.id, { cornerRadius: 0 })
                if (val === 'rounded') updateElement(element.id, { cornerRadius: 8 })
                if (val === 'extra-rounded') updateElement(element.id, { cornerRadius: 24 })
                if (val === 'pill') updateElement(element.id, { cornerRadius: maxRadius })
              }}
            >
              <option value="custom">Custom</option>
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="pill">Pill / Circle</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Shape</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={element.cornerShape || 'round'}
              onChange={(e) => updateElement(element.id, { cornerShape: e.target.value })}
            >
              <option value="round">Round</option>
              <option value="bevel">Bevel</option>
              <option value="notch">Notch</option>
              <option value="scoop">Scoop</option>
              <option value="squircle">Squircle</option>
            </select>
          </div>
        </div>
      </div>

      {element.type === 'panel' && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={element.fill || '#ffffff'}
                onChange={(e) => updateElement(element.id, { fill: e.target.value })}
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
