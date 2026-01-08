import { useState, useEffect } from 'react'
import { FiX, FiLoader, FiInfo } from 'react-icons/fi'
import useCharactersStore from '../../stores/useCharactersStore'
import CharacterImageUpload from './CharacterImageUpload'

/**
 * CharacterModal Component
 * Modal for creating and editing characters
 */
export default function CharacterModal() {
  const {
    isCharacterModalOpen,
    editingCharacter,
    closeCharacterModal,
    createCharacter,
    updateCharacter,
    addCharacterImage
  } = useCharactersStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [profileImage, setProfileImage] = useState(null) // { file, url } for new, { blob, url } for existing
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!editingCharacter

  // Reset form when modal opens/closes or editing character changes
  useEffect(() => {
    if (isCharacterModalOpen) {
      if (editingCharacter) {
        setName(editingCharacter.name || '')
        setDescription(editingCharacter.description || '')
        // Set existing profile image if available
        if (editingCharacter.profileImage) {
          setProfileImage({
            blob: editingCharacter.profileImage.blob,
            url: URL.createObjectURL(editingCharacter.profileImage.blob),
            existing: true,
            id: editingCharacter.profileImage.id
          })
        } else {
          setProfileImage(null)
        }
      } else {
        setName('')
        setDescription('')
        setProfileImage(null)
      }
      setError(null)
    }
  }, [isCharacterModalOpen, editingCharacter])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (profileImage?.url && !profileImage.existing) {
        URL.revokeObjectURL(profileImage.url)
      }
    }
  }, [profileImage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter a character name')
      return
    }

    setIsSaving(true)

    try {
      if (isEditing) {
        // Update existing character
        await updateCharacter(editingCharacter.id, {
          name: name.trim(),
          description: description.trim()
        })

        // If there's a new profile image (has file property), upload it
        if (profileImage?.file) {
          await addCharacterImage(editingCharacter.id, profileImage.file, 'profile')
        }
      } else {
        // Create new character
        const character = await createCharacter(name.trim(), description.trim())

        // Upload profile image if provided
        if (profileImage?.file) {
          await addCharacterImage(character.id, profileImage.file, 'profile')
        }
      }

      // Modal will be closed by the store actions
    } catch (err) {
      console.error('Failed to save character:', err)
      setError(isEditing ? 'Failed to update character' : 'Failed to create character')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      closeCharacterModal()
    }
  }

  const handleProfileImageChange = (image) => {
    // Revoke old URL if it was created by us
    if (profileImage?.url && !profileImage.existing) {
      URL.revokeObjectURL(profileImage.url)
    }
    setProfileImage(image)
  }

  const handleProfileImageRemove = () => {
    if (profileImage?.url && !profileImage.existing) {
      URL.revokeObjectURL(profileImage.url)
    }
    setProfileImage(null)
  }

  if (!isCharacterModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Character' : 'New Character'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {/* Profile Image & Name Row */}
            <div className="flex gap-4">
              {/* Profile Image */}
              <CharacterImageUpload
                label="Profile"
                value={profileImage}
                onChange={handleProfileImageChange}
                onRemove={handleProfileImageRemove}
                size="medium"
              />

              {/* Name */}
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-[10px] text-slate-500 uppercase font-bold mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Character name"
                  disabled={isSaving}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-[10px] text-slate-500 uppercase font-bold mb-2"
              >
                Description (for AI)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe physical features, clothing, personality traits..."
                disabled={isSaving}
                rows={5}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                This description will be used when generating AI images with this character.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                <p>
                  Characters are available across all your projects. Add detailed
                  descriptions to help AI maintain consistent appearances.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Character'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
