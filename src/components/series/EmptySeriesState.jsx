import { FiPlus } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'

/**
 * EmptySeriesState Component
 * Shown when there are no series
 */
export default function EmptySeriesState({ onCreateNew }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
        <RiBookShelfFill className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No series yet</h3>
      <p className="text-slate-400 mb-6 max-w-sm mx-auto">
        Create a series to organize your projects and characters together.
        Characters in a series are shared across all projects in that series.
      </p>
      <button
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
      >
        <FiPlus className="w-5 h-5" />
        Create your first series
      </button>
    </div>
  )
}
