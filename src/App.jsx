import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FileApiTest from './pages/FileApiTest'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import DocsPage from './pages/DocsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/test/file-api" element={<FileApiTest />} />
    </Routes>
  )
}

export default App
