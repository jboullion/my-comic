import React from 'react'

/**
 * Zoom Controls Component
 * Floating controls for zoom level management
 */
export default function ZoomControls({ zoom, onZoomChange, onFitToScreen, onReset }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 shadow-xl z-10">
      <button 
        onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
        className="p-1 hover:text-indigo-400 transition-colors"
        aria-label="Zoom out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <span className="text-xs font-mono min-w-[4rem] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
        className="p-1 hover:text-indigo-400 transition-colors"
        aria-label="Zoom in"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <div className="w-px h-4 bg-slate-700 mx-1" />
      <button 
        onClick={onFitToScreen}
        className="text-xs font-medium hover:text-indigo-400 transition-colors"
      >
        Fit
      </button>
      <button 
        onClick={onReset}
        className="text-xs font-medium hover:text-indigo-400 transition-colors"
      >
        100%
      </button>
    </div>
  )
}
