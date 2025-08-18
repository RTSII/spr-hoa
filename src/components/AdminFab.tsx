import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminFab() {
  const { isAdmin } = useAuth()
  const location = useLocation()
  if (!isAdmin) return null

  // Do not show the FAB on any admin pages
  if (location.pathname.startsWith('/admin')) return null

  const isAnalytics = location.pathname.startsWith('/admin/analytics')

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="rounded-full bg-black/40 p-2 backdrop-blur">
        <Link
          to={isAnalytics ? '/admin' : '/admin/analytics'}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--spr-blue)] text-white shadow-lg transition hover:brightness-110"
          title={isAnalytics ? 'Back to Admin' : 'Open Admin Analytics'}
        >
          {isAnalytics ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M19.5 12a.75.75 0 0 1-.75.75H7.56l3.72 3.72a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 1 1 1.06 1.06L7.56 11.25h11.19a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M3 3.75A.75.75 0 0 1 3.75 3h2.5a.75.75 0 0 1 .75.75v16.5a.75.75 0 0 1-.75.75h-2.5A.75.75 0 0 1 3 20.25V3.75Z" />
              <path d="M9 8.25A.75.75 0 0 1 9.75 7.5h2.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-12Z" />
              <path d="M15 12.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-7.5Z" />
            </svg>
          )}
        </Link>
      </div>
    </div>
  )
}
