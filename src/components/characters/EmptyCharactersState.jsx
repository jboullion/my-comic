import { FiUsers } from 'react-icons/fi'

/**
 * EmptyCharactersState Component
 * Displayed when user has no characters yet
 */
export default function EmptyCharactersState({ onCreateNew }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiUsers className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium mb-2">No characters yet</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Create characters to build a reusable library for your comics.
        Characters can be used in AI image generation to maintain consistency.
      </p>
      <button
        onClick={onCreateNew}
        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
      >
        Create Your First Character
      </button>
    </div>
  )
}
