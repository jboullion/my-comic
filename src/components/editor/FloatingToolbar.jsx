import ToolButton from './ui/ToolButton'

/**
 * FloatingToolbar Component
 * Floating toolbar with drawing and selection tools
 */
export default function FloatingToolbar({ 
  tool, 
  onToolChange, 
  onAddPanel,
  onImageUpload,
  fileInputRef 
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-1.5 shadow-2xl z-10">
      <ToolButton 
        icon="pointer" 
        label="Select (V)" 
        active={tool === 'select'} 
        onClick={() => onToolChange('select')}
      />
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <ToolButton 
        icon="square" 
        label="Panel (P)" 
        active={tool === 'panel'} 
        onClick={() => {
          onToolChange('panel')
          onAddPanel()
        }}
      />
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
        onClick={() => onToolChange('text')}
      />
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
