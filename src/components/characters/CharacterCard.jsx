import { FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import { useCharacterImageFromBlob } from '../../hooks/useCharacterImage'

/**
 * CharacterCard Component
 * Display card for a single character with thumbnail and metadata
 */
export default function CharacterCard({ character, onEdit, onDelete }) {
  // Get profile image URL from blob if available
  const profileImageUrl = useCharacterImageFromBlob(character.profileImage?.blob)

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(character)
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm(`Delete "${character.name}"? This cannot be undone.`)) {
      await onDelete(character.id)
    }
  }

  return (
    <div className="group block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden relative">
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="p-1.5 bg-slate-900/80 hover:bg-indigo-500 rounded-lg transition-colors"
          title="Edit character"
        >
          <FiEdit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 bg-slate-900/80 hover:bg-red-500 rounded-lg transition-colors"
          title="Delete character"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Image */}
      <div
        className="aspect-square bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={handleEdit}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiUser className="w-16 h-16 text-slate-700" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 cursor-pointer" onClick={handleEdit}>
        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {character.name}
        </h3>
        {character.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {character.description}
          </p>
        )}
      </div>
    </div>
  )
}
