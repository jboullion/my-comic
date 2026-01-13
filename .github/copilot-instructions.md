# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

## Tech Stack & Patterns

- **React 19** with functional components and hooks (no class components)
- **TypeScript 5.9** - configured for incremental adoption (new files use `.ts`/`.tsx`, existing `.js`/`.jsx` unchanged)
- **Vite 7** for dev/build with HMR at `http://localhost:5173`
- **React Router 7** for client-side routing (`BrowserRouter` in [src/main.jsx](src/main.jsx))
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (import in [src/index.css](src/index.css))
- **vite-plugin-pwa** with Workbox for offline support, configured in [vite.config.js](vite.config.js)
- **Dexie.js** for IndexedDB operations ([src/lib/db.js](src/lib/db.js))
- **Zustand** for global state management ([src/stores/useProjectStore.js](src/stores/useProjectStore.js))
- **Zundo** for undo/redo functionality (temporal store wrapper)
- **html-to-image** for canvas capture/export ([src/components/HtmlCanvas.jsx](src/components/HtmlCanvas.jsx))
- **Fal.ai** (`@fal-ai/client`) for AI image generation with FLUX models
- **OpenRouter** for Story AI chat (vision-capable LLMs)
- **Supabase Edge Functions** for AI credit system and API security
- **react-icons** (Feather icons) for UI icons
- **Google Fonts** for text elements (Bangers, Comic Neue, Permanent Marker, etc.)

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Environment Setup

**Required Environment Variables:**

Copy `.env.example` to `.env.local` and configure:

```bash
# Fal.ai for AI image generation (required for AI features)
VITE_FAL_AI_KEY=your-key-here  # Get from https://fal.ai/dashboard/keys

# Supabase for authentication (optional)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

## Architecture Decisions

### Storage Strategy
Per the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md):
- **IndexedDB** via Dexie.js ([src/lib/db.js](src/lib/db.js)) for auto-save and working projects
- **File System Access API** for explicit saves as `.cbproject` files (JSON format)
- **Fallback:** Traditional download/upload for Firefox
- **Zustand store** ([src/stores/useProjectStore.js](src/stores/useProjectStore.js)) manages project state

### Image Handling
- Convert to WebP (80-85% quality), max 1920px width
- SHA-256 hash-based deduplication
- Warn at 300MB project size, require file save at 500MB

## Project Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── elements/
│   │   │   ├── HtmlImageElement.jsx   # Image element with corner shapes
│   │   │   ├── HtmlSpeechBubble.jsx   # Speech bubble with text editing
│   │   │   ├── HtmlTextElement.jsx    # Text element for captions/titles
│   │   │   ├── HtmlTextEffect.jsx     # SVG text effects (POW!, BAM!)
│   │   │   └── SelectionHandles.jsx   # Resize/rotate handles component
│   │   ├── CanvasContextMenu.jsx      # Right-click context menu
│   │   └── ZoomControls.jsx           # Zoom UI controls
│   ├── editor/
│   │   ├── properties/
│   │   │   ├── ElementProperties.jsx  # Property panel orchestrator
│   │   │   ├── sections/              # Modular property sections
│   │   │   │   ├── CollapsibleSection.jsx
│   │   │   │   ├── SizeSection.jsx
│   │   │   │   ├── BorderShapeSection.jsx
│   │   │   │   ├── BubbleStyleSection.jsx
│   │   │   │   ├── TextSection.jsx
│   │   │   │   ├── TextStyleSection.jsx      # Text element styling
│   │   │   │   ├── TextEffectStyleSection.jsx # Text effect styling
│   │   │   │   └── TransformSection.jsx
│   │   │   ├── AssetGallery.jsx
│   │   │   ├── LayersPanel.jsx
│   │   │   └── PageSettings.jsx
│   │   ├── ui/                        # Reusable form controls
│   │   │   ├── NumberInput.jsx        # Number with +/- buttons
│   │   │   ├── RangeInput.jsx         # Slider with number input
│   │   │   ├── FontSelect.jsx         # Font family dropdown
│   │   │   ├── PropertyInput.jsx
│   │   │   └── ToolButton.jsx
│   │   ├── FloatingToolbar.jsx
│   │   ├── PagesSidebar.jsx
│   │   └── PropertiesSidebar.jsx
│   ├── HtmlCanvas.jsx                 # Main canvas with html-to-image capture
│   └── ...
├── contexts/
│   └── AuthContext.jsx                # Supabase auth
├── hooks/
│   ├── useAsset.js                    # Load asset metadata
│   ├── useImage.js                    # Load & cache images
│   └── useElementInteraction.js       # Drag/resize/rotate for elements
├── utils/
│   └── fontEmbed.js                   # Font embedding for html-to-image
├── layouts/
│   ├── AppLayout.jsx                  # Protected routes
│   ├── PublicLayout.jsx
│   └── DocsLayout.jsx
├── lib/
│   ├── db.js                          # Dexie IndexedDB schema
│   ├── images.js                      # Image optimization
│   ├── canvasShapes.js                # Shape drawing utilities
│   └── supabase.js
├── pages/
│   ├── ProjectPage.jsx                # Main editor
│   ├── ProjectsPage.jsx               # Project list
│   └── ...
└── stores/
    └── useProjectStore.js             # Zustand + Zundo state
```

## Element Types

### Image Elements
- Drag, resize, rotate with transformation handles
- Custom corner shapes: round, bevel, notch, scoop, squircle
- Border/stroke with color and width
- Opacity control
- Properties in: `SizeSection`, `BorderShapeSection`, `TransformSection`

### Speech Bubble Elements
- HTML-based overlay for easy text editing
- Styles: Round or Cloud shape
- Customizable fill/stroke colors and corner radius
- Text alignment, font size, text color
- Double-click to edit text inline
- Properties in: `SizeSection`, `BubbleStyleSection`, `TextSection`, `TransformSection`

### Text Elements
- Simple text for captions, narration, titles
- ContentEditable for inline editing (double-click to edit)
- Auto-resizes to fit content
- Google Fonts support (Comic Neue, Roboto, Montserrat, etc.)
- Font size, weight, color, alignment controls
- Full resize and rotate handles
- Properties in: `SizeSection`, `TextStyleSection`, `TransformSection`

### Text Effect Elements
- SVG-based comic effects (POW!, BAM!, BOOM!, ZAP!)
- Multiple stroke layers: fill + stroke + outer stroke
- Presets for quick creation via toolbar dropdown
- Auto-resizes based on SVG bounding box
- Rotate handle only (no resize handles)
- Text editing via properties panel only
- Properties in: `SizeSection`, `TextEffectStyleSection`, `TransformSection`

## AI Image Generation

AI-powered text-to-image generation using Fal.ai with FLUX models, routed through Supabase Edge Functions for credit tracking.

**Access:** Canvas toolbar → "AI Image (A)" button (keyboard shortcut: A key)

### Core Integration

**Key Files:**
- `src/lib/ai/falai.js` - Fal.ai integration
- `src/lib/ai/edgeFunctions.ts` - Edge function client for credit-tracked API calls
- `src/components/editor/AIImageModal.jsx` - Main UI modal with Generate/Advanced/History tabs

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

### Generation Modes

**Simple Mode (Generate Tab):**
- Prompt input with AI-powered enhancement (Gemini)
- Character picker for consistent appearance
- Style/model/size selection

**Advanced Mode:**
Structured prompts with separate fields:
- Scene/Setting - Environment description
- Character/Subject - Who/what is in the image
- Lighting/Atmosphere - Mood and lighting
- Composition/Framing - Camera angle
- Style (free text) - Additional notes
- Advanced parameters: guidance scale, steps, seed, negative prompt

### AI Models & Styles

**Available Models:**
| Model | Quality | Cost |
|-------|---------|------|
| FLUX 2 Pro | Highest | 8 credits |
| FLUX 2 Dev | High | 5 credits |
| Nano Banana | Good | 2 credits |
| Custom | Varies | 5 credits |

**Style Presets:**
- `comic` - Bold ink lines, cel-shaded, vibrant colors
- `manga` - Black and white, screentone, Japanese art
- `realistic` - Photorealistic, detailed
- `retro` - Vintage 1960s pop art, halftone dots
- `none` - No style applied

### Character Integration

Characters in `useCharactersStore` can have AI-specific properties:
- `profileImage.blob` - Reference image for consistency
- `loraUrl` - CivitAI LoRA download URL
- `loraTriggerWord` - Activation word (auto-prepended to prompt)
- `loraScale` - LoRA strength (0-1, default 0.8)

### Custom Base Models

Series-level configuration via `AIModelSettingsTab`:
```javascript
{
  enabled: true,
  name: "My Custom Style",
  type: 'flux',              // 'flux' | 'sdxl' | 'sd15'
  url: 'https://civitai.com/models/...',
  allowMature: false
}
```

### Generation History

- Last 20 generations stored per project (localStorage)
- Click to restore settings
- View full prompt, model, seed, style

## Story AI Chat

AI-powered story assistant using OpenRouter with vision-capable LLMs, routed through Supabase Edge Functions.

**Access:** Story AI panel in right sidebar

### Core Integration

**Key Files:**
- `src/lib/ai/openrouter.js` - OpenRouter integration
- `src/lib/ai/edgeFunctions.ts` - Edge function client
- `src/components/editor/StoryAIPanel.jsx` - Chat panel UI

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

### Features

- **Vision Support** - Capture current page or upload images for analysis
- **Project Context** - AI knows your characters and story
- **Custom Prompts** - Per-series story guidelines
- **Chat History** - Up to 50 messages per project

### Available Models

| Provider | Models |
|----------|--------|
| Google | Gemini 2.5 Flash, Gemini 3 Flash, Gemini 2.5 Pro |
| Anthropic | Claude Sonnet 4.5, Claude Haiku 4.5 |
| OpenAI | GPT-5-mini, GPT-5-nano, GPT-4o |
| Meta | Llama 3.2 90B Vision |
| ByteDance | Seed 1.6 Flash |

### Custom Story Prompts

Series-level custom prompts give the AI specific instructions:
```javascript
// Example custom prompt
"This is a noir detective comic set in 1940s Chicago.
The dialogue should be snappy and use period-appropriate slang."
```

## Coding Conventions

### TypeScript
- **New files:** Use `.ts` for modules, `.tsx` for React components
- **Existing files:** Remain as `.js`/`.jsx` - no conversion required
- **Strict mode:** Enabled for all TypeScript files
- **Imports:** Mix JS and TS freely - Vite handles both seamlessly
- **Type definitions:** Pre-installed for React and React DOM

Example:
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

### Component Structure
- Single component per file, default export
- Page components in `src/pages/`
- Layouts in `src/layouts/`
- Shared components in `src/components/`
- Property sections in `src/components/editor/properties/sections/`
- Reusable UI controls in `src/components/editor/ui/`
- Use `useState`/`useEffect` hooks; Zustand for global/shared state

### Reusable UI Components
When adding property controls, use these existing components:
- **NumberInput** - Number field with +/- chevron buttons
- **RangeInput** - Slider with attached number input
- **PropertyInput** - Basic text/number input with label
- **CollapsibleSection** - Accordion wrapper with localStorage persistence
- **FontSelect** - Font family dropdown with Google Fonts preview

### Styling
- Tailwind utility classes only (no CSS modules)
- Dark theme: `bg-slate-900`, `text-white`, accents with `indigo-500`
- Use `@import "tailwindcss"` in CSS files
- **Tailwind v4 hover fix:** Custom `@custom-variant hover (&:hover)` in [src/index.css](src/index.css)
- **Avoid transparency/opacity on backgrounds** — Use solid colors to prevent GPU artifacts
- **Avoid `backdrop-blur`** — Can cause visual artifacts on some GPUs
- **Layout flex-shrink:** Use `shrink-0` on fixed-width sidebars, `min-w-0` on flexible areas

### Color Palette
```css
--color-slate-950: #0a0a0a;
--color-slate-900: #121212;   /* Main backgrounds */
--color-slate-800: #1e1e1e;   /* Secondary backgrounds */
--color-slate-700: #2d2d2d;   /* Borders, buttons */
--color-slate-600: #3f3f3f;   /* Hover states */
--color-slate-500: #525252;   /* Muted text */
--color-slate-400: #737373;   /* Secondary text */
--color-indigo-500: #4c69f6;  /* Primary accent */
```

### Form Control Patterns
Labels: `text-[10px] text-slate-500 uppercase font-bold`
Inputs: `bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm`
Focus: `focus:outline-none focus:ring-2 focus:ring-indigo-500/50`
Buttons: `bg-slate-700 hover:bg-slate-600 transition-colors`

### ESLint Rules
- Configured for React hooks and fast refresh
- Unused vars starting with uppercase are ignored (`varsIgnorePattern: '^[A-Z_]'`)

## State Management

### useProjectStore (Zustand + Zundo)
```javascript
// Key state
currentProject: { id, title, settings, assets, pages }
activePageIndex: number
selectedElementIds: string[]
zoom: number
tool: 'select' | 'image' | 'text' | 'speechBubble'

// Key actions
updateElement(elementId, updates)    // Update element properties
addImage(file)                       // Upload & add image
addSpeechBubble(position)           // Create speech bubble
addText(position)                    // Create text element
addTextEffect(preset, position)      // Create text effect (pow, bam, boom, zap)
deleteSelectedElements()
reorderElements(ids, direction)      // Z-order operations
```

### Undo/Redo
- Zundo middleware captures `currentProject` state
- Max 50 undo steps
- Access: `useProjectStore.temporal.getState().undo()` / `.redo()`

## PWA Configuration

**Service Worker Features:**
- **Auto-update** — New versions detected via `PWAUpdatePrompt`
- **Offline indicator** — Banner via `OfflineIndicator`
- **Install prompt** — "Install App" in user dropdown
- **Dev mode enabled** — PWA works in development

**Caching Strategy:**
- Static assets → Precached on install
- Google Fonts → CacheFirst (1 year)
- Supabase API → NetworkFirst (5 min cache)
- Images → CacheFirst (30 days, max 100 entries)

## Authentication (Supabase)

- **Provider:** Supabase Auth with Google and Discord OAuth
- **Setup:** Copy `.env.example` to `.env.local` and add Supabase credentials
- **Hook:** Use `useAuth()` from [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)

```jsx
const { user, loading, signInWithGoogle, signInWithDiscord, signOut } = useAuth()
```

## Key Files

| File | Purpose |
|------|---------|
| [src/stores/useProjectStore.js](src/stores/useProjectStore.js) | All application state |
| [src/components/HtmlCanvas.jsx](src/components/HtmlCanvas.jsx) | Canvas with zoom, pan, element rendering, capture |
| [src/components/canvas/elements/HtmlImageElement.jsx](src/components/canvas/elements/HtmlImageElement.jsx) | Image element with corner shapes |
| [src/components/canvas/elements/HtmlSpeechBubble.jsx](src/components/canvas/elements/HtmlSpeechBubble.jsx) | Speech bubble with text editing |
| [src/components/canvas/elements/HtmlTextElement.jsx](src/components/canvas/elements/HtmlTextElement.jsx) | Text element with inline editing |
| [src/components/canvas/elements/HtmlTextEffect.jsx](src/components/canvas/elements/HtmlTextEffect.jsx) | SVG text effects (POW!, BAM!) |
| [src/components/canvas/elements/SelectionHandles.jsx](src/components/canvas/elements/SelectionHandles.jsx) | Reusable resize/rotate handles |
| [src/hooks/useElementInteraction.js](src/hooks/useElementInteraction.js) | Drag, resize, rotate logic |
| [src/components/editor/properties/ElementProperties.jsx](src/components/editor/properties/ElementProperties.jsx) | Property panel orchestrator |
| [src/components/editor/properties/sections/](src/components/editor/properties/sections/) | Modular property sections |
| [src/components/editor/ui/FontSelect.jsx](src/components/editor/ui/FontSelect.jsx) | Font family dropdown |
| [src/utils/fontEmbed.js](src/utils/fontEmbed.js) | Font embedding for html-to-image capture |
| [src/lib/db.js](src/lib/db.js) | Dexie IndexedDB schema |
| [src/lib/ai/falai.js](src/lib/ai/falai.js) | Fal.ai integration |
| [src/lib/ai/openrouter.js](src/lib/ai/openrouter.js) | OpenRouter integration for Story AI |
| [src/lib/ai/edgeFunctions.ts](src/lib/ai/edgeFunctions.ts) | Edge function client for credit-tracked API calls |
| [src/components/editor/AIImageModal.jsx](src/components/editor/AIImageModal.jsx) | AI image generation UI |
| [src/components/editor/StoryAIPanel.jsx](src/components/editor/StoryAIPanel.jsx) | Story AI chat panel |
| [src/components/editor/CharacterPicker.jsx](src/components/editor/CharacterPicker.jsx) | Character selection dropdown |
| [src/components/settings/AIModelSettingsTab.jsx](src/components/settings/AIModelSettingsTab.jsx) | Custom AI model configuration |
| [src/stores/useSeriesStore.js](src/stores/useSeriesStore.js) | Series and custom model state |
| [src/stores/useCharactersStore.js](src/stores/useCharactersStore.js) | Character and LoRA management |
| [src/stores/useCreditsStore.js](src/stores/useCreditsStore.js) | AI credit balance and tracking |
| [src/pages/ProjectPage.jsx](src/pages/ProjectPage.jsx) | Main editor workspace |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |

## Current Features

- HTML/CSS canvas with html-to-image capture, zoom, pan, undo/redo
- Image elements with rotation, opacity, borders, corner shapes
- Panel elements with custom corner geometries (bevel, notch, scoop, squircle)
- Asset gallery with IndexedDB storage and drag-and-drop
- Z-order management via right-click context menu
- Drag-and-drop layer reordering in layers panel
- Speech bubbles with editable text (round and cloud styles)
- Text elements with Google Fonts, inline editing, auto-resize
- Text effect elements (POW!, BAM!) with SVG fill/stroke/outer stroke
- Font embedding for proper capture/export of custom fonts
- Modular collapsible property sections with localStorage persistence
- Reusable UI components (NumberInput, RangeInput, FontSelect, CollapsibleSection)
- Multi-select with Ctrl+Click (toggle) and Shift+Click (add)
- Coordinated multi-element dragging
- Shared properties panel for multi-selection
- Rulers and grid overlay
- Snap-to-grid functionality
- Project settings with element defaults
- Per-page settings (dimensions, background)
- Export all pages as ZIP (WebP, PNG, JPEG)
- Element grouping
- AI image generation with Fal.ai (FLUX models, character references, LoRA, custom models)
- AI prompt enhancement (Gemini-powered prompt expansion)
- Story AI chat assistant with vision support (Gemini, Claude, GPT, Llama)
- Character management with AI profile images and LoRA integration
- Series-level custom AI model configuration
- Generation history tracking (localStorage, max 20 per project)
- Credit system for AI features
