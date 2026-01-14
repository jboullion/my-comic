import { useMemo } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import useProjectStore from '../../../stores/useProjectStore'
import CollapsibleSection from './sections/CollapsibleSection'
import SizeSection from './sections/SizeSection'
import BorderShapeSection from './sections/BorderShapeSection'
import BubbleStyleSection from './sections/BubbleStyleSection'
import TextSection from './sections/TextSection'
import TextStyleSection from './sections/TextStyleSection'
import TextEffectStyleSection from './sections/TextEffectStyleSection'
import TransformSection from './sections/TransformSection'
import { getProjectFonts } from '../../../lib/fonts'

/**
 * ElementProperties Component
 * Properties panel for selected element - orchestrates section components
 */
export default function ElementProperties({ element }) {
  const { updateElement, currentProject } = useProjectStore()

  // Get project fonts based on font settings
  const projectFonts = useMemo(() => {
    const fontScript = currentProject?.settings?.fontScript || 'latin'
    const customFonts = currentProject?.settings?.customFonts || []
    return getProjectFonts(fontScript, customFonts)
  }, [currentProject?.settings?.fontScript, currentProject?.settings?.customFonts])

  const handleUpdate = (updates) => {
    updateElement(element.id, updates)
  }

  // Map element type to display name
  const getDisplayName = (type) => {
    const names = {
      image: 'Image',
      speechBubble: 'Speech Bubble',
      text: 'Text',
      textEffect: 'Text Effect'
    }
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with element type and delete button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {getDisplayName(element.type)}
        </h3>
        <button
          onClick={() => useProjectStore.getState().deleteSelectedElements()}
          className="text-slate-500 hover:text-red-400 transition-colors"
          title="Delete element"
          type="button"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image-specific sections */}
      {element.type === 'image' && (
        <>
          <CollapsibleSection
            title="Image Size"
            storageKey="image-size"
          >
            <SizeSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Border Shape"
            storageKey="image-border"
          >
            <BorderShapeSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>
        </>
      )}

      {/* Speech Bubble-specific sections */}
      {element.type === 'speechBubble' && (
        <>
          <CollapsibleSection
            title="Size"
            storageKey="bubble-size"
          >
            <SizeSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Bubble Style"
            storageKey="bubble-style"
          >
            <BubbleStyleSection element={element} onUpdate={handleUpdate} projectFonts={projectFonts} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Text"
            storageKey="bubble-text"
          >
            <TextSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>
        </>
      )}

      {/* Text-specific sections */}
      {element.type === 'text' && (
        <>
          <CollapsibleSection
            title="Size"
            storageKey="text-size"
          >
            <SizeSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Text Style"
            storageKey="text-style"
          >
            <TextStyleSection element={element} onUpdate={handleUpdate} projectFonts={projectFonts} />
          </CollapsibleSection>
        </>
      )}

      {/* Text Effect-specific sections */}
      {element.type === 'textEffect' && (
        <>
          <CollapsibleSection
            title="Size"
            storageKey="textEffect-size"
          >
            <SizeSection element={element} onUpdate={handleUpdate} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Effect Style"
            storageKey="textEffect-style"
          >
            <TextEffectStyleSection element={element} onUpdate={handleUpdate} projectFonts={projectFonts} />
          </CollapsibleSection>
        </>
      )}

      {/* Transform section - shared across all element types */}
      <CollapsibleSection
        title="Transform"
        storageKey={`${element.type}-transform`}
      >
        <TransformSection element={element} onUpdate={handleUpdate} />
      </CollapsibleSection>
    </div>
  )
}
