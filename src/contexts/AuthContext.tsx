import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  user_id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  directory_opt_in: boolean
  show_email: boolean
  show_phone: boolean
  show_unit: boolean
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profileData: {
    unitNumber: string
    firstName: string
    lastName: string
    phone?: string
    directoryOptIn: boolean
    showEmail: boolean
    showPhone: boolean
    showUnit: boolean
  }) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (
    email: string,
    password: string,
    profileData: {
      unitNumber: string
      firstName: string
      lastName: string
      phone?: string
      directoryOptIn: boolean
      showEmail: boolean
      showPhone: boolean
      showUnit: boolean
    }
  ) => {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // If no session (email confirmation required), sign in the user manually
    if (!authData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
    }

    // Then create the profile
    const { error: profileError } = await supabase
      .from('owner_profiles')
      .insert({
        user_id: authData.user.id,
        unit_number: profileData.unitNumber,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: email,
        phone: profileData.phone,
        directory_opt_in: profileData.directoryOptIn,
        show_email: profileData.showEmail,
        show_phone: profileData.showPhone,
        show_unit: profileData.showUnit,
      })

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.signOut()
      throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('owner_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}