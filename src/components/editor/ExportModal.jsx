import { useState } from 'react'
import { FiX, FiDownload } from 'react-icons/fi'

/**
 * ExportModal Component
 * Modal for configuring export options before exporting pages
 */
export default function ExportModal({ isOpen, onClose, onExport, isExporting }) {
  const [format, setFormat] = useState('webp')

  if (!isOpen) return null

  const handleExport = () => {
    onExport({ format })
  }

  const formatOptions = [
    { value: 'webp', label: 'WebP', description: 'Best compression, modern format' },
    { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
    { value: 'jpeg', label: 'JPEG', description: 'Smaller files, no transparency' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Export Pages</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Image Format</label>
            <div className="space-y-2">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    format === option.value
                      ? 'bg-indigo-500/20 border-indigo-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    format === option.value
                      ? 'border-indigo-500'
                      : 'border-slate-500'
                  }`}>
                    {format === option.value && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{option.label}</div>
                    <div className="text-xs text-slate-400">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-slate-500">
            All pages will be exported as a ZIP file containing each page as an image.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}
