# Comic Book Maker - Claude Code Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content.

## Tech Stack

- **React 19** with functional components and hooks
- **TypeScript 5.9** - configured for incremental adoption (new files only)
- **Vite 7** for dev/build (`npm run dev` at http://localhost:5173)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **Zustand** + **Zundo** for state management with undo/redo
- **html-to-image** for canvas capture/export
- **Dexie.js** for IndexedDB storage
- **Google Fonts** for text elements
- **Fal.ai** for AI image generation (FLUX models)
- **OpenRouter** for Story AI chat (vision-capable LLMs)
- **Supabase Edge Functions** for AI credit system and API security

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
```

## Key Architecture

### Canvas System
- `src/components/HtmlCanvas.jsx` - Main canvas with zoom, pan, element rendering
- `src/components/canvas/elements/` - Element type renderers
- `src/hooks/useElementInteraction.js` - Shared drag/resize/rotate logic
- `src/hooks/useMultiElementDrag.js` - Coordinated multi-element dragging
- `src/utils/fontEmbed.js` - Font embedding for capture

### Element Types
1. **Image** - With rotation, opacity, borders, corner shapes
2. **Speech Bubble** - Round/cloud styles, inline text editing
3. **Text** - Captions/titles, ContentEditable, auto-resize, Google Fonts
4. **Text Effect** - SVG-based POW!/BAM! with fill + stroke + outer stroke

### State Management
```javascript
// src/stores/useProjectStore.js
updateElement(elementId, updates)
updateElements(elementIds, updates)  // Batch update multiple elements
addImage(file)
addSpeechBubble(position)
addText(position)
addTextEffect(preset, position)  // 'pow', 'bam', 'boom', 'zap'
deleteSelectedElements()
reorderElements(ids, direction)
nudgeSelectedElements(direction)  // 'left', 'right', 'up', 'down'
```

### Properties Panel
- `src/components/editor/properties/ElementProperties.jsx` - Single element properties
- `src/components/editor/properties/MultiElementProperties.jsx` - Multi-select shared properties
- `src/components/editor/properties/sections/` - Modular sections per element type
- `src/components/editor/ui/` - Reusable controls (NumberInput, FontSelect, etc.)

### AI Image Generation
AI-powered image generation using Fal.ai with FLUX models, routed through Supabase Edge Functions for credit tracking.

**Features:**
- Text-to-image generation with FLUX 2 Pro, FLUX 2 Dev, or Nano Banana
- Simple mode (prompt + style) and Advanced mode (structured prompts)
- AI-powered prompt enhancement via Gemini
- Character-consistent generation via reference images and LoRA models
- Style presets (Comic Book, Manga, Realistic, Retro Vintage)
- Custom base models from CivitAI (FLUX, SDXL, SD 1.5)
- Generation history (last 20 prompts per project)
- Credit-based usage tracking

**Key Files:**
- `src/lib/ai/falai.js` - Fal.ai integration
- `src/lib/ai/edgeFunctions.ts` - Edge function client for credit-tracked API calls
- `src/components/editor/AIImageModal.jsx` - Main UI modal with Generate/Advanced/History tabs
- `src/components/settings/AIModelSettingsTab.jsx` - Custom model configuration
- `src/components/editor/CharacterPicker.jsx` - Character selection UI

**Usage Patterns:**
```javascript
// Generate image via Edge Function (credit-tracked)
import { generateImageViaEdge } from '@/lib/ai/edgeFunctions'

const result = await generateImageViaEdge({
  prompt: "A superhero flying",
  style: 'comic',              // 'comic' | 'manga' | 'realistic' | 'retro' | 'none'
  model: 'flux-2-pro',         // 'flux-2-pro' | 'flux-2' | 'nano-banana' | 'custom'
  imageSize: 'match_page',     // Auto-calculate from page dimensions
  lora: {                      // Optional character LoRA
    url: 'civitai.com/...',
    triggerWord: 'hero1',
    scale: 0.8
  }
})
// Returns: { imageUrl, width, height, seed, fullPrompt, model, credits }
```

**Advanced Mode:**
Structured prompts with separate fields:
- Scene/Setting - Environment description
- Character/Subject - Who/what is in the image
- Lighting/Atmosphere - Mood and lighting
- Composition/Framing - Camera angle and composition
- Style (free text) - Additional style notes

**Character Integration:**
Characters can have AI-specific properties:
- `profileImage.blob` - Reference image for consistency
- `loraUrl` - CivitAI LoRA download URL
- `loraTriggerWord` - Activation word (auto-prepended to prompt)
- `loraScale` - LoRA strength (0-1, default 0.8)

**Series-Level Custom Models:**
Configure in `AIModelSettingsTab`:
```javascript
{
  enabled: true,
  name: "My Custom Style",
  type: 'flux',              // 'flux' | 'sdxl' | 'sd15'
  url: 'https://civitai.com/models/...',
  allowMature: false
}
```

### Story AI Chat
AI-powered story assistant using OpenRouter with vision-capable LLMs, routed through Supabase Edge Functions.

**Features:**
- Vision-capable models (Gemini, Claude, GPT, Llama, ByteDance Seed)
- Page capture for visual context analysis
- Image upload for reference analysis
- Custom story prompts per series
- Chat history (max 50 messages per project)
- Project context awareness (characters, page info)

**Key Files:**
- `src/lib/ai/openrouter.js` - OpenRouter integration
- `src/lib/ai/edgeFunctions.ts` - Edge function client
- `src/components/editor/StoryAIPanel.jsx` - Chat panel UI

**Usage Patterns:**
```javascript
// Chat with Story AI via Edge Function
import { storyChatViaEdge } from '@/lib/ai/edgeFunctions'

const result = await storyChatViaEdge({
  message: "Help me write dialogue for this scene",
  model: 'gemini-2.5-flash',
  imageUrl: dataUrl,           // Optional: page capture or uploaded image
  chatHistory: previousMessages,
  projectContext: {
    title: "My Comic",
    pageNumber: 3,
    totalPages: 10,
    characters: [...]
  }
})
// Returns: { response, model, provider, credits }
```

**Available Models:**
- Google: Gemini 2.5 Flash, Gemini 3 Flash, Gemini 2.5 Pro
- Anthropic: Claude Sonnet 4.5, Claude Haiku 4.5
- OpenAI: GPT-5-mini, GPT-5-nano, GPT-4o
- Meta: Llama 3.2 90B Vision
- ByteDance: Seed 1.6 Flash

## Coding Conventions

### TypeScript
- **New files:** Use `.ts` for modules, `.tsx` for React components
- **Existing files:** Remain as `.js`/`.jsx` - no conversion required
- **Strict mode:** Enabled for all TypeScript files
- **Imports:** Mix JS and TS freely - Vite handles both
- **Type definitions:** Already installed for React, React DOM

Example component:
```typescript
// src/components/NewComponent.tsx
interface Props {
  title: string;
  count: number;
}

export default function NewComponent({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}
```

### Components
- Single component per file, default export
- Functional components with hooks only
- Page components in `src/pages/`
- Shared components in `src/components/`

### Styling (Tailwind v4)
- Dark theme: `bg-slate-900`, `text-white`, `indigo-500` accents
- Labels: `text-[10px] text-slate-500 uppercase font-bold`
- Inputs: `bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm`
- Focus: `focus:outline-none focus:ring-2 focus:ring-indigo-500/50`
- **Avoid** `backdrop-blur` and transparency on backgrounds (GPU artifacts)
- **Avoid** certain Feather icons (e.g., `FiBookOpen`) at larger sizes - can cause diagonal line artifacts. Use simpler icons like `FiLayers` or CSS-based alternatives

### Key Patterns
- Use existing UI components from `src/components/editor/ui/`
- Use `CollapsibleSection` for property panel sections
- Use `useElementInteraction` hook for element interactions
- Use `SelectionHandles` component for resize/rotate handles

## Important Files

| File | Purpose |
|------|---------|
| `src/stores/useProjectStore.js` | All application state |
| `src/components/HtmlCanvas.jsx` | Canvas with capture |
| `src/components/canvas/elements/*.jsx` | Element renderers |
| `src/hooks/useElementInteraction.js` | Drag/resize/rotate |
| `src/hooks/useMultiElementDrag.js` | Multi-element drag coordination |
| `src/utils/fontEmbed.js` | Font embedding for export |
| `src/components/editor/properties/` | Property panels |
| `src/components/settings/` | Settings tabs (Page, Images, Text, Speech Bubbles, Text Effects) |
| `src/pages/ProjectSettingsPage.jsx` | Project defaults configuration |
| `src/lib/ai/falai.js` | Fal.ai integration |
| `src/lib/ai/openrouter.js` | OpenRouter integration for Story AI |
| `src/lib/ai/edgeFunctions.ts` | Edge function client for credit-tracked API calls |
| `src/components/editor/AIImageModal.jsx` | AI image generation UI |
| `src/components/editor/StoryAIPanel.jsx` | Story AI chat panel |
| `src/components/settings/AIModelSettingsTab.jsx` | Custom AI model configuration |
| `src/stores/useSeriesStore.js` | Series and custom model state |
| `src/stores/useCharactersStore.js` | Character and LoRA management |
| `src/stores/useCreditsStore.js` | AI credit balance and tracking |

## Current Features

- HTML/CSS canvas with html-to-image capture
- Image elements with corner shapes (round, bevel, notch, scoop, squircle)
- Speech bubbles with inline text editing
- Text elements with Google Fonts and auto-resize
- Text effects (POW!, BAM!) with SVG stroke layers
- Font embedding for proper export
- Zoom, pan, undo/redo
- Asset gallery with IndexedDB
- Z-order management
- Multi-select with Ctrl+Click (toggle) and Shift+Click (add)
- Coordinated multi-element dragging
- Shared properties panel for multi-selection
- Rulers and grid overlay
- Snap-to-grid functionality
- Project settings with element defaults (page, images, text, speech bubbles, text effects)
- Per-page settings (dimensions, background)
- Export all pages as ZIP (WebP, PNG, JPEG)
- Element grouping
- AI image generation with Fal.ai (FLUX models, character references, LoRA, custom models)
- AI prompt enhancement (Gemini-powered prompt expansion)
- Story AI chat assistant with vision support (Gemini, Claude, GPT, Llama)
- Credit system for AI features

## Custom Commands

### `/features` - Documentation Update

After completing a feature, run `/features` to update all documentation:

1. Updates `CLAUDE.md` (Current Features, Important Files)
2. Updates relevant `src/docs/*.md` page(s)
3. Updates `CHANGELOG.md`
4. Syncs `.github/copilot-instructions.md`

See `.github/instructions/features-checklist.md` for the full checklist.

## Shared Instructions

This project uses shared instruction files for both Claude Code and GitHub Copilot:

| Location | Purpose |
|----------|---------|
| `.github/instructions/` | Shared checklists and guidelines |
| `.github/agents/` | Copilot agent definitions |
| `.claude/commands/` | Claude Code skill definitions |
