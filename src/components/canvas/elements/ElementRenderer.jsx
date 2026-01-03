import React from 'react'
import ImageElement from './ImageElement'
import PanelElement from './PanelElement'

/**
 * Element Renderer
 * Dispatches rendering to the appropriate element component based on type
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
  
  if (element.type === 'panel') {
    return (
      <PanelElement 
        element={element} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onChange={onChange} 
      />
    )
  }
  
  return null
}
