import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
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
  session: Session | null
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
  resetPassword: (email: string) => Promise<void>
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching profile:', error)
        }
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
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
    // Validate unit number exists in owners_master
    const { data: ownerData, error: ownerError } = await supabase
      .from('owners_master')
      .select('unit_number')
      .eq('unit_number', profileData.unitNumber)
      .single()

    if (ownerError || !ownerData) {
      throw new Error('Invalid unit number. Please contact the HOA office.')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // Create owner profile
    const { error: profileError } = await supabase
      .from('owner_profiles')
      .insert({
        user_id: authData.user.id,
        unit_number: profileData.unitNumber,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: email.toLowerCase().trim(),
        phone: profileData.phone,
        directory_opt_in: profileData.directoryOptIn,
        show_email: profileData.showEmail,
        show_phone: profileData.showPhone,
        show_unit: profileData.showUnit,
      })

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.signOut()
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    return authData
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${window.location.origin}/dashboard`
      }
    )

    if (error) {
      throw new Error(error.message)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      throw new Error('No user logged in')
    }

    const { data, error } = await supabase
      .from('owner_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }
    
    setProfile(data)
    return data
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
