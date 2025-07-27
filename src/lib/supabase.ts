import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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