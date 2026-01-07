import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectPage from './pages/ProjectPage'
import ProjectSettingsPage from './pages/ProjectSettingsPage'
import ProfilePage from './pages/ProfilePage'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import OfflineIndicator from './components/OfflineIndicator'

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

function App() {
  return (
    <>
      {/* PWA Components */}
      <PWAUpdatePrompt />
      <OfflineIndicator />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />

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
        
        {/* Protected Routes (App Area) */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/project/:projectId/settings" element={<ProjectSettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
