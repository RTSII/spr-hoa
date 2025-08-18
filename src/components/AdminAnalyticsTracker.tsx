import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { storeAdminPageView, storeAdminError } from '../lib/supermemory'

export default function AdminAnalyticsTracker() {
  const { isAdmin } = useAuth()
  const location = useLocation()

  // Page views
  useEffect(() => {
    if (!isAdmin) return
    const path = location.pathname + location.search
    storeAdminPageView({ path, title: document.title }).catch(() => {})
  }, [isAdmin, location.pathname, location.search])

  // Errors
  useEffect(() => {
    if (!isAdmin) return

    const onError = (event: ErrorEvent) => {
      storeAdminError({
        message: event.message || 'Unhandled error',
        stack: event.error?.stack,
        page: window.location.pathname,
      }).catch(() => {})
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = (event.reason && (event.reason.message || String(event.reason))) || 'Unhandled rejection'
      const stack = event.reason?.stack
      storeAdminError({ message: reason, stack, page: window.location.pathname }).catch(() => {})
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [isAdmin])

  return null
}
