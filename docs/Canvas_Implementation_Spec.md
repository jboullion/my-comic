# Comic Book Maker - Canvas Implementation Specification

**Version:** 1.0  
**Date:** January 2, 2026  
**Status:** Planning Phase

---

## 1. Overview

This document defines the technical implementation of the canvas-based comic editor using Konva.js. The canvas is the core creative workspace where users compose comic pages by arranging images, panels, text, and effects.

### Goals

- **Intuitive manipulation** — Drag, resize, rotate elements with visual feedback
- **Non-destructive editing** — All changes reversible, original assets preserved
- **Performance** — Smooth 60fps interaction even with complex pages
- **Flexible workflow** — Support both paneled and unpaneled comic styles
- **Rich toolset** — Images, panels, speech bubbles, effects, and text

---

## 2. Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Canvas Library** | Konva.js via react-konva | Canvas manipulation, event handling |
| **State Management** | Zustand + temporal middleware (zundo) | Undo/redo, canvas state |
| **Image Processing** | Browser Canvas API | WebP conversion, resizing, cropping |
| **Text Rendering** | Konva Text + Google Fonts | Speech bubbles, captions |
| **Animation** | HTML overlay + ffmpeg.wasm (future) | Animated WebP/GIF support |

---

## 3. Implementation Phases

### Phase 1: Core Canvas (Week 1)
- Konva Stage and Layer setup
- Zoom (scroll wheel) and pan (space+drag, middle-mouse)
- Background color from project settings
- Keyboard shortcuts foundation (Delete, arrows, Ctrl+Z)
- Canvas resize/fit controls

### Phase 2: Undo/Redo (Week 1-2)
- Integrate `zundo` package with Zustand
- Global history with action batching
- Limit to 50 undo steps
- Smart grouping (drag = 1 step, typing batched)

### Phase 3: Images (Week 2-3)
- Upload images to project asset library
- Convert to WebP (80-85% quality)
- Drag from gallery to canvas
- Resize, rotate, flip controls
- Editable border (width, color)
- Non-destructive crop using Konva clip
- Opacity control
- Lock aspect ratio toggle

### Phase 4: Image Gallery (Week 3)
- Sidebar panel showing all project images
- Page filter toggle ("Show only images on this page")
- Usage badges (e.g., "Used on 3 pages")
- Drag-to-canvas interaction
- Delete from canvas (keeps in library)
- Image metadata (name, size, dimensions)

### Phase 5: Panels (Week 4-5) (Deprecated. No longer using panels)
- Clipping group implementation
- Preset layouts (2x2, 3-panel, manga)
- Drag to create panels
- Resize/move panels
- Gutter width control
- Panel border styling
- Images can be dragged into panels
- Unmasked base layer for background images

### Phase 6: Speech Bubbles (Week 5-6)
- Preset bubble shapes (oval, rectangle, cloud, shout/burst)
- Text input with comic fonts (Bangers, Comic Neue, Komika)
- Draggable tail anchor point
- Font size, color, alignment controls
- Bubble fill and stroke styling
- Text overflow handling (auto-shrink or indicator)

### Phase 7: Effects & Decals (Week 6-7)
- Built-in SVG decal library (Bam!, Pow!, etc.)
- Action text tool with comic fonts
- Text effects (outline, drop shadow, rotation)
- Color gradient fills
- Drag to position, scale, rotate

### Phase 8: Export (Week 7-8)
- Export single page as PNG/WebP
- Export all pages as ZIP
- Quality and resolution controls
- Watermark option (for free tier)

### Phase 9: Animation Support (Week 8-9+)
- Display animated WebP/GIF on canvas (HTML overlay)
- Static frame export for quick export
- HTML package export (index.html + assets)
- Future: ffmpeg.wasm for animated WebP export

---

## 4. Data Structures

### Project Schema

```javascript
{
  version: "1.0",
  settings: {
    width: 800,           // Default page width
    height: 1200,         // Default page height
    backgroundColor: "#ffffff",
    defaultGutter: 10,    // Space between panels
    defaultImageBorder: { width: 1, color: "#000000" }
  },
  assets: {
    images: [
      {
        id: "img-abc123",           // Unique ID
        name: "hero.webp",          // Original filename
        hash: "sha256...",          // For deduplication
        size: 102400,               // Bytes
        width: 1200,                // Original dimensions
        height: 1600,
        animated: false,            // Is it animated?
        frameCount: 1,              // For animated images
        blob: Blob                  // Actual image data
      }
    ],
    fonts: ["Bangers", "Comic Neue"]  // Custom fonts used
  },
  pages: [
    {
      id: "page-1",
      backgroundColor: "#ffffff",  // Can override per page
      panels: [
        {
          id: "panel-1",
          x: 0,
          y: 0,
          width: 400,
          height: 600,
          borderWidth: 2,
          borderColor: "#000000",
          fill: null,               // Transparent by default
          clipChildren: true        // Clip images to panel bounds
        }
      ],
      elements: [
        {
          type: "image",
          id: "elem-1",
          assetId: "img-abc123",    // Reference to assets.images
          panelId: "panel-1",       // null if not in panel
          x: 50,
          y: 50,
          width: 300,
          height: 400,
          rotation: 0,              // Degrees
          scaleX: 1,
          scaleY: 1,
          flipX: false,
          flipY: false,
          crop: {                   // Non-destructive crop
            x: 0,
            y: 0,
            width: 300,
            height: 400
          },
          border: {
            width: 1,
            color: "#000000"
          },
          opacity: 1,
          locked: false,
          zIndex: 1
        },
        {
          type: "bubble",
          id: "elem-2",
          shape: "oval",            // oval, rectangle, cloud, shout
          panelId: null,
          x: 200,
          y: 100,
          width: 150,
          height: 80,
          rotation: 0,
          tail: {
            x: 180,                 // Tail anchor point
            y: 180,
            enabled: true
          },
          text: "Hello!",
          textStyle: {
            fontFamily: "Bangers",
            fontSize: 24,
            fill: "#000000",
            align: "center",
            verticalAlign: "middle"
          },
          bubbleStyle: {
            fill: "#ffffff",
            stroke: "#000000",
            strokeWidth: 2
          },
          locked: false,
          zIndex: 2
        },
        {
          type: "effect",
          id: "elem-3",
          effectType: "decal",      // decal or actionText
          effectId: "bam-01",       // Preset decal ID
          panelId: null,
          x: 300,
          y: 200,
          width: 100,
          height: 80,
          rotation: -15,
          opacity: 1,
          locked: false,
          zIndex: 3
        },
        {
          type: "effect",
          id: "elem-4",
          effectType: "actionText",
          text: "POW!",
          textStyle: {
            fontFamily: "Bangers",
            fontSize: 48,
            fill: "#ff0000",
            stroke: "#000000",
            strokeWidth: 3,
            rotation: 10,
            shadow: {
              color: "#000000",
              blur: 4,
              offsetX: 2,
              offsetY: 2
            }
          },
          panelId: null,
          x: 400,
          y: 300,
          locked: false,
          zIndex: 4
        }
      ]
    }
  ],
  history: {
    currentStep: 0,
    maxSteps: 50,
    steps: []  // Managed by zundo
  }
}
```

---

## 5. Feature Details

### 5.1 Image Management

**Upload Flow:**
1. User selects image(s) from file picker
2. Client converts to WebP (80-85% quality) using Canvas API
3. Generate hash (SHA-256) for deduplication
4. If hash exists, reuse existing asset
5. Store in `project.assets.images` array
6. Add to image gallery UI

**Image Manipulation:**
- **Resize:** Drag corner handles, hold Shift for aspect ratio lock
- **Rotate:** Drag rotation handle (appears on hover)
- **Flip:** Context menu options (Flip Horizontal/Vertical)
- **Crop:** Non-destructive using Konva's `cropX`, `cropY`, `cropWidth`, `cropHeight`
- **Border:** Right panel controls for width and color
- **Opacity:** Slider in right panel (0-100%)

**Performance Optimization:**
- Limit image max width to 1920px
- Use Konva's image caching
- Lazy load images not on current page
- Warn at 300MB project size

### 5.2 Panel System (Clipping Groups)

**Concept:** Each panel is a Konva `Group` with a `clipFunc` that masks child elements.

**Implementation:**
```javascript
<Group
  clipFunc={(ctx) => {
    ctx.rect(0, 0, panel.width, panel.height);
  }}
>
  {/* Images inside panel are automatically clipped */}
  <Image ... />
  <Image ... />
</Group>
```

**Preset Layouts:**
- 2x2 Grid (4 equal panels)
- 3-Panel Horizontal
- Manga Style (varied sizes)
- Custom (user creates manually)

**Panel Features:**
- Drag to move entire panel
- Resize from edges/corners
- Adjust gutter (spacing between panels)
- Panel border independent of image borders
- Can be deleted (converts child images to base layer)

**Base Layer:**
Images with `panelId: null` render on base layer (not clipped). Useful for background images or unpaneled comics.

### 5.3 Speech Bubbles

**Preset Shapes:**
- **Oval:** Classic round bubble
- **Rectangle:** For narration boxes
- **Cloud:** For thoughts
- **Shout/Burst:** For yelling/sound effects

**Tail System:**
- Tail is a separate line/path connected to bubble
- User can drag tail anchor point
- Automatically adjusts to keep connected to bubble

**Text Editing:**
- Double-click to edit text inline
- Font selection from loaded Google Fonts
- Size, color, alignment controls
- Auto-shrink text if overflow (optional)

**Comic Fonts to Bundle:**
- Bangers
- Comic Neue
- Komika Axis
- Permanent Marker

### 5.4 Effects & Decals

**Decal Library:**
Pre-made SVG assets for common comic effects:
- Bam!, Pow!, Zap!, Boom!, Wham!
- Impact stars, speed lines, dust clouds
- Stored as SVG paths in code or JSON

**Action Text Tool:**
Custom text with comic styling:
- Outline/stroke (adjustable width)
- Drop shadow
- Rotation/skew
- Gradient fills (future)

**Rendering:**
Both types use Konva's `Path` or `Text` components with custom styling.

### 5.5 Animation Support

**Display (Phase 1):**
- Use HTML `<img>` elements positioned absolutely over canvas
- Sync position with Konva element transforms
- Animations play naturally in browser

**Export Options:**

| Export Type | Animation | Implementation |
|-------------|-----------|----------------|
| **Quick PNG** | ❌ Static | Konva `toDataURL()` captures single frame |
| **High-Res PNG** | ❌ Static | Render at 2x-4x scale |
| **Quick WebP** | ❌ Static | Convert PNG to WebP |
| **HTML Package** | ✅ Animated | Export HTML + assets folder with viewer |
| **Animated WebP** | ✅ Animated | Use ffmpeg.wasm to encode (Phase 2) |

**HTML Package Structure:**
```
my-comic-export/
├── index.html          # Simple viewer with navigation
├── viewer.css          # Styling
├── viewer.js           # Page navigation logic
├── pages/
│   ├── page-1.html     # Each page as HTML
│   └── ...
└── assets/
    ├── img-1.webp      # Static images
    ├── animated-1.webp # Animated images (original)
    └── ...
```

---

## 6. Canvas Controls & Interactions

### Zoom & Pan

| Input | Action |
|-------|--------|
| **Mouse Wheel** | Zoom in/out (center on cursor) |
| **Ctrl + Mouse Wheel** | Faster zoom |
| **Space + Drag** | Pan canvas |
| **Middle Mouse Drag** | Pan canvas |
| **Fit to Screen** | Button to reset zoom and center |
| **Zoom to 100%** | Button to view actual size |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo |
| **Ctrl+Shift+Z** | Redo |
| **Delete / Backspace** | Delete selected element(s) |
| **Arrow Keys** | Nudge selected element 1px |
| **Shift+Arrow** | Nudge 10px |
| **Ctrl+C** | Copy selected |
| **Ctrl+V** | Paste |
| **Ctrl+D** | Duplicate |
| **Ctrl+A** | Select all on page |
| **Escape** | Deselect all |
| **Space** | Temporarily switch to pan mode |

### Selection & Transform

- **Click** — Select single element
- **Shift+Click** — Add to selection (multi-select)
- **Drag** — Move selected element(s)
- **Corner Handles** — Resize (hold Shift for aspect ratio)
- **Rotation Handle** — Rotate around center
- **Double-Click** — Enter edit mode (for text/bubbles)

---

## 7. UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Header (Title, Save, Export)                           │
├──────┬──────────────────────────────────────────────────┬───────┤
│      │                                                  │       │
│ Page │                                                  │ Props │
│ List │              Canvas Workspace                    │ Panel │
│      │                                                  │       │
│      │   ┌────────────────────────────────────┐        │       │
│  [1] │   │                                    │        │ Tools │
│  [2] │   │                                    │        │  ┌─┐  │
│  [3] │   │         Comic Page                 │        │  └─┘  │
│      │   │                                    │        │       │
│  +   │   │                                    │        │ Image │
│      │   │                                    │        │ [img] │
│      │   └────────────────────────────────────┘        │ [img] │
│      │                                                  │ [img] │
│      │   Zoom: [Fit] [100%] [─────●─────] 150%        │  ...  │
└──────┴──────────────────────────────────────────────────┴───────┘
```

### Left Sidebar: Page List
- Vertical thumbnails of all pages
- Current page highlighted
- "+" button to add page
- Drag to reorder

### Center: Canvas Workspace
- Konva Stage with white page on dark background
- Zoom/pan controls at bottom
- Grid/guides (optional, toggled)

### Right Sidebar: Properties Panel
**Top Section:** Tool palette
- Select, Panel, Image, Bubble, Effect, Text

**Middle Section:** Image Gallery
- All project images
- Toggle: "Only this page"
- Drag image to canvas

**Bottom Section:** Element Properties
- Appears when element selected
- Position (X, Y), Size (W, H), Rotation
- Element-specific controls (border, crop, etc.)

---

## 8. Performance Considerations

### Optimization Strategies

1. **Image Caching:** Use Konva's built-in image caching
2. **Lazy Loading:** Only load images for current page + adjacent pages
3. **Debounce Canvas Updates:** Batch rapid changes (e.g., during drag)
4. **Virtual Scrolling:** For projects with 100+ pages
5. **WebP Compression:** Reduce memory footprint (80-85% quality)
6. **Limit Undo Steps:** Cap at 50 to prevent memory issues

### Memory Management

- Warn user at 300MB project size
- Require file system save at 500MB
- Offer to optimize images (reduce resolution)

---

## 9. Export Specifications

### PNG Export
- **Quality:** Maximum (no compression)
- **Resolution:** Configurable (1x, 2x, 4x for print)
- **Format:** 24-bit RGB PNG

### WebP Export
- **Quality:** 80-85% (balances size/quality)
- **Resolution:** Same as PNG
- **Format:** WebP (lossy)

### ZIP Package
- Each page as separate image
- Filename format: `page-001.png`, `page-002.png`, etc.
- Include metadata.json with project info

### HTML Package (Future)
- Responsive viewer with navigation
- Assets folder with images
- Works offline (self-contained)
- Optional: Animated image support

---

## 10. Performance Optimization Strategy

### Overview

Performance is critical for a smooth editing experience. This section documents potential bottlenecks and their solutions, established before implementation to avoid architectural mistakes.

### 10.1 Zustand State Bloat

**Problem:** Storing large binary data (images) in Zustand causes massive serialization overhead on every state change.

**Solution: Reference-Based Architecture**

```javascript
// ❌ BAD: Storing blobs in Zustand
const useProjectStore = create((set) => ({
  project: {
    assets: {
      images: [
        { id: 'img-1', blob: <5MB Blob>, name: 'hero.webp' }  // Huge!
      ]
    }
  }
}))

// ✅ GOOD: Reference-based architecture
const useProjectStore = create((set) => ({
  project: {
    assets: {
      imageIds: ['img-1', 'img-2']  // Just IDs
    },
    pages: [
      {
        elements: [
          { type: 'image', assetId: 'img-1', x: 50, y: 50 }  // Reference only
        ]
      }
    ]
  }
}))

// Images stored separately in IndexedDB
// Cached in memory using Map for fast access
const imageCache = new Map()  // id -> HTMLImageElement
```

**Key Principles:**
- Store only lightweight metadata in Zustand
- Heavy data (blobs, decoded images) live in IndexedDB + memory cache
- Use references (IDs) instead of embedding data
- Lazy load images only when needed

### 10.2 Canvas Re-render Cascades

**Problem:** Changing one element causes entire canvas to re-render with React's reconciliation.

**Solution: Zustand Slices + React.memo**

```javascript
// ❌ BAD: Monolithic state subscription
const { project } = useProjectStore()
// Every element re-renders on any change

// ✅ GOOD: Granular selectors
const currentPage = useProjectStore(state => 
  state.project.pages[state.currentPageIndex]
)

// Even better: Per-element subscriptions
const useElement = (elementId) => useProjectStore(
  state => state.project.pages[state.currentPageIndex]
    .elements.find(el => el.id === elementId)
)

// Memoize individual Konva components
const ImageElement = React.memo(({ element }) => {
  const image = useImage(element.assetId)
  
  return <Image image={image} x={element.x} y={element.y} />
}, (prev, next) => {
  // Only re-render if this element changed
  return prev.element.x === next.element.x &&
         prev.element.y === next.element.y &&
         prev.element.rotation === next.element.rotation
})
```

### 10.3 Undo/Redo History Explosion

**Problem:** Full state snapshots in history consume excessive memory (50 steps × 5MB = 250MB).

**Solution: Diff-Based History with Limits**

```javascript
import { temporal } from 'zundo'

export const useProjectStore = create(
  temporal(
    (set) => ({ /* state */ }),
    {
      limit: 50,  // Max undo steps
      equality: (past, current) => {
        // Reduce unnecessary snapshots
        return JSON.stringify(past) === JSON.stringify(current)
      }
    }
  )
)
```

**Alternative: Action-Based Undo**
Store actions instead of state snapshots:
```javascript
undoStack: [
  { type: 'MOVE', id: 'elem-1', from: {x:50,y:50}, to: {x:100,y:100} },
  { type: 'RESIZE', id: 'elem-2', from: {w:100}, to: {w:200} }
]
// Replay backward to undo, forward to redo
```

### 10.4 Drag Performance (60fps Target)

**Problem:** Updating Zustand on every `mousemove` (60Hz) is too expensive.

**Solution: Local State During Interaction + Batch Commit**

```javascript
const ImageElement = ({ element }) => {
  const [dragPos, setDragPos] = useState(null)  // Local React state
  const updateElement = useProjectStore(state => state.updateElement)
  
  return (
    <Image
      draggable
      x={dragPos?.x ?? element.x}  // Use local state during drag
      y={dragPos?.y ?? element.y}
      
      onDragMove={(e) => {
        // Update local state only (no Zustand writes)
        setDragPos({ x: e.target.x(), y: e.target.y() })
      }}
      
      onDragEnd={(e) => {
        // Commit to Zustand once at end
        updateElement(element.id, {
          x: e.target.x(),
          y: e.target.y()
        })
        setDragPos(null)
      }}
    />
  )
}
```

**Result:** Smooth 60fps dragging, single undo step per drag operation.

### 10.5 IndexedDB Write Throttling

**Problem:** Auto-saving to IndexedDB on every change causes constant I/O and blocks UI.

**Solution: Debounced Writes**

```javascript
import { debounce } from 'lodash-es'

const useProjectStore = create((set, get) => ({
  updateElement: (id, changes) => {
    set(state => {
      const newState = { /* updated */ }
      
      // Update state immediately for UI responsiveness
      // But debounce the IndexedDB write
      debouncedSave(newState)
      
      return newState
    })
  }
}))

// Save to IndexedDB at most once per second
const debouncedSave = debounce((state) => {
  db.projects.put(state)
}, 1000)
```

### 10.6 Image Loading Bottleneck

**Problem:** Loading 50 images simultaneously freezes UI during page switch.

**Solution: Lazy Loading with Prioritization**

```javascript
const useImage = (assetId) => {
  const [image, setImage] = useState(null)
  const isVisible = useIsElementVisible(assetId)  // In viewport?
  
  useEffect(() => {
    const load = async () => {
      // Check memory cache first
      if (imageCache.has(assetId)) {
        setImage(imageCache.get(assetId))
        return
      }
      
      // Load from IndexedDB
      const blob = await db.images.get(assetId)
      const img = await createImageBitmap(blob)  // Faster than new Image()
      
      imageCache.set(assetId, img)
      setImage(img)
    }
    
    if (isVisible) {
      load()  // High priority
    } else {
      requestIdleCallback(load)  // Low priority (load when idle)
    }
  }, [assetId, isVisible])
  
  return image
}
```

**Strategies:**
- Prioritize visible elements
- Use `createImageBitmap()` instead of `new Image()` (2-3x faster)
- Preload adjacent pages in background
- Limit concurrent loads (max 5 at a time)

### 10.7 Memory Leaks from Canvas Elements

**Problem:** Konva nodes and cached images aren't garbage collected if references remain.

**Solution: Proper Cleanup**

```javascript
useEffect(() => {
  const layer = new Konva.Layer()
  stage.add(layer)
  
  return () => {
    // Clean up on unmount
    layer.destroy()
    layer.remove()
    
    // Clear image cache for old pages
    imageCache.clear()
  }
}, [])
```

---

## 11. Recommended Data Architecture

Based on performance analysis, use a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1: Zustand Store (Lightweight metadata only)      │
│  - Project settings (width, height, colors)             │
│  - Page structure (layout, panel definitions)           │
│  - Element transforms (x, y, rotation, scale)           │
│  - UI state (selection, tool, zoom level)               │
│  Size: < 1MB even for large projects                    │
└─────────────────────────────────────────────────────────┘
                          ↕ (References)
┌─────────────────────────────────────────────────────────┐
│  TIER 2: IndexedDB (Dexie.js) - Heavy data storage      │
│  - Image blobs (WebP compressed)                        │
│  - Full project snapshots (for recovery)                │
│  - Auto-save with 1s debounce throttle                  │
│  Size: Limited by browser (typically 50% of disk)       │
└─────────────────────────────────────────────────────────┘
                          ↕ (Lazy load)
┌─────────────────────────────────────────────────────────┐
│  TIER 3: Memory Cache (Map/WeakMap) - Hot data          │
│  - Decoded images (HTMLImageElement/ImageBitmap)        │
│  - Current page elements only                           │
│  - Recently used assets (LRU eviction)                  │
│  Size: < 500MB target for 50 images                     │
└─────────────────────────────────────────────────────────┘
```

### Store Structure

```javascript
// src/stores/useProjectStore.js
export const useProjectStore = create((set, get) => ({
  // Lightweight state
  projectId: null,
  currentPageIndex: 0,
  selectedElementIds: [],
  zoom: 1,
  tool: 'select',
  
  project: {
    settings: { width: 800, height: 1200, backgroundColor: '#ffffff' },
    assets: {
      imageIds: []  // ← Just IDs, not blobs
    },
    pages: [
      {
        id: 'page-1',
        elements: [
          { type: 'image', id: 'elem-1', assetId: 'img-1', x: 50, y: 50 }
        ]
      }
    ]
  },
  
  // Actions with built-in optimizations
  updateElement: (id, changes) => { /* debounced */ },
  addImage: async (file) => { /* stores to IndexedDB separately */ }
}))

// src/stores/useImageCache.js (separate concern)
export const useImageCache = create((set, get) => ({
  cache: new Map(),
  maxSize: 100,  // Max cached images
  
  getImage: async (assetId) => { /* lazy load */ },
  preloadPage: (pageIndex) => { /* prefetch next page */ },
  evict: () => { /* LRU eviction when maxSize reached */ }
}))
```

---

## 12. Performance Budget

Set measurable targets and monitor during development:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Canvas FPS** | 60fps | Chrome DevTools Performance tab |
| **State Update** | < 16ms | React DevTools Profiler |
| **Page Switch** | < 200ms | `performance.now()` timing |
| **Undo/Redo** | < 50ms | Custom timing in action |
| **Image Upload** | < 500ms | From file select to canvas |
| **Memory Usage** | < 500MB | Chrome Task Manager |
| **IndexedDB Write** | < 100ms | Performance API |
| **Initial Load** | < 2s | Lighthouse metric |

### Monitoring Plan

Add performance logging in development:

```javascript
// Enable in development only
if (import.meta.env.DEV) {
  const measureAction = (name, fn) => {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    
    if (duration > 16) {  // Warn if slower than 1 frame
      console.warn(`⚠️ ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  }
}
```

---

## 13. Testing Strategy

### Unit Tests
- Image upload and conversion
- Panel clipping calculations
- Undo/redo state management
- Export functions

### Integration Tests
- Canvas interaction (drag, resize, rotate)
- Multi-element selection
- Page navigation
- File system save/load

### Performance Tests
- Load time with 50+ images
- Canvas interaction smoothness (60fps target)
- Memory usage with large projects

### Browser Compatibility
- Chrome/Edge (primary)
- Safari (File System Access API support)
- Firefox (fallback to download/upload)

---

## 11. Known Limitations & Future Improvements

### Current Limitations
- No collaborative editing (single user)
- Limited animation support (display only)
- No vector drawing tools (shapes are preset)
- Text formatting limited (no rich text)

### Future Enhancements
- **Layers Panel:** Explicit z-index control, visibility toggles
- **Smart Guides:** Snap-to-align when dragging
- **Templates:** Pre-made page layouts
- **Filters:** Apply effects to images (grayscale, sepia, etc.)
- **Vector Tools:** Draw custom shapes/panels
- **Collaboration:** Real-time co-editing (Phase 3+)

---

**End of Canvas Implementation Specification**
