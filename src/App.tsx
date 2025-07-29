import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import DevPortal from '@/pages/DevPortal'
import Dashboard from '@/pages/Dashboard'
import Calendar from '@/pages/Calendar'
import CommunityFeed from '@/pages/CommunityFeed'
import News from '@/pages/News'
import Forms from '@/pages/Forms'
import Photos from '@/pages/Photos'
import Directory from '@/pages/Directory'
import Profile from '@/pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dev-portal" element={<DevPortal />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="community" element={<CommunityFeed />} />
              <Route path="news" element={<News />} />
              <Route path="forms" element={<Forms />} />
              <Route path="photos" element={<Photos />} />
              <Route path="directory" element={<Directory />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App