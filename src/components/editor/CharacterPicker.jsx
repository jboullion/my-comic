import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCopy, FiUser, FiUsers, FiExternalLink } from 'react-icons/fi'
import useCharactersStore from '../../stores/useCharactersStore'
import { useCharacterImageFromBlob } from '../../hooks/useCharacterImage'

/**
 * CharacterPickerItem Component
 * Individual character checkbox item with thumbnail
 */
function CharacterPickerItem({ character, selected, onToggle, disabled }) {
  const profileImageUrl = useCharacterImageFromBlob(character.profileImage?.blob)

  return (
    <label
      className={`
        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
        ${selected ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-slate-700/50 border border-transparent'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(character.id)}
        disabled={disabled}
        className="sr-only"
      />

      {/* Thumbnail */}
      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiUser className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Name */}
      <span className="text-sm text-white truncate flex-1">{character.name}</span>

      {/* Selection indicator */}
      <div
        className={`
          w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
          ${selected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}
        `}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </label>
  )
}

/**
 * CharacterPicker Component
 * Multi-select character picker for AI image generation
 */
export default function CharacterPicker({
  selectedIds = [],
  onChange,
  disabled = false,
  className = ''
}) {
  const { characters, charactersLoading, loadCharacters } = useCharactersStore()
  const [copied, setCopied] = useState(false)

  // Load characters on mount if not already loaded
  useEffect(() => {
    if (characters.length === 0 && !charactersLoading) {
      loadCharacters()
    }
  }, [characters.length, charactersLoading, loadCharacters])

  const handleToggle = (characterId) => {
    if (disabled) return

    const newSelected = selectedIds.includes(characterId)
      ? selectedIds.filter((id) => id !== characterId)
      : [...selectedIds, characterId]

    onChange(newSelected)
  }

  // Get selected characters and build combined description
  const selectedCharacters = characters.filter((c) => selectedIds.includes(c.id))
  const combinedDescription = selectedCharacters
    .filter((c) => c.description)
    .map((c) => `${c.name}: ${c.description}`)
    .join('\n\n')

  const handleCopyDescriptions = async () => {
    if (!combinedDescription) return

    try {
      await navigator.clipboard.writeText(combinedDescription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Loading state
  if (charactersLoading) {
    return (
      <div className={className}>
        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
          Characters
        </label>
        <div className="bg-slate-800 rounded-lg p-3 text-center text-sm text-slate-500">
          Loading characters...
        </div>
      </div>
    )
  }

  // No characters state
  if (characters.length === 0) {
    return (
      <div className={className}>
        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
          Characters
        </label>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <FiUsers className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-2">No characters yet</p>
          <Link
            to="/characters"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            Create characters
            <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
        Characters {selectedIds.length > 0 && `(${selectedIds.length} selected)`}
      </label>

      {/* Character List */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
        <div className="p-1 space-y-0.5">
          {characters.map((character) => (
            <CharacterPickerItem
              key={character.id}
              character={character}
              selected={selectedIds.includes(character.id)}
              onToggle={handleToggle}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Selected Characters Preview */}
      {selectedCharacters.length > 0 && combinedDescription && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">
              Descriptions Preview
            </span>
            <button
              onClick={handleCopyDescriptions}
              disabled={disabled}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
            >
              <FiCopy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 max-h-24 overflow-y-auto">
            <p className="text-xs text-slate-400 whitespace-pre-wrap line-clamp-4">
              {combinedDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
