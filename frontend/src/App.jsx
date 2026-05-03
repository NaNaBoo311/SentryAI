import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import NotificationsPage from './pages/NotificationsPage'
import FireAlarmPage from './pages/FireAlarmPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/fire-alarm" element={<FireAlarmPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-sentry-900 !text-sentry-200 !border !border-sentry-700/40 !shadow-lg',
          duration: 3000,
        }}
      />
    </AuthProvider>
  )
}