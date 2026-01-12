# AI-Assisted Prompt Enhancement and Story Co-Writer

## Goal
Implement two AI features using Fal.ai LLM endpoints:
1. **Prompt Enhancement** - Inline helper to improve image generation prompts
2. **AI Story Co-Writer** - Modal chatbot for dialog, narration, story feedback, and plot suggestions

## Current State Analysis

### Existing AI Infrastructure
- **Fal.ai Integration**: `src/lib/falai.js` handles image generation
- **AIImageModal**: Tab-based modal with prompt input, character selection, history
- **Character System**: Profiles with descriptions in `useCharactersStore`
- **Environment**: `VITE_FAL_AI_KEY` already configured
- **Modal Patterns**: Established pattern with backdrop, tabs, history localStorage

### Text/Dialog Systems
- **Speech Bubbles**: ContentEditable inline editing + properties panel textarea
- **Text Elements**: Double-click to edit with auto-resize
- **TextSection Component**: Simple textarea in properties panel
- **No AI helpers currently**: All text input is manual

## Implementation Plan

---

## Phase 1: Prompt Enhancement (Priority 1)

### 1.1 Extend Fal.ai Library with LLM Support

**File:** `src/lib/falai.js`

Add LLM text generation function:

```javascript
/**
 * Enhance an image prompt using Fal.ai LLM
 * @param {string} userPrompt - Basic prompt from user
 * @param {Object} options - Enhancement options
 * @returns {Promise<string>} - Enhanced prompt
 */
export async function enhanceImagePrompt(userPrompt, options = {}) {
  const {
    style = 'comic',
    characterDescriptions = [],
    currentPromptContext = ''
  } = options

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  // System prompt focused on comic book image generation
  const systemPrompt = `You are an expert at writing detailed image generation prompts for AI models like FLUX.
Your goal is to take a basic user prompt and expand it into a detailed, descriptive prompt that will produce high-quality comic book artwork.

Focus on:
- Visual details (poses, expressions, clothing, lighting)
- Composition and framing (camera angle, perspective)
- Artistic style elements (line work, colors, shading)
- Maintaining the user's original intent
- Keep it under 150 words

Style context: ${style}
${characterDescriptions.length > 0 ? `\nCharacters involved: ${characterDescriptions.join(', ')}` : ''}`

  const result = await fal.subscribe('fal-ai/meta-llama/llama-3.1-70b-instruct', {
    input: {
      prompt: `User's basic prompt: "${userPrompt}"\n\nExpand this into a detailed image generation prompt:`,
      system_prompt: systemPrompt,
      max_tokens: 300
    }
  })

  return result.output.trim()
}
```

**Testing considerations:**
- Check if `fal-ai/meta-llama/llama-3.1-70b-instruct` is the correct endpoint
- May need to use different Fal.ai LLM model (check Fal.ai docs)
- Error handling for API failures

---

### 1.2 Add Prompt Enhancement UI to AIImageModal

**File:** `src/components/editor/AIImageModal.jsx`

**Changes needed:**

1. **Add state for enhancement:**
```javascript
const [isEnhancing, setIsEnhancing] = useState(false)
const [showEnhancedDiff, setShowEnhancedDiff] = useState(false)
const [originalPrompt, setOriginalPrompt] = useState('')
```

2. **Add enhance handler:**
```javascript
const handleEnhancePrompt = async () => {
  if (!prompt.trim()) return

  setIsEnhancing(true)
  setOriginalPrompt(prompt)

  try {
    const characterDescs = selectedCharacters.map(c => c.description)
    const enhanced = await enhanceImagePrompt(prompt, {
      style: selectedStyle,
      characterDescriptions: characterDescs
    })

    setPrompt(enhanced)
    setShowEnhancedDiff(true)
  } catch (error) {
    console.error('Prompt enhancement failed:', error)
    // Show error alert
  } finally {
    setIsEnhancing(false)
  }
}
```

3. **Add UI elements in Generate tab:**

Add sparkles icon button next to prompt textarea:

```jsx
<div className="relative">
  <textarea
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    placeholder="Describe the image you want to generate..."
    className="w-full bg-slate-900 border border-slate-700..."
    rows={4}
  />

  {/* Enhancement button */}
  <button
    onClick={handleEnhancePrompt}
    disabled={!prompt.trim() || isEnhancing}
    className="absolute top-2 right-2 p-2 bg-indigo-500 hover:bg-indigo-600..."
    title="Enhance prompt with AI"
  >
    {isEnhancing ? (
      <FiLoader className="animate-spin" />
    ) : (
      <FiZap />
    )}
  </button>

  {/* Show revert option if enhanced */}
  {showEnhancedDiff && (
    <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
      <FiCheck className="text-green-500" />
      <span>Prompt enhanced!</span>
      <button
        onClick={() => {
          setPrompt(originalPrompt)
          setShowEnhancedDiff(false)
        }}
        className="text-indigo-400 hover:text-indigo-300"
      >
        Revert
      </button>
    </div>
  )}
</div>
```

**Icons needed:**
- Import `FiZap` (sparkles/lightning) for enhance button
- Import `FiLoader` for loading state
- Import `FiCheck` for success indicator

---

## Phase 2: AI Story Co-Writer Modal (Priority 2)

### 2.1 Create AIWriterModal Component

**File:** `src/components/editor/AIWriterModal.tsx` (NEW - TypeScript)

**Component structure:**

```tsx
import { useState, useEffect, useRef } from 'react'
import { FiX, FiSend, FiUser, FiCpu, FiRefreshCw } from 'react-icons/fi'
import useProjectStore from '../../stores/useProjectStore'
import useCharactersStore from '../../stores/useCharactersStore'
import { chatWithAIWriter } from '../../lib/falai'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AIWriterModal({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentProject = useProjectStore(state => state.currentProject)
  const characters = useCharactersStore(state =>
    state.characters.filter(c => c.seriesId === currentProject?.seriesId)
  )

  // Load chat history from localStorage
  useEffect(() => {
    if (isOpen && currentProject) {
      const saved = localStorage.getItem(`ai-writer-chat-${currentProject.id}`)
      if (saved) {
        setMessages(JSON.parse(saved))
      }
    }
  }, [isOpen, currentProject])

  // Save chat history
  useEffect(() => {
    if (currentProject && messages.length > 0) {
      localStorage.setItem(
        `ai-writer-chat-${currentProject.id}`,
        JSON.stringify(messages)
      )
    }
  }, [messages, currentProject])

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      const response = await chatWithAIWriter(input, {
        chatHistory: messages,
        projectContext: {
          title: currentProject?.title || '',
          pages: currentProject?.pages?.length || 0,
          characters: characters.map(c => ({
            name: c.name,
            description: c.description
          }))
        }
      })

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI Writer error:', error)
      // Show error message in chat
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearChat = () => {
    if (confirm('Clear entire chat history?')) {
      setMessages([])
      if (currentProject) {
        localStorage.removeItem(`ai-writer-chat-${currentProject.id}`)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FiCpu className="text-indigo-400" size={24} />
            <div>
              <h2 className="text-lg font-bold text-white">AI Story Co-Writer</h2>
              <p className="text-xs text-slate-400">Comic book writing assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Clear chat"
            >
              <FiRefreshCw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <FiCpu size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Ask for dialog suggestions, story feedback, or plot ideas!</p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <FiCpu size={16} className="text-white" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <FiUser size={16} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <FiCpu size={16} className="text-white animate-pulse" />
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask for dialog, story ideas, or feedback..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="shrink-0 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FiSend size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### 2.2 Extend Fal.ai Library with Chat Function

**File:** `src/lib/falai.js`

Add AI writer chat function:

```javascript
/**
 * Chat with AI Story Co-Writer
 * @param {string} userMessage - User's message
 * @param {Object} options - Context and history
 * @returns {Promise<string>} - AI response
 */
export async function chatWithAIWriter(userMessage, options = {}) {
  const {
    chatHistory = [],
    projectContext = {}
  } = options

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  // Build system prompt focused on comic book writing
  const systemPrompt = `You are an expert comic book writer and story consultant. Your role is to help writers create compelling comic book stories, dialog, and narratives.

Current Project Context:
- Title: ${projectContext.title || 'Untitled'}
- Pages: ${projectContext.pages || 0}
- Characters: ${projectContext.characters?.map(c => `${c.name} (${c.description})`).join(', ') || 'None defined'}

Your capabilities:
- Generate character dialog that fits their personality
- Suggest plot developments and story arcs
- Provide feedback on pacing and structure
- Help with narration and caption text
- Brainstorm scene ideas and visual descriptions
- Offer comic book-specific writing advice (show don't tell, visual storytelling, etc.)

Always:
- Keep responses focused on comic book storytelling
- Respect the established characters and their voices
- Provide specific, actionable suggestions
- Be encouraging and constructive
- Format dialog with proper comic script conventions when relevant`

  // Convert chat history to Fal.ai format
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  const result = await fal.subscribe('fal-ai/meta-llama/llama-3.1-70b-instruct', {
    input: {
      prompt: userMessage,
      system_prompt: systemPrompt,
      chat_history: formattedHistory,
      max_tokens: 800,
      temperature: 0.7 // Slightly creative
    }
  })

  return result.output.trim()
}
```

---

### 2.3 Integrate AI Writer into UI

**File:** `src/components/editor/FloatingToolbar.jsx`

Add new toolbar button:

```jsx
<ToolButton
  icon={FiEdit3}  // Or FiFeather for writing
  label="AI Writer"
  shortcut="W"
  onClick={onOpenAIWriter}
  active={false}
/>
```

**File:** `src/pages/ProjectPage.jsx`

Add modal state and integration:

```javascript
const [showAIWriterModal, setShowAIWriterModal] = useState(false)

// In return JSX:
<AIWriterModal
  isOpen={showAIWriterModal}
  onClose={() => setShowAIWriterModal(false)}
/>
```

Pass handler to FloatingToolbar:
```jsx
<FloatingToolbar
  // ... existing props
  onOpenAIWriter={() => setShowAIWriterModal(true)}
/>
```

---

## Phase 3: Character Integration Enhancements (Optional)

### 3.1 Add AI-Specific Character Fields

**File:** `src/stores/useCharactersStore.js`

Extend character schema:

```javascript
{
  // Existing fields
  name: string,
  description: string,
  profileImage: { blob, preview },
  loraUrl: string,
  loraTriggerWord: string,
  loraScale: number,

  // NEW: AI Writing fields
  voiceTone: string,           // e.g., "sarcastic", "serious", "cheerful"
  speechPatterns: string[],    // e.g., ["uses lots of technical jargon"]
  catchphrases: string[],      // e.g., ["With great power..."]
  personality: string          // More detailed than description
}
```

### 3.2 Update Character Modal

**File:** `src/components/editor/CharacterModal.jsx`

Add optional AI voice fields in a collapsible section:

```jsx
<CollapsibleSection title="AI Writing Assistant" defaultOpen={false}>
  <label className="text-xs text-slate-500">Voice Tone</label>
  <input
    value={voiceTone}
    onChange={(e) => setVoiceTone(e.target.value)}
    placeholder="e.g., sarcastic, serious, cheerful"
    className="..."
  />

  <label className="text-xs text-slate-500">Speech Patterns</label>
  <textarea
    value={speechPatterns.join('\n')}
    onChange={(e) => setSpeechPatterns(e.target.value.split('\n'))}
    placeholder="One pattern per line"
    className="..."
    rows={3}
  />
</CollapsibleSection>
```

---

## Environment Configuration

**File:** `.env.example`

Document Fal.ai LLM usage (no new env vars needed):

```bash
# Fal.ai API Key (used for both image generation and LLM features)
VITE_FAL_AI_KEY=your-fal-ai-key-here  # Get from https://fal.ai/dashboard/keys
```

---

## Testing & Validation

### Prompt Enhancement Testing
1. Open AI Image modal
2. Enter basic prompt: "hero flying"
3. Click sparkle/enhance button
4. Verify enhanced prompt is descriptive and detailed
5. Test revert functionality
6. Test with character selections

### AI Writer Testing
1. Open AI Writer modal from toolbar (W key)
2. Ask: "Write dialog for a fight scene between [Character A] and [Character B]"
3. Verify response uses character context
4. Test chat history persistence (close/reopen modal)
5. Test clear chat functionality
6. Test Enter to send, Shift+Enter for new line

### Edge Cases
- No Fal.ai API key configured → Show helpful error
- Empty prompt enhancement → Button disabled
- Network timeout → Error handling
- Very long chat history → Performance check

---

## Files to Create/Modify

### TypeScript Convention
**IMPORTANT:** All new files should be created in TypeScript (`.ts`/`.tsx`). Existing `.js`/`.jsx` files can remain as-is per the incremental adoption strategy.

### New Files
- `src/components/editor/AIWriterModal.tsx` - Chat interface for story co-writer (TypeScript)

### Modified Files
- `src/lib/falai.js` - Add `enhanceImagePrompt()` and `chatWithAIWriter()` (keep as .js, or convert to .ts)
- `src/components/editor/AIImageModal.jsx` - Add prompt enhancement UI (existing .jsx)
- `src/components/editor/FloatingToolbar.jsx` - Add AI Writer button (existing .jsx)
- `src/pages/ProjectPage.jsx` - Integrate AIWriterModal (existing .jsx)
- `src/stores/useCharactersStore.js` - (Optional) Add AI voice fields (existing .js)
- `src/components/editor/CharacterModal.jsx` - (Optional) AI voice UI (existing .jsx)

---

## Success Criteria

### Phase 1 Complete When:
- ✓ Sparkle icon appears next to prompt in AIImageModal
- ✓ Clicking icon enhances prompt with detailed description
- ✓ Revert button works to restore original
- ✓ Enhanced prompts produce better quality images

### Phase 2 Complete When:
- ✓ AI Writer modal opens from toolbar (W key)
- ✓ Chat interface displays messages correctly
- ✓ AI responds with comic-focused suggestions
- ✓ Chat history persists per-project in localStorage
- ✓ Character context influences AI responses
- ✓ Clear chat functionality works

---

## Future Enhancements (Post-MVP)

1. **Copy to Element**: Button in AI Writer to copy generated dialog directly to selected speech bubble
2. **Multi-turn Dialog**: Generate back-and-forth dialog for multiple characters
3. **Script Export**: Export chat conversation as comic script format
4. **Voice Cloning**: Integrate Fal.ai TTS for character voice samples
5. **Panel Suggestions**: AI suggests panel layouts based on story beats
6. **Translation**: Use LLM to translate dialog to other languages
7. **Style Templates**: Pre-built prompt templates for different comic genres

---

## Architecture Notes

### Why Fal.ai LLM?
- Single API key for all AI features
- Consistent billing and usage tracking
- Already integrated and trusted
- Llama 3.1 70B is excellent for creative writing

### LocalStorage Strategy
- `ai-image-history-{projectId}` - Image generation history (existing)
- `ai-writer-chat-{projectId}` - Chat history (new)
- Max 20 entries for image history, unlimited for chat (consider adding limit)

### Modal Pattern Consistency
Both modals follow same structure:
1. Backdrop with blur
2. Header with icon + title + close button
3. Main content area (tabs or chat)
4. Footer/input area
5. Same color scheme (slate-900 bg, indigo accents)

---

## Implementation Priority

**Sprint 1 (Week 1):**
1. Add `enhanceImagePrompt()` to falai.js
2. Integrate enhancement UI into AIImageModal
3. Test and refine prompt enhancement

**Sprint 2 (Week 2):**
1. Create AIWriterModal component
2. Add `chatWithAIWriter()` to falai.js
3. Integrate into FloatingToolbar + ProjectPage
4. Test chat functionality

**Sprint 3 (Optional):**
1. Add AI voice fields to characters
2. Enhance AI writer with character voice modeling
3. Polish and user testing
