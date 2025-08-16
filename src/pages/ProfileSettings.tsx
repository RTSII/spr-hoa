import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ProfilePictureUpload from '../components/ProfilePictureUpload'
import { storeProfileSettings, searchProfileSettings } from '../lib/supermemory'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string
  directory_opt_in: boolean
  show_email: boolean
  show_phone: boolean
  show_unit: boolean
  receive_alerts?: boolean
  profile_picture_url?: string
  profile_picture_status?: string
  unit_number?: string
}

const ProfileSettings: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    directory_opt_in: false,
    show_email: false,
    show_phone: false,
    show_unit: false,
    receive_alerts: false,
    profile_picture_url: '',
    profile_picture_status: 'idle',
  })
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      if (data) {
        setProfile({ ...data, receive_alerts: data.receive_alerts ?? false })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          directory_opt_in: profile.directory_opt_in,
          show_email: profile.show_email,
          show_phone: profile.show_phone,
          show_unit: profile.show_unit,
          receive_alerts: profile.receive_alerts,
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Store profile settings in Supermemory.ai
      try {
        await storeProfileSettings({
          userId: user.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          directoryOptIn: profile.directory_opt_in,
          showEmail: profile.show_email,
          showPhone: profile.show_phone,
          showUnit: profile.show_unit,
          receiveAlerts: profile.receive_alerts,
        })
      } catch (smErr) {
        console.warn('Supermemory store failed:', smErr)
      }

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error saving settings: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureUpdate = (url: string) => {
    setProfile((prev) => ({ ...prev, profile_picture_url: url, profile_picture_status: 'pending' }))
  }

  const handleRemoveFromDirectory = async () => {
    try {
      const { error } = await supabase
        .from('owner_profiles')
        .update({
          directory_opt_in: false,
          show_email: false,
          show_phone: false,
          show_unit: false,
        })
        .eq('user_id', user?.id)

      if (error) throw error

      setProfile((prev) => ({
        ...prev,
        directory_opt_in: false,
        show_email: false,
        show_phone: false,
        show_unit: false,
      }))

      setMessage('You have been removed from the directory.')
    } catch (error) {
      console.error('Error removing from directory:', error)
      setMessage('Error removing from directory. Please try again.')
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>
  }

  return (
    <>
      <div className="animate-fadeInUp mx-auto max-w-4xl p-6">
        <h1 className="text-gradient mb-8 text-3xl font-bold">Profile Settings</h1>
        <div className="glass-card animate-glassPop mb-8 p-8">
          <h2 className="premium-gradient mb-4 rounded-lg p-2 text-xl font-semibold text-white shadow">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full rounded-md border border-[var(--spr-blue)] bg-[var(--spr-dark)] px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--spr-ocean)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full rounded-md border border-[var(--spr-blue)] bg-[var(--spr-dark)] px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--spr-ocean)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-md border border-[var(--spr-blue)] bg-[var(--spr-dark)] px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--spr-ocean)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-md border border-[var(--spr-blue)] bg-[var(--spr-dark)] px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--spr-ocean)]"
              />
            </div>
          </div>
        </div>
      </div>
      <ProfilePictureUpload
        currentPicture={profile.profile_picture_url}
        onUploadComplete={handleProfilePictureUpdate}
      />
      <div className="glass-card animate-glassPop mb-8 p-8">
        <h2 className="premium-gradient mb-4 rounded-lg p-2 text-xl font-semibold text-white shadow">
          Directory Privacy Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center font-medium text-white">
              Include in Directory
              <span
                className="bg-[var(--spr-blue)]/20 ml-2 cursor-help rounded-full px-2 py-1 text-xs text-[var(--spr-ocean)]"
                title="Allow other residents to find you in the directory. You can control which information is shown below."
              >
                ?
              </span>
            </label>
            <p className="text-sm text-white/60">
              Allow other residents to find you in the directory
            </p>
            <label className="touch-area relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={profile.directory_opt_in}
                onChange={(e) => setProfile({ ...profile, directory_opt_in: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>
          {profile.directory_opt_in && (
            <div className="border-[var(--spr-blue)]/40 animate-fadeInUp ml-6 space-y-3 border-l-2 pl-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-white">
                  Show Unit Number
                  <span
                    className="bg-[var(--spr-blue)]/20 ml-2 cursor-help rounded-full px-2 py-1 text-xs text-[var(--spr-ocean)]"
                    title="Show your unit number in the directory."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="checkbox"
                  checked={profile.show_unit}
                  onChange={(e) => setProfile({ ...profile, show_unit: e.target.checked })}
                  className="touch-area h-5 w-5 rounded border-[var(--spr-blue)] bg-[var(--spr-dark)] text-[var(--spr-blue)] focus:ring-[var(--spr-ocean)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-white">
                  Show Email
                  <span
                    className="bg-[var(--spr-blue)]/20 ml-2 cursor-help rounded-full px-2 py-1 text-xs text-[var(--spr-ocean)]"
                    title="Show your email address in the directory."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="checkbox"
                  checked={profile.show_email}
                  onChange={(e) => setProfile({ ...profile, show_email: e.target.checked })}
                  className="touch-area h-5 w-5 rounded border-[var(--spr-blue)] bg-[var(--spr-dark)] text-[var(--spr-blue)] focus:ring-[var(--spr-ocean)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-white">
                  Show Phone
                  <span
                    className="bg-[var(--spr-blue)]/20 ml-2 cursor-help rounded-full px-2 py-1 text-xs text-[var(--spr-ocean)]"
                    title="Show your phone number in the directory."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="checkbox"
                  checked={profile.show_phone}
                  onChange={(e) => setProfile({ ...profile, show_phone: e.target.checked })}
                  className="touch-area h-5 w-5 rounded border-[var(--spr-blue)] bg-[var(--spr-dark)] text-[var(--spr-blue)] focus:ring-[var(--spr-ocean)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Supermemory.ai Search Section */}
      <div className="mt-8 rounded-lg bg-white/10 p-4">
        <h3 className="mb-2 text-lg font-semibold text-white">Search Profile Settings with AI</h3>
        <p className="mb-3 text-sm text-white/70">
          As admin, search through all profile settings using natural language queries.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={supermemoryQuery}
            onChange={(e) => setSupermemoryQuery(e.target.value)}
            placeholder="Search settings (e.g., 'users with alerts enabled', 'profiles with phone visible')"
            className="flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-seafoam/50"
          />
          <button
            type="button"
            onClick={async () => {
              if (!supermemoryQuery.trim()) return
              try {
                const results: any = await searchProfileSettings(supermemoryQuery)
                setSupermemoryResults(results?.results || [])
              } catch (err) {
                console.error('Supermemory search failed:', err)
                setSupermemoryResults([])
              }
            }}
            className="rounded-md bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 text-white hover:from-teal-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          >
            Search
          </button>
        </div>
        {supermemoryResults.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium text-white">Search Results:</h4>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {supermemoryResults.map((result, index) => {
                return (
                  <div key={index} className="rounded-md border border-white/20 bg-white/10 p-3">
                    <div className="font-medium text-white">{result.content.split('\n')[0]}</div>
                    <div className="text-sm text-white/80">{result.content.split('\n')[1]}</div>
                    <div className="mt-1 text-xs text-white/60">Score: {result.score}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileSettings
