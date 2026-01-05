import { useState, useRef, useEffect } from 'react'
import ToolButton from './ui/ToolButton'

/**
 * FloatingToolbar Component
 * Floating toolbar with drawing and selection tools
 */
export default function FloatingToolbar({
  tool,
  onToolChange,
  onImageUpload,
  onAddSpeechBubble,
  onAddText,
  onAddTextEffect,
  fileInputRef
}) {
  const [showEffectMenu, setShowEffectMenu] = useState(false)
  const effectMenuRef = useRef(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (effectMenuRef.current && !effectMenuRef.current.contains(e.target)) {
        setShowEffectMenu(false)
      }
    }
    if (showEffectMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEffectMenu])

  const handleEffectSelect = (preset) => {
    onAddTextEffect(preset)
    setShowEffectMenu(false)
  }

  return (
    <div className="flex items-center gap-1">
      <ToolButton
        icon="pointer"
        label="Select (V)"
        active={tool === 'select'}
        onClick={() => onToolChange('select')}
      />
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <ToolButton
        icon="image"
        label="Image (I)"
        active={tool === 'image'}
        onClick={() => fileInputRef.current?.click()}
      />
      <ToolButton
        icon="type"
        label="Text (T)"
        active={tool === 'text'}
        onClick={onAddText}
      />
      <ToolButton
        icon="message-circle"
        label="Speech Bubble (B)"
        active={tool === 'speechBubble'}
        onClick={onAddSpeechBubble}
      />

      {/* Text Effect Button with Dropdown */}
      <div className="relative" ref={effectMenuRef}>
        <ToolButton
          icon="zap"
          label="Text Effect (E)"
          active={showEffectMenu}
          onClick={() => setShowEffectMenu(!showEffectMenu)}
        />

        {showEffectMenu && (
          <div className="absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50 min-w-32">
            <button
              onClick={() => handleEffectSelect('pow')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="text-yellow-400 font-bold">POW!</span>
            </button>
            <button
              onClick={() => handleEffectSelect('bam')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="text-orange-400 font-bold">BAM!</span>
            </button>
            <button
              onClick={() => handleEffectSelect('boom')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="text-red-400 font-bold">BOOM!</span>
            </button>
            <button
              onClick={() => handleEffectSelect('zap')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="text-cyan-400 font-bold">ZAP!</span>
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={() => handleEffectSelect('custom')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors text-slate-400"
            >
              Custom...
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onImageUpload}
      />
    </div>
  )
}
