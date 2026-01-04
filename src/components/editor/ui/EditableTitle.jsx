import { useState } from 'react'

/**
 * EditableTitle Component
 * Click-to-edit title field
 */
export default function EditableTitle({ title, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(title)

  const handleBlur = () => {
    setIsEditing(false)
    onSave(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setValue(title)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="font-medium bg-slate-800 border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="font-medium hover:text-indigo-400 transition-colors"
      title="Click to edit"
    >
      {title}
    </button>
  )
}
