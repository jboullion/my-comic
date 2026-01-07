# Comic Book Maker - Claude Code Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content.

**Current State:** Phase 8 - Multi-select support, rulers, grid overlay, snap-to-grid, and project/page settings.

## Tech Stack

- **React 19** with functional components and hooks
- **Vite 7** for dev/build (`npm run dev` at http://localhost:5173)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **Zustand** + **Zundo** for state management with undo/redo
- **html-to-image** for canvas capture/export
- **Dexie.js** for IndexedDB storage
- **Google Fonts** for text elements

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

## Coding Conventions

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
