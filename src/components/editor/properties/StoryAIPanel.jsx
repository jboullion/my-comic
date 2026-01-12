import { useState, useRef, useEffect } from 'react'
import { FiSend, FiTrash2, FiCpu, FiAlertCircle, FiImage, FiChevronDown } from 'react-icons/fi'
import { chatWithStoryAI, isFalConfigured, uploadImageToFal, STORY_AI_MODELS } from '../../../lib/falai'
import { useProjectStore } from '../../../stores/useProjectStore'
import { useCharactersStore } from '../../../stores/useCharactersStore'

/**
 * Get localStorage key for chat history
 */
const getHistoryKey = (projectId) => `storyai-history:${projectId}`

/**
 * Load chat history from localStorage
 */
function loadChatHistory(projectId) {
  if (!projectId) return []
  try {
    const stored = localStorage.getItem(getHistoryKey(projectId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save chat history to localStorage (max 50 messages)
 */
function saveChatHistory(projectId, messages) {
  if (!projectId) return
  try {
    const trimmed = messages.slice(-50)
    localStorage.setItem(getHistoryKey(projectId), JSON.stringify(trimmed))
  } catch (error) {
    console.warn('Failed to save chat history:', error)
  }
}

/**
 * StoryAIPanel Component
 * Chat interface for AI story assistance with vision support
 */
export default function StoryAIPanel({ onCaptureCanvas }) {
  const currentProject = useProjectStore(state => state.currentProject)
  const activePageIndex = useProjectStore(state => state.activePageIndex)
  const { characters } = useCharactersStore()
  
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const projectId = currentProject?.id
  
  // Get current model config
  const modelConfig = STORY_AI_MODELS[selectedModel]
  
  // Load chat history on mount/project change
  useEffect(() => {
    if (projectId) {
      const history = loadChatHistory(projectId)
      setMessages(history)
    }
  }, [projectId])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Build project context for AI
  const buildContext = () => {
    const seriesCharacters = characters.filter(c => c.seriesId === currentProject?.seriesId)
    
    return {
      title: currentProject?.title || 'Untitled Project',
      pageNumber: (activePageIndex || 0) + 1,
      totalPages: currentProject?.pages?.length || 1,
      characters: seriesCharacters.map(c => ({
        name: c.name,
        description: c.description || ''
      }))
    }
  }
  
  const handleSend = async () => {
    const trimmedInput = inputValue.trim()
    if (!trimmedInput || isLoading) return
    
    setError(null)
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    }
    
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    
    try {
      const context = buildContext()
      
      // Build chat history for API (last 10 messages for context window)
      const chatHistory = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))
      
      // Capture canvas and upload for vision models
      let imageUrl = null
      if (modelConfig?.vision && onCaptureCanvas) {
        try {
          const dataUrl = await onCaptureCanvas()
          if (dataUrl) {
            // Convert data URL to blob
            const response = await fetch(dataUrl)
            const blob = await response.blob()
            // Upload to Fal storage
            imageUrl = await uploadImageToFal(blob, 'canvas-screenshot.jpg')
          }
        } catch (captureError) {
          console.warn('Failed to capture canvas for AI:', captureError)
          // Continue without image
        }
      }
      
      const response = await chatWithStoryAI(trimmedInput, {
        model: selectedModel,
        imageUrl,
        chatHistory: chatHistory.slice(0, -1), // Exclude the current message
        projectContext: context
      })
      
      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      saveChatHistory(projectId, updatedMessages)
    } catch (err) {
      console.error('Story AI error:', err)
      setError(err.message || 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleClearHistory = () => {
    setMessages([])
    if (projectId) {
      localStorage.removeItem(getHistoryKey(projectId))
    }
  }
  
  const isConfigured = isFalConfigured()
  
  return (
    <div className="flex flex-col h-full -m-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">Story Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear chat history"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Model Selector */}
      <div className="px-4 py-2 border-b border-slate-800">
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="w-full flex items-center justify-between gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {modelConfig?.vision && <FiImage className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              <span className="truncate">{modelConfig?.name || selectedModel}</span>
            </div>
            <FiChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showModelDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-64 overflow-y-auto">
              {Object.entries(STORY_AI_MODELS).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedModel(key)
                    setShowModelDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors ${
                    key === selectedModel ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {model.vision && <FiImage className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    {!model.vision && <span className="w-3.5 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-white truncate">{model.name}</span>
                        {model.premium && (
                          <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-400 rounded">PRO</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{model.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {modelConfig?.vision && (
          <p className="mt-1.5 text-[10px] text-indigo-400 flex items-center gap-1">
            <FiImage className="w-3 h-3" />
            Vision enabled — AI sees your canvas
          </p>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-200">
                Fal.ai API key not configured. Add VITE_FAL_AI_KEY to your .env.local file.
              </p>
            </div>
          </div>
        )}
        
        {messages.length === 0 && isConfigured && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p className="mb-2">👋 Hi! I'm your story assistant.</p>
            <p className="text-xs text-slate-600">
              {modelConfig?.vision 
                ? "I can see your canvas! Ask me about what's on the page, dialogue ideas, or image prompts."
                : "Ask me to help with dialogue, plot ideas, character development, or image prompts."
              }
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Thinking...</span>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about story, dialogue, or prompts..."
            disabled={!isConfigured || isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConfigured || isLoading}
            className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors self-end"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-600">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

/**
 * MessageBubble Component
 */
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
          isUser
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-800 text-slate-200 border border-slate-700'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  )
}
