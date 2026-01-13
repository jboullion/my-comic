# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

**Current State:** Phase 7 - Full canvas editor with HTML/CSS canvas (html-to-image for capture), zoom/pan/undo-redo, image elements with advanced properties (rotation, opacity, borders, corner shapes), speech bubbles with inline text editing, text elements for captions/titles, text effect elements (POW!, BAM! style SVG effects), modular collapsible property panels, asset gallery with IndexedDB storage, and Z-order management via context menu and drag-and-drop layers panel.

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

**Overview:**
AI-powered text-to-image generation using Fal.ai with FLUX models, character references, LoRA fine-tuning, and custom CivitAI models.

**Access:** Canvas toolbar → "AI Image (A)" button (keyboard shortcut: A key)

### Core Integration

**Main Library:** `src/lib/falai.js` (~325 lines)

```javascript
import { generateImage, uploadImageToFal, fetchImageAsBlob, isFalConfigured } from '@/lib/falai'

// Generate image
const result = await generateImage({
  prompt: "A superhero flying through the city",
  style: 'comic',              // 'comic' | 'manga' | 'realistic' | 'retro' | 'none'
  model: 'flux-2-pro',         // 'flux-2-pro' | 'flux-2' | 'nano-banana' | 'custom'
  imageSize: 'match_page',     // Auto-calculate from page dimensions
  referenceImageBlob: blob,    // Character reference image
  referenceStrength: 0.75,     // 0-1 (how closely to match reference)
  loraUrl: 'civitai.com/...',  // Character LoRA URL
  loraTriggerWord: 'hero1',    // LoRA activation word
  loraScale: 0.8               // LoRA strength (0-1)
})

// Returns:
{
  imageUrl: string,
  width: number,
  height: number,
  seed: number,
  prompt: string,
  fullPrompt: string,      // Prompt with style suffix applied
  model: string,
  usedReference: boolean,
  usedLora: boolean,
  usedCustomModel: boolean
}
```

### AI Models & Styles

**Available Models:**
- `flux-2-pro` - Fal.ai FLUX 2 Pro (~$0.03/MP, highest quality)
- `flux-2` - Fal.ai FLUX 2 Dev (~$0.012/MP, 28 steps)
- `nano-banana` - Fal.ai Nano Banana Pro (~$0.001/MP, 4 steps, fastest)
- `custom` - Series-level custom model from CivitAI

**Style Presets:**
Each style adds a suffix to the prompt for consistent aesthetic:
- `comic` - "comic book illustration, vibrant colors, clean line art, dynamic composition"
- `manga` - "manga art style, screentone shading, expressive line work"
- `realistic` - "photorealistic, detailed, high quality photograph"
- `retro` - "vintage comic book, retro illustration, halftone dots, aged paper texture"
- `none` - No suffix applied

### Character Integration

**Character Properties:**
Characters in `useCharactersStore` can have AI-specific data:

```javascript
{
  profileImage: {
    blob: Blob,              // Reference image for character consistency
    preview: string          // Data URL for display
  },
  loraUrl: string,           // CivitAI LoRA download URL
  loraTriggerWord: string,   // Word to activate LoRA (auto-prepended to prompt)
  loraScale: number          // LoRA strength (0-1, default 0.8)
}
```

**Reference Images:**
- Upload character profile images via `CharacterPicker`
- Images uploaded to Fal storage via `uploadImageToFal()`
- Applied using `image_to_image` or `controlnet_image` parameters
- Strength controlled by `referenceStrength` slider (0-1)

**LoRA Models:**
- Support for CivitAI URLs and direct download links
- Trigger words automatically prepended to prompts
- Multiple character LoRAs can be combined in one generation
- Scale controls influence strength per character

### Custom Base Models

**Series-Level Configuration:**
Managed in `useSeriesStore` via `AIModelSettingsTab`:

```javascript
// Custom model structure
{
  enabled: boolean,
  name: string,
  type: 'flux' | 'sdxl' | 'sd15',
  url: string,               // CivitAI model page URL
  allowMature: boolean       // Safety checker setting
}
```

**Model Priority (when selecting which model to use):**
1. Custom model from CivitAI (if series has custom model enabled)
2. Character LoRA (if selected character has loraUrl)
3. Character reference (if selected character has profileImage)
4. Standard FLUX model (default)

### UI Components

**AIImageModal** (`src/components/editor/AIImageModal.jsx` ~750 lines)

Modal with two tabs:
- **Generate Tab:** Prompt input, character picker, style/model/size selection, reference strength slider
- **History Tab:** Last 20 generation records with metadata

**Key Props:**
```javascript
<AIImageModal
  isOpen={showAIModal}
  onClose={() => setShowAIModal(false)}
  onImageGenerated={(imageBlob, metadata) => {
    // Add to canvas with AI metadata
    addImage(imageBlob, {
      addToCanvas: true,
      aiMetadata: metadata
    })
  }}
/>
```

**CharacterPicker** (`src/components/editor/CharacterPicker.jsx`)
- Multi-select dropdown for choosing characters
- Filters by current series
- Shows profile images and LoRA indicators
- Used in AIImageModal Generate tab

### Generation Workflow

1. **Input:** User enters prompt, selects style/model/size
2. **Character Selection:** Picks characters (optional) for reference/LoRA
3. **Prompt Building:**
   - Prepend LoRA trigger words
   - Append style suffix (unless style='none')
4. **Image Processing:**
   - Upload reference images to Fal storage
   - Calculate dimensions (round to nearest 64px multiple, min 256px)
5. **API Call:**
   - Subscribe to Fal queue via `fal.subscribe()`
   - Track progress: `UPLOADING`, `IN_QUEUE`, `IN_PROGRESS`, `PENDING`
   - Show queue position when available
6. **Result Handling:**
   - Fetch generated image as blob
   - Save metadata (prompt, model, seed, style, characters used)
   - Add to generation history (localStorage, max 20)
   - Insert into canvas as new image element

### Image Size Handling



**Preset Sizes:**
- Various standard sizes available in dropdown
- Format: "widthxheight" (e.g., "1024x1024")

### Error Handling

**Configuration Errors:**
- Missing API key → Show amber alert with setup link
- Invalid key → "Invalid Fal.ai API key" error

**Generation Errors:**
- 401 → Invalid API key
- 402 → Insufficient Fal.ai credits
- Upload failures → "Failed to upload reference image"
- Queue timeout → Generic error message

**User Feedback:**
- Spinner during generation
- Queue position display ("Position in queue: 3")
- Preview thumbnail after generation
- Metadata display (seed, model used, dimensions)

### State Management

**Modal State:**
```javascript
const [prompt, setPrompt] = useState('')
const [style, setStyle] = useState('comic')
const [model, setModel] = useState('flux-2-pro')
const [imageSize, setImageSize] = useState('match_page')
const [selectedCharacterIds, setSelectedCharacterIds] = useState([])
const [referenceStrength, setReferenceStrength] = useState(0.75)
const [isGenerating, setIsGenerating] = useState(false)
const [generatedImage, setGeneratedImage] = useState(null)
const [progress, setProgress] = useState('')
```

**History Storage:**
```javascript
// localStorage key: 'ai-image-history-{projectId}'
// Max 20 entries, newest first
{
  id: string,
  prompt: string,
  fullPrompt: string,
  style: string,
  model: string,
  timestamp: number,
  seed: number
}
```

### Safety & Mature Content

**Default Behavior:**
- FLUX Pro models: `safety_tolerance: '5'`
- Other models: `enable_safety_checker: false`
- Built-in content filters in FLUX models

**Custom Model Control:**
- `allowMature` flag in series custom model settings
- Controls safety checker for CivitAI models
- Warning displayed in UI about default FLUX filters

### Key Integration Points

**FloatingToolbar Integration:**
```javascript
// src/components/editor/FloatingToolbar.jsx
<ToolButton
  icon={FiCpu}
  label="AI Image"
  shortcut="A"
  onClick={onOpenAIModal}
  active={false}
/>
```

**Project Page Integration:**
```javascript
// src/pages/ProjectPage.jsx
const [showAIModal, setShowAIModal] = useState(false)

<AIImageModal
  isOpen={showAIModal}
  onClose={() => setShowAIModal(false)}
  onImageGenerated={handleAIImageGenerated}
/>
```

**Store Actions Used:**
```javascript
// useProjectStore
addImage(file, { addToCanvas: true, aiMetadata })

// useSeriesStore
getSeriesCustomModel(seriesId)
updateSeriesCustomModel(seriesId, customModel)

// useCharactersStore
createCharacter(name, description, seriesId, { loraUrl, loraTriggerWord, loraScale })
```

### Future AI Features (Planned)

From `docs/AI Implementation Tech Spec.md`:
- LLM integration for story/dialogue suggestions
- Video generation with Fal.ai VEO3 (image-to-video)
- Voice AI with character voice cloning (Dia TTS)
- Motion animation with LTX Video
- Credit system with Supabase tracking

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
| [src/lib/falai.js](src/lib/falai.js) | Fal.ai integration and AI generation |
| [src/components/editor/AIImageModal.jsx](src/components/editor/AIImageModal.jsx) | AI image generation UI |
| [src/components/editor/CharacterPicker.jsx](src/components/editor/CharacterPicker.jsx) | Multi-select character dropdown |
| [src/components/settings/AIModelSettingsTab.jsx](src/components/settings/AIModelSettingsTab.jsx) | Custom AI model configuration |
| [src/stores/useSeriesStore.js](src/stores/useSeriesStore.js) | Series and custom model state |
| [src/stores/useCharactersStore.js](src/stores/useCharactersStore.js) | Character and LoRA management |
| [src/pages/ProjectPage.jsx](src/pages/ProjectPage.jsx) | Main editor workspace |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |
| [docs/AI Implementation Tech Spec.md](docs/AI Implementation Tech Spec.md) | AI features specification |

## Implemented Features

- ✅ HTML/CSS canvas with html-to-image capture, zoom, pan, undo/redo
- ✅ Image elements with rotation, opacity, borders, corner shapes
- ✅ Panel elements with custom corner geometries (bevel, notch, scoop, squircle)
- ✅ Asset gallery with IndexedDB storage and drag-and-drop
- ✅ Z-order management via right-click context menu
- ✅ Drag-and-drop layer reordering in layers panel
- ✅ Speech bubbles with editable text (round and cloud styles)
- ✅ Text elements with Google Fonts, inline editing, auto-resize
- ✅ Text effect elements (POW!, BAM!) with SVG fill/stroke/outer stroke
- ✅ Font embedding for proper capture/export of custom fonts
- ✅ Modular collapsible property sections with localStorage persistence
- ✅ Reusable UI components (NumberInput, RangeInput, FontSelect, CollapsibleSection)
- ✅ AI image generation with Fal.ai (FLUX models, character references, LoRA, custom CivitAI models)
- ✅ Character management with AI profile images and LoRA integration
- ✅ Series-level custom AI model configuration
- ✅ Generation history tracking (localStorage, max 20 per project)

## Planned Features

- Panel/frame elements
- Export to image formats (PNG, JPG, PDF)
- Multi-select and group operations

When implementing new features, refer to the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md).
