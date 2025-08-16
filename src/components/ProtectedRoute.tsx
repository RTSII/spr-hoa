import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()

  console.log('ProtectedRoute - user:', user, 'loading:', loading, 'isAdmin:', isAdmin)

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('ProtectedRoute - showing loading screen')
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400"></div>
          <p className="text-lg text-white">Authenticating...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If authenticated, render the protected content
  console.log('ProtectedRoute - user authenticated, rendering children')
  return <>{children}</>
}

export default ProtectedRoute
