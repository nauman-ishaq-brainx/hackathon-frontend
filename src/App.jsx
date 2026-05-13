import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import BriefAmbiguitiesPage from './pages/BriefAmbiguitiesPage.jsx'
import BriefCreatePage from './pages/BriefCreatePage.jsx'
import BriefTicketsPage from './pages/BriefTicketsPage.jsx'

function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hackathon Frontend</h1>
      <p>Vite + React is running.</p>
      <nav style={{ marginTop: '1rem' }}>
        <Link to="/briefs/create" style={{ color: '#2563eb' }}>
          Create client brief →
        </Link>
      </nav>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/briefs/create" element={<BriefCreatePage />} />
        <Route path="/briefs/:briefId/ambiguities" element={<BriefAmbiguitiesPage />} />
        <Route path="/briefs/:briefId/tickets" element={<BriefTicketsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
