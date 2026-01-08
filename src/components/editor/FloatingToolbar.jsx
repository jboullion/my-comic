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
  onOpenAIModal,
  fileInputRef
}) {
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
      <ToolButton
        icon="zap"
        label="Text Effect (E)"
        onClick={onAddTextEffect}
      />
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <ToolButton
        icon="cpu"
        label="AI Image (A)"
        onClick={onOpenAIModal}
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
