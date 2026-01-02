# Comic Book Maker - AI Coding Instructions

## Project Overview

A Progressive Web App (PWA) for creating digital comic books. Client-centric architecture where all creative work happens in the browser—no backend storage for user content (user data sovereignty).

**Current State:** Early MVP phase with landing page and PWA shell. Core editor features are not yet implemented.

## Tech Stack & Patterns

- **React 19** with functional components and hooks (no class components)
- **Vite 7** for dev/build with HMR at `http://localhost:5173`
- **React Router 7** for client-side routing (`BrowserRouter` in [src/main.jsx](src/main.jsx))
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (import in [src/index.css](src/index.css))
- **vite-plugin-pwa** with Workbox for offline support, configured in [vite.config.js](vite.config.js)
- **Konva** via `react-konva` for canvas rendering (preferred over Fabric.js for React integration)
- **Zustand** for global state (comic project data, UI state) with persistence middleware

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Architecture Decisions

### Storage Strategy (Planned)
Per the [tech spec](docs/Comic_Book_Maker_Tech_Spec.md):
- **IndexedDB** (via Dexie.js) for auto-save and working projects
- **File System Access API** for explicit saves as `.cbproject` files (JSON format)
- **Fallback:** Traditional download/upload for Firefox

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
- **AppLayout** ([src/layouts/AppLayout.jsx](src/layouts/AppLayout.jsx)): Protected pages for logged-in users (Dashboard, Project, Profile)
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

### ESLint Rules
- Configured for React hooks and fast refresh
- Unused vars starting with uppercase are ignored (`varsIgnorePattern: '^[A-Z_]'`)

## PWA Configuration

Icons must be generated for multiple sizes. The [generate-icons.js](generate-icons.js) script uses Sharp:
- `pwa-192x192.png`, `pwa-512x512.png` — main PWA icons
- `apple-touch-icon.png` — iOS home screen
- `favicon.ico` — browser tab

PWA manifest configured in [vite.config.js](vite.config.js) with `registerType: 'autoUpdate'`.

## Planned Features (Roadmap Priority)

When implementing new features, refer to Phase 1 in the tech spec:
1. IndexedDB setup with Dexie.js wrapper
2. File System Access API with fallback
3. Canvas workspace (Konva.js via `react-konva`)
4. Panel manipulation, image upload, text tools
5. Export as PNG/JPG

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
| [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) | Supabase auth provider and useAuth hook |
| [src/layouts/AppLayout.jsx](src/layouts/AppLayout.jsx) | Protected layout for logged-in users |
| [docs/Comic_Book_Maker_Tech_Spec.md](docs/Comic_Book_Maker_Tech_Spec.md) | Full technical specification |
