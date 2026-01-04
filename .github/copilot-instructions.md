# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

**Current State:** Phase 6 - Full canvas editor with Konva.js, zoom/pan/undo-redo, image elements with advanced properties (rotation, opacity, borders, corner shapes), speech bubbles with inline text editing, modular collapsible property panels, asset gallery with IndexedDB storage, and Z-order management via context menu and drag-and-drop layers panel.

## Tech Stack & Patterns

- **React 19** with functional components and hooks (no class components)
- **Vite 7** for dev/build with HMR at `http://localhost:5173`
- **React Router 7** for client-side routing (`BrowserRouter` in [src/main.jsx](src/main.jsx))
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (import in [src/index.css](src/index.css))
- **vite-plugin-pwa** with Workbox for offline support, configured in [vite.config.js](vite.config.js)
- **Dexie.js** for IndexedDB operations ([src/lib/db.js](src/lib/db.js))
- **Zustand** for global state management ([src/stores/useProjectStore.js](src/stores/useProjectStore.js))
- **Zundo** for undo/redo functionality (temporal store wrapper)
- **Konva.js** via `react-konva` for canvas rendering ([src/components/ComicCanvas.jsx](src/components/ComicCanvas.jsx))
- **react-icons** (Feather icons) for UI icons

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
│   │   │   ├── ElementRenderer.jsx    # Routes elements to type-specific renderers
│   │   │   ├── ImageElement.jsx       # Konva image with corner shapes
│   │   │   └── HtmlSpeechBubble.jsx   # HTML speech bubble overlay
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
│   │   │   │   └── TransformSection.jsx
│   │   │   ├── AssetGallery.jsx
│   │   │   ├── LayersPanel.jsx
│   │   │   └── PageSettings.jsx
│   │   ├── ui/                        # Reusable form controls
│   │   │   ├── NumberInput.jsx        # Number with +/- buttons
│   │   │   ├── RangeInput.jsx         # Slider with number input
│   │   │   ├── PropertyInput.jsx
│   │   │   └── ToolButton.jsx
│   │   ├── FloatingToolbar.jsx
│   │   ├── PagesSidebar.jsx
│   │   └── PropertiesSidebar.jsx
│   ├── ComicCanvas.jsx                # Main canvas manager
│   └── ...
├── contexts/
│   └── AuthContext.jsx                # Supabase auth
├── hooks/
│   ├── useAsset.js                    # Load asset metadata
│   └── useImage.js                    # Load & cache images
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
| [src/components/ComicCanvas.jsx](src/components/ComicCanvas.jsx) | Canvas with zoom, pan, element rendering |
| [src/components/canvas/elements/ImageElement.jsx](src/components/canvas/elements/ImageElement.jsx) | Konva image with corner shapes |
| [src/components/canvas/elements/HtmlSpeechBubble.jsx](src/components/canvas/elements/HtmlSpeechBubble.jsx) | Speech bubble with text editing |
| [src/components/editor/properties/ElementProperties.jsx](src/components/editor/properties/ElementProperties.jsx) | Property panel orchestrator |
| [src/components/editor/properties/sections/](src/components/editor/properties/sections/) | Modular property sections |
| [src/components/editor/ui/NumberInput.jsx](src/components/editor/ui/NumberInput.jsx) | Number input with +/- buttons |
| [src/components/editor/ui/RangeInput.jsx](src/components/editor/ui/RangeInput.jsx) | Slider with number input |
| [src/lib/db.js](src/lib/db.js) | Dexie IndexedDB schema |
| [src/lib/canvasShapes.js](src/lib/canvasShapes.js) | Shape drawing (round, bevel, notch, scoop, squircle) |
| [src/pages/ProjectPage.jsx](src/pages/ProjectPage.jsx) | Main editor workspace |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |

## Implemented Features

- ✅ Konva.js canvas with zoom, pan, undo/redo
- ✅ Image elements with rotation, opacity, borders, corner shapes
- ✅ Panel elements with custom corner geometries (bevel, notch, scoop, squircle)
- ✅ Asset gallery with IndexedDB storage and drag-and-drop
- ✅ Z-order management via right-click context menu
- ✅ Drag-and-drop layer reordering in layers panel
- ✅ Speech bubbles with editable text (round and cloud styles)
- ✅ Modular collapsible property sections with localStorage persistence
- ✅ Reusable UI components (NumberInput, RangeInput, CollapsibleSection)

## Planned Features

- Text elements with font selection
- Panel/frame elements
- Export to image formats (PNG, JPG, PDF)
- Multi-select and group operations

When implementing new features, refer to the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md).
