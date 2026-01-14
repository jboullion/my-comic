import { useCallback } from 'react'
import useCharactersStore from '../stores/useCharactersStore'

export interface CharacterLoRA {
  url: string
  triggerWord: string
  scale: number
  characterName: string
}

/**
 * Hook to get LoRA configuration from selected characters
 */
export function useCharacterLoRA(selectedCharacterIds: number[]) {
  const { characters } = useCharactersStore()

  /**
   * Get LoRA from first selected character that has one configured
   */
  const getCharacterLora = useCallback((): CharacterLoRA | null => {
    if (selectedCharacterIds.length === 0) return null

    // Find first selected character with a LoRA configured
    for (const id of selectedCharacterIds) {
      const char = characters.find(c => c.id === id)
      if (char?.loraUrl) {
        return {
          url: char.loraUrl,
          triggerWord: char.loraTriggerWord || '',
          scale: char.loraScale ?? 0.8,
          characterName: char.name
        }
      }
    }
    return null
  }, [selectedCharacterIds, characters])

  return { getCharacterLora, characters }
}
