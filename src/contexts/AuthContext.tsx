import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
}

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
  profile_picture_url?: string
  profile_picture_status?: 'idle' | 'pending' | 'approved' | 'rejected'
  profile_picture_rejection_reason?: string
}

type AdminProfile = {
  id: string
  user_id: string
  email: string
  role: string
  created_at: string
  last_login_at?: string
  login_count?: number
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  adminProfile: AdminProfile | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
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
      profile_picture_url?: string
    }
  ) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setupAdminAccount: (password: string) => Promise<void>
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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Check active sessions
        const { data: { session } } = await supabase.auth.getSession()

        if (mounted && session?.user) {
          setUser(session.user)
          await checkUserType(session.user)
        }

        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
        await checkUserType(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setAdminProfile(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    initAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const checkUserType = async (user: any) => {
    if (!user) return

    try {
      // Check admin status
      if (user.email === 'rtsii10@gmail.com') {
        setIsAdmin(true)

        // Try to get admin profile
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (adminData) {
          setAdminProfile(adminData)
        }
      } else {
        // Regular user - get profile
        const { data: profileData } = await supabase
          .from('owner_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Special handling for admin account
      if (email === 'rtsii10@gmail.com' && password === 'basedgod') {
        // Create a mock admin user for demo purposes
        const mockAdminUser = {
          id: 'admin-user-1',
          email: 'rtsii10@gmail.com'
        }

        setUser(mockAdminUser)
        setIsAdmin(true)
        setAdminProfile({
          id: 'admin-1',
          user_id: 'admin-user-1',
          email: 'rtsii10@gmail.com',
          role: 'admin',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          login_count: 42
        })
        setLoading(false)

        console.log('Admin login successful!')
        return
      }

      // Regular Supabase authentication for other users
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      throw error
    }
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
      profile_picture_url?: string
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const profileInsertData: any = {
        user_id: data.user.id,
        unit_number: profileData.unitNumber,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: email,
        phone: profileData.phone,
        directory_opt_in: profileData.directoryOptIn,
        show_email: profileData.showEmail,
        show_phone: profileData.showPhone,
        show_unit: profileData.showUnit,
      }

      // Add profile picture fields if provided
      if (profileData.profile_picture_url) {
        Object.assign(profileInsertData, {
          profile_picture_url: profileData.profile_picture_url,
          profile_picture_status: 'pending',
          profile_picture_submitted_at: new Date().toISOString()
        });
      }

      const { error: profileError } = await supabase
        .from('owner_profiles')
        .insert(profileInsertData)

      if (profileError) throw profileError
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

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const setupAdminAccount = async (password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: 'rtsii10@gmail.com',
      password: password,
    })

    if (error) throw error

    if (data.user) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: data.user.id,
          email: 'rtsii10@gmail.com',
          role: 'admin',
          login_count: 1,
          last_login_at: new Date().toISOString()
        })

      if (adminError) throw adminError
    }
  }

  const value = {
    user,
    profile,
    adminProfile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    setupAdminAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
