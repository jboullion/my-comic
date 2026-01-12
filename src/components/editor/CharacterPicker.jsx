import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiCopy, FiUser, FiUsers, FiExternalLink } from 'react-icons/fi'
import useCharactersStore from '../../stores/useCharactersStore'
import useProjectStore from '../../stores/useProjectStore'
import { useCharacterImageFromBlob } from '../../hooks/useCharacterImage'

/**
 * CharacterPickerItem Component
 * Individual character radio item with thumbnail
 */
function CharacterPickerItem({ character, selected, onSelect, disabled }) {
  const profileImageUrl = useCharacterImageFromBlob(character.profileImage?.blob)

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(character.id)}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left
        ${selected ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-slate-700/50 border border-transparent'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Thumbnail */}
      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
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

      {/* Selection indicator - radio circle */}
      <div
        className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
          ${selected ? 'border-indigo-500' : 'border-slate-600'}
        `}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
        )}
      </div>
    </button>
  )
}

/**
 * CharacterPicker Component
 * Single-select character picker for AI image generation
 * Filters characters by current project's series
 */
export default function CharacterPicker({
  selectedIds = [],
  onChange,
  disabled = false,
  className = '',
  showDescription = true
}) {
  const { characters, charactersLoading, loadCharacters } = useCharactersStore()
  const { currentProject } = useProjectStore()
  const [copied, setCopied] = useState(false)

  // Get current project's seriesId
  const seriesId = currentProject?.seriesId

  // Load characters on mount if not already loaded
  useEffect(() => {
    // Load characters if we don't have any and aren't currently loading
    if (characters.length === 0 && !charactersLoading) {
      loadCharacters()
    }
  }, [characters.length, charactersLoading, loadCharacters])

  // Filter characters by series
  const seriesCharacters = useMemo(() => {
    if (!seriesId) return characters
    return characters.filter(c => c.seriesId === seriesId)
  }, [characters, seriesId])

  // Single-select: clicking selects, clicking again deselects
  const handleSelect = (characterId) => {
    if (disabled) return

    // If already selected, deselect (empty array)
    // Otherwise, select only this character
    const newSelected = selectedIds.includes(characterId) ? [] : [characterId]
    onChange(newSelected)
  }

  // Get selected characters and build combined description
  const selectedCharacters = seriesCharacters.filter((c) => selectedIds.includes(c.id))
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

  // No characters in series state
  if (seriesCharacters.length === 0) {
    return (
      <div className={className}>
        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
          Characters
        </label>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <FiUsers className="w-6 h-6 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-2">
            {seriesId ? 'No characters in this series' : 'No characters yet'}
          </p>
          <Link
            to={seriesId ? `/app/series/${seriesId}` : '/app/characters'}
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            {seriesId ? 'Add characters to series' : 'Create characters'}
            <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
        Character {selectedIds.length > 0 && '(1 selected)'}
      </label>

      {/* Character List */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
        <div className="p-1 space-y-0.5">
          {seriesCharacters.map((character) => (
            <CharacterPickerItem
              key={character.id}
              character={character}
              selected={selectedIds.includes(character.id)}
              onSelect={handleSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Selected Character Preview */}
      {showDescription && selectedCharacters.length > 0 && combinedDescription && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">
              Description Preview
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
