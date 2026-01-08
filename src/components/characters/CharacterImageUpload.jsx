import { useState, useRef, useCallback } from 'react'
import { FiUploadCloud, FiX, FiUser } from 'react-icons/fi'

/**
 * CharacterImageUpload Component
 * Drag/drop or click to upload an image with preview
 */
export default function CharacterImageUpload({
  label,
  value, // { blob, url } or null
  onChange,
  onRemove,
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) return

      // Create a preview URL
      const url = URL.createObjectURL(file)
      onChange({ file, url })
    },
    [onChange]
  )

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove?.()
  }

  const imageUrl = value?.url || (value?.blob ? URL.createObjectURL(value.blob) : null)

  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
          {label}
        </label>
      )}

      <div
        className={`
          ${sizeClasses[size]}
          relative rounded-xl border-2 border-dashed transition-colors cursor-pointer
          ${isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : imageUrl
              ? 'border-slate-700 bg-slate-800'
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
          }
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              title="Remove image"
            >
              <FiX className="w-3 h-3 text-white" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            {isDragging ? (
              <FiUploadCloud className="w-8 h-8 text-indigo-400" />
            ) : (
              <>
                <FiUser className="w-8 h-8 mb-1" />
                <span className="text-[10px] text-center px-2">Drop or click</span>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
