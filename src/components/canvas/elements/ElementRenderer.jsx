import React from 'react'
import ImageElement from './ImageElement'

/**
 * Element Renderer
 * Dispatches rendering to the appropriate element component based on type
 * Note: Speech bubbles are rendered as HTML overlays, not through this renderer
 */
export default function ElementRenderer({ element, isSelected, onSelect, onChange }) {
  if (element.type === 'image') {
    return (
      <ImageElement 
        element={element} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onChange={onChange} 
      />
    )
  }
  
  return null
}
