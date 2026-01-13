import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import PricingPage from './pages/PricingPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import SeriesListPage from './pages/SeriesListPage'
import SeriesPage from './pages/SeriesPage'
import SeriesSettingsPage from './pages/SeriesSettingsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectPage from './pages/ProjectPage'
import ProjectSettingsPage from './pages/ProjectSettingsPage'
import ProfilePage from './pages/ProfilePage'
import CharactersPage from './pages/CharactersPage'
import NotFoundPage from './pages/NotFoundPage'
import OfflineIndicator from './components/OfflineIndicator'

// Redirect components for backward compatibility
function ProjectRedirect() {
  const { projectId } = useParams()
  return <Navigate to={`/app/project/${projectId}`} replace />
}

function ProjectSettingsRedirect() {
  const { projectId } = useParams()
  return <Navigate to={`/app/project/${projectId}/settings`} replace />
}

// Documentation pages
import DocsGettingStarted from './pages/docs/DocsGettingStarted'
import DocsImages from './pages/docs/DocsImages'
import DocsSpeechBubbles from './pages/docs/DocsSpeechBubbles'
import DocsText from './pages/docs/DocsText'
import DocsTextEffects from './pages/docs/DocsTextEffects'
import DocsProjectSettings from './pages/docs/DocsProjectSettings'
import DocsPageSettings from './pages/docs/DocsPageSettings'
import DocsCanvas from './pages/docs/DocsCanvas'
import DocsShortcuts from './pages/docs/DocsShortcuts'
import DocsExporting from './pages/docs/DocsExporting'
import DocsStorage from './pages/docs/DocsStorage'

function App() {
  return (
    <>
      <OfflineIndicator />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Documentation Routes */}
        <Route path="/docs" element={<DocsGettingStarted />} />
        <Route path="/docs/images" element={<DocsImages />} />
        <Route path="/docs/speech-bubbles" element={<DocsSpeechBubbles />} />
        <Route path="/docs/text" element={<DocsText />} />
        <Route path="/docs/text-effects" element={<DocsTextEffects />} />
        <Route path="/docs/project-settings" element={<DocsProjectSettings />} />
        <Route path="/docs/page-settings" element={<DocsPageSettings />} />
        <Route path="/docs/canvas" element={<DocsCanvas />} />
        <Route path="/docs/shortcuts" element={<DocsShortcuts />} />
        <Route path="/docs/exporting" element={<DocsExporting />} />
        <Route path="/docs/storage" element={<DocsStorage />} />

        {/* App Routes (Sidebar Layout) */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/series" element={<SeriesListPage />} />
        <Route path="/app/series/:seriesId" element={<SeriesPage />} />
        <Route path="/app/series/:seriesId/settings" element={<SeriesSettingsPage />} />
        <Route path="/app/projects" element={<ProjectsPage />} />
        <Route path="/app/characters" element={<CharactersPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />

        {/* Editor Routes (Minimal Layout) */}
        <Route path="/app/project/:projectId" element={<ProjectPage />} />
        <Route path="/app/project/:projectId/settings" element={<ProjectSettingsPage />} />

        {/* Backward Compatibility Redirects */}
        <Route path="/series" element={<Navigate to="/app/series" replace />} />
        <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
        <Route path="/characters" element={<Navigate to="/app/characters" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="/project/:projectId" element={<ProjectRedirect />} />
        <Route path="/project/:projectId/settings" element={<ProjectSettingsRedirect />} />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
