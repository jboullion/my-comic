import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FileApiTest from './pages/FileApiTest'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/test/file-api" element={<FileApiTest />} />
    </Routes>
  )
}

export default App
