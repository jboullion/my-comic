import { useState, useRef, useEffect } from 'react'
import { FiSend, FiTrash2, FiCpu, FiAlertCircle, FiImage, FiChevronDown, FiCamera, FiUpload, FiX, FiEdit3 } from 'react-icons/fi'
import { chatWithStoryAI, isOpenRouterConfigured, STORY_AI_MODELS } from '../../../lib/ai/openrouter'
import { uploadImageToFal } from '../../../lib/ai/falai'
import { useProjectStore } from '../../../stores/useProjectStore'
import { useCharactersStore } from '../../../stores/useCharactersStore'
import useSeriesStore from '../../../stores/useSeriesStore'

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
  const { openStoryPromptModal, getSeriesStoryPrompt, getSeriesById } = useSeriesStore()

  const seriesId = currentProject?.seriesId
  const customPrompt = seriesId ? getSeriesStoryPrompt(seriesId) : null
  
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState('google')
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [attachedImage, setAttachedImage] = useState(null) // { type: 'page'|'upload', dataUrl: string, name: string }
  const [isDragOver, setIsDragOver] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const projectId = currentProject?.id
  
  // Get current model config
  const modelConfig = STORY_AI_MODELS[selectedProvider]?.[selectedModel]
  
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
      })),
      customStoryPrompt: customPrompt  // Add custom prompt from series
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
      attachedImage: attachedImage,
      timestamp: Date.now()
    }
    
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setAttachedImage(null)
    setIsLoading(true)
    
    try {
      const context = buildContext()
      
      // Build chat history for API (last 10 messages for context window)
      const chatHistory = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const modelConfig = STORY_AI_MODELS[selectedProvider]?.[selectedModel]
      
      // Use attached image if available, otherwise auto-capture if vision is enabled
      let imageUrl = null
      if (attachedImage) {
        // Upload attached image to Fal storage
        console.log('[Story AI] Using manually attached image')
        try {
          const blob = await fetch(attachedImage.dataUrl).then(r => r.blob())
          imageUrl = await uploadImageToFal(blob, attachedImage.name)
          console.log('[Story AI] Attached image uploaded:', imageUrl)
        } catch (uploadError) {
          console.warn('[Story AI] Failed to upload attached image:', uploadError)
        }
      } else if (modelConfig?.vision && onCaptureCanvas) {
        // Auto-capture canvas (legacy behavior)
        try {
          console.log('[Story AI] Capturing canvas...')
          const dataUrl = await onCaptureCanvas()
          if (dataUrl) {
            console.log('[Story AI] Canvas captured, size:', dataUrl.length, 'bytes')
            // Convert data URL to blob
            const response = await fetch(dataUrl)
            const blob = await response.blob()
            console.log('[Story AI] Uploading image to Fal storage...')
            // Upload to Fal storage
            imageUrl = await uploadImageToFal(blob, 'canvas-screenshot.jpg')
            console.log('[Story AI] Image uploaded:', imageUrl)
          } else {
            console.warn('[Story AI] Canvas capture returned null')
          }
        } catch (captureError) {
          console.warn('[Story AI] Failed to capture canvas for AI:', captureError)
          // Continue without image
        }
      } else {
        if (!modelConfig?.vision) {
          console.log('[Story AI] Model does not support vision')
        }
        if (!onCaptureCanvas) {
          console.log('[Story AI] No onCaptureCanvas callback provided')
        }
      }
      
      const response = await chatWithStoryAI(trimmedInput, {
        provider: selectedProvider,
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

  const handleEditPrompt = () => {
    if (!seriesId) {
      setError('Cannot edit prompt: project is not assigned to a series')
      return
    }
    const series = getSeriesById(seriesId)
    if (series) {
      openStoryPromptModal(series)
    }
  }

  const handleAttachPage = async () => {
    if (!onCaptureCanvas) return
    try {
      const dataUrl = await onCaptureCanvas()
      if (dataUrl) {
        setAttachedImage({
          type: 'page',
          dataUrl,
          name: `page-${(activePageIndex || 0) + 1}.jpg`
        })
      }
    } catch (error) {
      console.error('Failed to capture page:', error)
    }
  }
  
  const handleRemoveAttachment = () => {
    setAttachedImage(null)
  }
  
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setAttachedImage({
          type: 'upload',
          dataUrl: evt.target.result,
          name: file.name
        })
      }
    }
    reader.readAsDataURL(file)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!modelConfig?.vision) return
    setIsDragOver(true)
  }
  
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!modelConfig?.vision) return
    setIsDragOver(true)
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if leaving the drop zone entirely
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragOver(false)
  }
  
  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (!modelConfig?.vision) return
    
    // Check for page thumbnail from PagesSidebar
    const pageData = e.dataTransfer.getData('text/plain')
    if (pageData?.startsWith('page:')) {
      const pageIndex = parseInt(pageData.split(':')[1])
      const dataUrl = e.dataTransfer.getData('image/dataurl')
      if (dataUrl) {
        setAttachedImage({
          type: 'page',
          dataUrl,
          name: `page-${pageIndex + 1}.jpg`
        })
        return
      }
    }
    
    // Check for external file drop
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))
    
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAttachedImage({
            type: 'upload',
            dataUrl: evt.target.result,
            name: imageFile.name
          })
        }
      }
      reader.readAsDataURL(imageFile)
    }
  }
  
  const isConfigured = isOpenRouterConfigured()
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FiCpu className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">Story Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditPrompt}
            disabled={!seriesId}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={seriesId ? "Edit Story AI prompt" : "Assign project to a series to edit prompt"}
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
              {Object.entries(STORY_AI_MODELS).map(([providerKey, models]) => (
                <div key={providerKey}>
                  {/* Provider header */}
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wide border-t border-slate-700 first:border-t-0">
                    {providerKey === 'google' ? 'Google' :
                     providerKey === 'anthropic' ? 'Anthropic' :
                     providerKey === 'openai' ? 'OpenAI' :
                     providerKey === 'meta' ? 'Meta' :
                     providerKey === 'bytedance' ? 'ByteDance' :
                     'Other'}
                  </div>
                  {/* Models in this provider */}
                  {Object.entries(models).map(([modelKey, model]) => (
                    <button
                      key={modelKey}
                      onClick={() => {
                        setSelectedProvider(providerKey)
                        setSelectedModel(modelKey)
                        setShowModelDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors ${
                        providerKey === selectedProvider && modelKey === selectedModel ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-white truncate">{model.name}</span>
                            {model.inputPrice === 0 && model.outputPrice === 0 ? (
                              <span className="text-[9px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">FREE</span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded">
                                ${model.inputPrice}/{model.outputPrice === model.inputPrice ? model.outputPrice : model.outputPrice}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{model.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-200">
                OpenRouter API key not configured. Add VITE_OPENROUTER_KEY to your .env.local file.
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
      <div 
        className={`relative p-4 border-t border-slate-800 transition-colors ${
          isDragOver ? 'bg-indigo-500/10 border-indigo-500' : ''
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-lg pointer-events-none z-10">
            <div className="text-center">
              <FiImage className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm text-indigo-300 font-medium">Drop image to attach</p>
            </div>
          </div>
        )}
        
        {/* Attachment Preview */}
        {attachedImage && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-slate-800 border border-indigo-500/50 rounded-lg">
            <img
              src={attachedImage.dataUrl}
              alt="Attached"
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{attachedImage.name}</p>
              <p className="text-[10px] text-slate-500">
                {attachedImage.type === 'page' ? '📄 Current page' : '📁 Uploaded file'}
              </p>
            </div>
            <button
              onClick={handleRemoveAttachment}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Remove attachment"
            >
              <FiX className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={modelConfig?.vision ? "Ask about the image, story, dialogue..." : "Ask about story, dialogue, or prompts..."}
            disabled={!isConfigured || isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            rows={2}
          />
          <div className="flex flex-col gap-1.5">
            {/* Vision model controls */}
            {modelConfig?.vision && (
              <div className="flex gap-1">
                {onCaptureCanvas && (
                  <button
                    onClick={handleAttachPage}
                    disabled={!isConfigured || isLoading}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors text-xs"
                    title="Attach current page"
                  >
                    <FiCamera className="w-3.5 h-3.5" />
                  </button>
                )}
                <label className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer text-xs">
                  <FiUpload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={!isConfigured || isLoading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !isConfigured || isLoading}
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
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
        className={`max-w-[95%] rounded-lg text-sm ${
          isUser
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-800 text-slate-200 border border-slate-700'
        }`}
      >
        {/* Show attached image if present */}
        {message.attachedImage && (
          <div className="p-2 border-b border-white/10">
            <img
              src={message.attachedImage.dataUrl}
              alt="Attached"
              className="max-w-full h-auto rounded"
            />
            <p className="text-[10px] opacity-70 mt-1 truncate">{message.attachedImage.name}</p>
          </div>
        )}
        <p className={`whitespace-pre-wrap break-words ${message.attachedImage ? 'p-3' : 'px-3 py-2'}`}>
          {message.content}
        </p>
      </div>
    </div>
  )
}
