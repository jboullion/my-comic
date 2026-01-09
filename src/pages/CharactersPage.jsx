import { useEffect } from 'react'
import { FiPlus, FiUsers } from 'react-icons/fi'
import AppSidebarLayout from '../layouts/AppSidebarLayout'
import useCharactersStore from '../stores/useCharactersStore'
import CharacterCard from '../components/characters/CharacterCard'
import CharacterModal from '../components/characters/CharacterModal'
import EmptyCharactersState from '../components/characters/EmptyCharactersState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

export default function CharactersPage() {
  const {
    characters,
    charactersLoading,
    charactersError,
    loadCharacters,
    openCharacterModal,
    deleteCharacter
  } = useCharactersStore()

  // Load characters on mount
  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  return (
    <AppSidebarLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FiUsers className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Characters</h1>
              <p className="text-slate-400 text-sm">
                Your reusable character library for AI image generation
              </p>
            </div>
          </div>

          <button
            onClick={() => openCharacterModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Character
          </button>
        </div>

        {/* Loading State */}
        {charactersLoading && <LoadingSpinner />}

        {/* Error State */}
        {charactersError && (
          <ErrorMessage
            title="Failed to load characters"
            message={charactersError}
            onRetry={loadCharacters}
          />
        )}

        {/* Characters Grid */}
        {!charactersLoading && !charactersError && characters.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={(char) => openCharacterModal(char)}
                onDelete={(id) => deleteCharacter(id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!charactersLoading && !charactersError && characters.length === 0 && (
          <EmptyCharactersState onCreateNew={() => openCharacterModal()} />
        )}
      </div>

      {/* Character Modal */}
      <CharacterModal />
    </AppSidebarLayout>
  )
}
