import React from 'react'
import ImageElement from './ImageElement'
import SpeechBubbleElement from './SpeechBubbleElement'

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
  
  if (element.type === 'speechBubble') {
    return (
      <SpeechBubbleElement
        element={element}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={onChange}
      />
    )
  }
  
  return null
}
