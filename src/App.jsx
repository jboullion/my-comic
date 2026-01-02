import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FileApiTest from './pages/FileApiTest'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import DocsPage from './pages/DocsPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectPage from './pages/ProjectPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/test/file-api" element={<FileApiTest />} />
      
      {/* Protected Routes (App Area) */}
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/project/:projectId" element={<ProjectPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App
