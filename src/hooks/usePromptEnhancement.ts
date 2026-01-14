import { useState, useCallback } from 'react'
import { enhancePromptViaEdge } from '../lib/ai/edgeFunctions'
import useCharactersStore from '../stores/useCharactersStore'

interface UsePromptEnhancementOptions {
  prompt: string
  setPrompt: (prompt: string) => void
  selectedCharacterIds: number[]
  setError: (error: string | null) => void
}

/**
 * Hook to manage AI prompt enhancement
 */
export function usePromptEnhancement({
  prompt,
  setPrompt,
  selectedCharacterIds,
  setError
}: UsePromptEnhancementOptions) {
  const { characters } = useCharactersStore()

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [wasEnhanced, setWasEnhanced] = useState(false)
  const [originalPrompt, setOriginalPrompt] = useState('')

  /**
   * Enhance the current prompt using AI
   */
  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim() || isEnhancing) return

    setIsEnhancing(true)
    setOriginalPrompt(prompt.trim())
    setError(null)

    try {
      // Get selected character info for context
      const selectedChars = characters
        .filter(c => selectedCharacterIds.includes(c.id))
        .map(c => ({ name: c.name, description: c.description || '' }))

      const result = await enhancePromptViaEdge({
        prompt: prompt.trim(),
        characters: selectedChars
      })

      setPrompt(result.enhancedPrompt)
      setWasEnhanced(true)
    } catch (err) {
      setError(`Enhancement failed: ${(err as Error).message}`)
    } finally {
      setIsEnhancing(false)
    }
  }, [prompt, isEnhancing, characters, selectedCharacterIds, setPrompt, setError])

  /**
   * Revert to the original prompt before enhancement
   */
  const handleRevertPrompt = useCallback(() => {
    if (originalPrompt) {
      setPrompt(originalPrompt)
      setWasEnhanced(false)
      setOriginalPrompt('')
    }
  }, [originalPrompt, setPrompt])

  /**
   * Clear the enhancement state (e.g., when prompt is manually edited)
   */
  const clearEnhancementState = useCallback(() => {
    setWasEnhanced(false)
    setOriginalPrompt('')
  }, [])

  return {
    isEnhancing,
    wasEnhanced,
    originalPrompt,
    handleEnhancePrompt,
    handleRevertPrompt,
    clearEnhancementState
  }
}
