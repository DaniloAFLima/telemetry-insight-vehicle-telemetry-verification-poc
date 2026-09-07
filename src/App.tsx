import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'

// Pages
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import UploadPage from '@/pages/Upload'
import AnalisesList from '@/pages/AnalisesList'
import AnaliseDetail from '@/pages/AnaliseDetail'
import AnaliseCompare from '@/pages/AnaliseCompare'
import RelatoriosPage from '@/pages/Relatorios'
import PublicDemo from '@/pages/PublicDemo'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Portfolio Live Demo Landing Page */}
          <Route path="/demo" element={<PublicDemo />} />
          <Route path="/public" element={<Navigate to="/demo" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analises" element={<AnalisesList />} />
            <Route path="/analises/compare" element={<AnaliseCompare />} />
            <Route path="/analises/:id" element={<AnaliseDetail />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />{' '}
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}
