import { useState, useRef, useCallback } from 'react'
import { FiUploadCloud, FiX } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'

/**
 * SeriesImageUpload Component
 * Drag/drop or click to upload a cover image for a series
 */
export default function SeriesImageUpload({
  label,
  value, // { blob, url } or null
  onChange,
  onRemove,
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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
          aspect-[16/9] w-full
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
              alt="Cover preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              title="Remove image"
            >
              <FiX className="w-4 h-4 text-white" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            {isDragging ? (
              <FiUploadCloud className="w-10 h-10 text-indigo-400" />
            ) : (
              <>
                <RiBookShelfFill className="w-10 h-10 mb-2" />
                <span className="text-xs text-center px-4">Drop an image or click to upload a cover</span>
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
