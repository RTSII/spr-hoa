import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Dynamic storage adapter to support "Remember Me" behavior
// If REMEMBER_ME_KEY is set to 'local', use localStorage; otherwise use sessionStorage
const REMEMBER_ME_KEY = 'spr_remember_me'

const dynamicStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      const mode = window.localStorage.getItem(REMEMBER_ME_KEY)
      const store = mode === 'local' ? window.localStorage : window.sessionStorage
      return store.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return
      const mode = window.localStorage.getItem(REMEMBER_ME_KEY)
      const store = mode === 'local' ? window.localStorage : window.sessionStorage
      store.setItem(key, value)
    } catch {
      // no-op
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return
      // Remove from both to be safe when switching modes
      window.localStorage.removeItem(key)
      window.sessionStorage.removeItem(key)
    } catch {
      // no-op
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: dynamicStorage as any,
  },
})

// Types for our database
export interface OwnerMaster {
  id: string
  unit_number: string
  hoa_account_number: string
  is_verified: boolean
  created_at: string
}

export interface OwnerProfile {
  id: string
  user_id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  directory_opt_in: boolean
  created_at: string
  updated_at: string
}
