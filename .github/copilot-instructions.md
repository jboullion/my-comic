# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

**Current State:** Phase 7 - Full canvas editor with HTML/CSS canvas (html-to-image for capture), zoom/pan/undo-redo, image elements with advanced properties (rotation, opacity, borders, corner shapes), speech bubbles with inline text editing, text elements for captions/titles, text effect elements (POW!, BAM! style SVG effects), modular collapsible property panels, asset gallery with IndexedDB storage, and Z-order management via context menu and drag-and-drop layers panel.

## Tech Stack & Patterns

- **React 19** with functional components and hooks (no class components)
- **Vite 7** for dev/build with HMR at `http://localhost:5173`
- **React Router 7** for client-side routing (`BrowserRouter` in [src/main.jsx](src/main.jsx))
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (import in [src/index.css](src/index.css))
- **vite-plugin-pwa** with Workbox for offline support, configured in [vite.config.js](vite.config.js)
- **Dexie.js** for IndexedDB operations ([src/lib/db.js](src/lib/db.js))
- **Zustand** for global state management ([src/stores/useProjectStore.js](src/stores/useProjectStore.js))
- **Zundo** for undo/redo functionality (temporal store wrapper)
- **html-to-image** for canvas capture/export ([src/components/HtmlCanvas.jsx](src/components/HtmlCanvas.jsx))
- **react-icons** (Feather icons) for UI icons
- **Google Fonts** for text elements (Bangers, Comic Neue, Permanent Marker, etc.)

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
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

## Coding Conventions

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
| [src/pages/ProjectPage.jsx](src/pages/ProjectPage.jsx) | Main editor workspace |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |

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

## Planned Features

- Panel/frame elements
- Export to image formats (PNG, JPG, PDF)
- Multi-select and group operations

When implementing new features, refer to the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md).
