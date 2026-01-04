import React from 'react'

/**
 * Canvas Context Menu Component
 * Right-click menu for element operations
 */
export default function CanvasContextMenu({ 
  visible, 
  x, 
  y, 
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onDelete,
  onClose
}) {
  if (!visible) return null

  return (
    <div 
      className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1.5 w-30 overflow-hidden"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <ContextMenuItem 
        label="Bring to Front" 
        onClick={() => {
          onBringToFront()
          onClose()
        }}
      />
      <ContextMenuItem 
        label="Bring Forward" 
        onClick={() => {
          onBringForward()
          onClose()
        }}
      />
      <ContextMenuItem 
        label="Send Backward" 
        onClick={() => {
          onSendBackward()
          onClose()
        }}
      />
      <ContextMenuItem 
        label="Send to Back" 
        onClick={() => {
          onSendToBack()
          onClose()
        }}
      />
      <div className="h-px bg-slate-700 my-1" />
      <ContextMenuItem 
        label="Delete" 
        className="text-red-400 hover:bg-red-500 hover:text-white"
        onClick={() => {
          onDelete()
          onClose()
        }}
      />
    </div>
  )
}

/**
 * Context Menu Item Component
 */
function ContextMenuItem({ label, onClick, className = '' }) {
  return (
    <button
      className={`w-full text-left px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
