import { useState } from 'react'
import ElementProperties from './properties/ElementProperties'
import PageSettingsPanel from './properties/PageSettingsPanel'
import AssetGallery from './properties/AssetGallery'
import AssetPropertiesWidget from './properties/AssetPropertiesWidget'

/**
 * PropertiesSidebar Component
 * Right sidebar with tabbed interface for properties, assets, and page settings
 */
export default function PropertiesSidebar({
  currentProject,
  selectedElement,
  selectedAssetId,
  onSelectAsset,
  onAddAsset,
}) {
  const [activeTab, setActiveTab] = useState('properties')

  return (
    <aside className="w-72 shrink-0 border-l border-slate-800 flex flex-col bg-slate-900">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <TabButton 
          label="Properties" 
          active={activeTab === 'properties'} 
          onClick={() => setActiveTab('properties')}
        />
        <TabButton 
          label="Assets" 
          active={activeTab === 'assets'} 
          onClick={() => setActiveTab('assets')}
        />
        <TabButton
          label="Page"
          active={activeTab === 'page'}
          onClick={() => setActiveTab('page')}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {selectedElement ? (
              <ElementProperties element={selectedElement} />
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Select an element to edit its properties
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2">
              <AssetGallery 
                imageIds={currentProject.assets?.imageIds || []} 
                selectedAssetId={selectedAssetId}
                onSelect={onSelectAsset}
                onAdd={onAddAsset}
              />
            </div>
            
            {selectedAssetId && (
              <div className="mt-4">
                <AssetPropertiesWidget 
                  assetId={selectedAssetId} 
                  onAdd={onAddAsset}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'page' && (
          <PageSettingsPanel />
        )}
      </div>
    </aside>
  )
}

/**
 * TabButton Component
 */
function TabButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
        active ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
