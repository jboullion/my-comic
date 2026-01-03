# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

**Current State:** Phase 5 of canvas implementation. Full Konva.js editor with zoom, pan, undo/redo (Zundo), image/panel elements with advanced properties (rotation, opacity, borders, corner shapes), asset gallery with IndexedDB storage, and Z-order management via context menu and drag-and-drop layers panel.

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

### Image Handling (Planned)
- Convert to WebP (80-85% quality), max 1920px width
- Hash-based deduplication
- Warn at 300MB project size, require file save at 500MB

## Coding Conventions

### Component Structure
- Single component per file, default export
- Page components go in `src/pages/` (e.g., `HomePage.jsx`, `FileApiTest.jsx`)
- Layouts go in `src/layouts/` — wrap pages with consistent nav/footer
- Shared components go in `src/components/` (e.g., `PublicNav.jsx`)
- Inline sub-components OK for file-scoped helpers (see `FeatureCard` in [src/pages/HomePage.jsx](src/pages/HomePage.jsx))
- Use `useState`/`useEffect` hooks; Zustand for global/shared state
- Zustand stores go in `src/stores/` (e.g., `useProjectStore.js`)

### Layouts
- **PublicLayout** ([src/layouts/PublicLayout.jsx](src/layouts/PublicLayout.jsx)): Standard pages (Home, Privacy, Contact)
- **DocsLayout** ([src/layouts/DocsLayout.jsx](src/layouts/DocsLayout.jsx)): Documentation with sidebar navigation
- **AppLayout** ([src/layouts/AppLayout.jsx](src/layouts/AppLayout.jsx)): Protected pages for logged-in users (Projects, Project, Profile)
- Public layouts use **PublicNav** ([src/components/PublicNav.jsx](src/components/PublicNav.jsx)) for header
- App layouts use **AppNav** ([src/components/AppNav.jsx](src/components/AppNav.jsx)) with user menu

### Routing
- Routes defined in [src/App.jsx](src/App.jsx) using `<Routes>` and `<Route>`
- Use React Router's `<Link to="/path">` for navigation (not `<a href>`)
- Test pages under `/test/*` (e.g., `/test/file-api`)
- **Protected routes:** `/projects`, `/project/:projectId`, `/profile` — wrapped in `AppLayout` which redirects to `/login` if not authenticated
- **Auth flow:** Login → OAuth callback (`/auth/callback`) → Projects

### Styling
- Tailwind utility classes only (no CSS modules)
- Dark theme: `bg-slate-900`, `text-white`, accents with `indigo-500`
- Use `@import "tailwindcss"` in CSS files
- **Tailwind v4 hover fix:** Custom `@custom-variant hover (&:hover)` in [src/index.css](src/index.css) to override default media query restriction
- **Avoid transparency/opacity on backgrounds** — Use solid colors (`bg-slate-900` not `bg-slate-900/50`) to prevent GPU rendering artifacts (diagonal scratch lines)
- **Avoid `backdrop-blur`** — Can cause visual artifacts on some GPUs
- **Layout flex-shrink:** Use `flex-shrink-0` on fixed-width sidebars, `min-w-0` on flexible canvas areas

### User Menus
- Both **PublicNav** and **AppNav** use dropdown menus on user avatar click
- Dropdown includes: Install App (if available), Projects, Profile, Sign Out
- Click-outside-to-close backdrop pattern for dropdowns

### ESLint Rules
- Configured for React hooks and fast refresh
- Unused vars starting with uppercase are ignored (`varsIgnorePattern: '^[A-Z_]'`)

## PWA Configuration

**Service Worker Features:**
- **Auto-update** — New versions detected and prompt shown via `PWAUpdatePrompt`
- **Offline indicator** — Banner shows when connectivity lost/restored via `OfflineIndicator`
- **Install prompt** — "Install App" option in user dropdown when PWA installable
- **Dev mode enabled** — PWA works in development for testing (`devOptions.enabled: true`)

**Caching Strategy:**
- Static assets → Precached on install
- Google Fonts → CacheFirst (1 year)
- Supabase API → NetworkFirst (5 min cache, 10s timeout)
- Images → CacheFirst (30 days, max 100 entries)

Icons must be generated for multiple sizes. The [generate-icons.js](generate-icons.js) script uses Sharp:
- `pwa-192x192.png`, `pwa-512x512.png` — main PWA icons
- `apple-touch-icon.png` — iOS home screen
- `favicon.ico` — browser tab

PWA manifest configured in [vite.config.js](vite.config.js) with `registerType: 'autoUpdate'`.

## Planned Features (Roadmap Priority)

**Canvas Implementation (Phase 5 - In Progress):**
- ✅ Konva.js canvas with zoom, pan, undo/redo
- ✅ Image elements with rotation, opacity, borders, corner shapes
- ✅ Panel elements with custom corner geometries (bevel, notch, scoop, squircle)
- ✅ Asset gallery with IndexedDB storage and drag-and-drop
- ✅ Z-order management via right-click context menu
- ✅ Drag-and-drop layer reordering in layers panel
- 🔄 Panel clipping (images contained within panel boundaries)
- 🔄 Speech bubbles with editable text

When implementing new features, refer to the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md).

## Authentication (Supabase)

- **Provider:** Supabase Auth with Google and Discord OAuth
- **Setup:** Copy `.env.example` to `.env.local` and add Supabase credentials
- **Context:** `AuthProvider` wraps app in [src/main.jsx](src/main.jsx)
- **Hook:** Use `useAuth()` from [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)
- **Callback:** OAuth redirects to `/auth/callback` for token exchange

```jsx
// Example usage in components
const { user, loading, signInWithGoogle, signInWithDiscord, signOut } = useAuth()
```

**Supabase Dashboard Setup Required:**
1. Enable Google and Discord providers in Authentication → Providers
2. Add `http://localhost:5173/auth/callback` to redirect URLs
3. Configure OAuth credentials from Google Cloud Console and Discord Developer Portal

## Testing Strategy

- **Framework:** Vitest (Vite-native, fast) + React Testing Library
- **Run tests:** `npm test` (after setup)
- **Coverage:** Focus on critical paths—storage operations, export logic, project state
- **Canvas testing:** Mock `react-konva` components; test interaction handlers separately
- **PWA testing:** Manual verification for service worker and offline behavior

When adding features, include tests for:
- Zustand store actions and state transitions
- File format parsing/serialization (`.cbproject`)
- Image optimization utilities

## Key Files

| File | Purpose |
|------|---------|
| [vite.config.js](vite.config.js) | Vite + PWA + Tailwind configuration |
| [src/main.jsx](src/main.jsx) | Entry point with BrowserRouter |
| [src/App.jsx](src/App.jsx) | Route definitions |
| [src/pages/HomePage.jsx](src/pages/HomePage.jsx) | Landing page |
| [src/pages/ProjectsPage.jsx](src/pages/ProjectsPage.jsx) | Project list with cards, create/open/delete |
| [src/pages/ProjectPage.jsx](src/pages/ProjectPage.jsx) | Main editor workspace with three-panel layout (pages, canvas, properties) |
| [src/components/ComicCanvas.jsx](src/components/ComicCanvas.jsx) | Konva.js canvas with zoom, pan, element rendering, and context menu |
| [src/lib/db.js](src/lib/db.js) | Dexie.js IndexedDB wrapper with CRUD operations |
| [src/stores/useProjectStore.js](src/stores/useProjectStore.js) | Zustand store for project state management |
| [src/hooks/useImage.js](src/hooks/useImage.js) | Asset loading and caching hook |
| [src/components/NewProjectModal.jsx](src/components/NewProjectModal.jsx) | Modal for creating new projects |
| [src/components/PWAUpdatePrompt.jsx](src/components/PWAUpdatePrompt.jsx) | Service worker update notification |
| [src/components/OfflineIndicator.jsx](src/components/OfflineIndicator.jsx) | Online/offline status banner |
| [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) | Supabase auth provider and useAuth hook |
| [src/layouts/AppLayout.jsx](src/layouts/AppLayout.jsx) | Protected layout for logged-in users |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |
