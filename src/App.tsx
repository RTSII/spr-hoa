import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-load all pages for better initial load performance
const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminDashboardMagicBento = lazy(() => import('./pages/AdminDashboardMagicBento'))
const AdminDashboardWithMessaging = lazy(() => import('./pages/AdminDashboardWithMessaging'))
const DevPortal = lazy(() => import('./pages/DevPortal'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Register = lazy(() => import('./pages/Register'))
const InviteRequest = lazy(() => import('./pages/InviteRequest'))
const Calendar = lazy(() => import('./pages/Calendar'))
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'))
const News = lazy(() => import('./pages/News'))
const Forms = lazy(() => import('./pages/Forms'))
const Photos = lazy(() => import('./pages/Photos'))
const Directory = lazy(() => import('./pages/Directory'))
const Profile = lazy(() => import('./pages/Profile'))
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'))

function App() {
  console.log('App rendering with full authentication and routing...')

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-900">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              }
            >
              <Routes>
              {/* Public routes */}
                <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/invite-request" element={<InviteRequest />} />

              {/* Admin routes - admin only */}
              {/* Default admin now uses Magic Bento UI */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardMagicBento />
                    </AdminRoute>
                  }
                />
              {/* Legacy admin (floating cards) preserved here */}
              <Route
                path="/admin/legacy"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/magic-bento"
                element={
                  <AdminRoute>
                    <AdminDashboardMagicBento />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/messaging"
                element={
                  <AdminRoute>
                    <AdminDashboardWithMessaging />
                  </AdminRoute>
                }
              />
              <Route
                path="/dev-portal"
                element={
                  <AdminRoute>
                    <DevPortal />
                  </AdminRoute>
                }
              />

              {/* Regular user protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news"
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms"
                element={
                  <ProtectedRoute>
                    <Forms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/photos"
                element={
                  <ProtectedRoute>
                    <Photos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/directory"
                element={
                  <ProtectedRoute>
                    <Directory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
