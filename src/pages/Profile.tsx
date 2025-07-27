import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

type ProfileFormData = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  directoryOptIn: boolean
  showEmail: boolean
  showPhone: boolean
  showUnit: boolean
}

const Profile = () => {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      directoryOptIn: profile?.directory_opt_in || false,
      showEmail: profile?.show_email || false,
      showPhone: profile?.show_phone || false,
      showUnit: profile?.show_unit || true
    }
  })

  const directoryOptIn = watch('directoryOptIn')

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        directory_opt_in: data.directoryOptIn,
        show_email: data.directoryOptIn ? data.showEmail : false,
        show_phone: data.directoryOptIn ? data.showPhone : false,
        show_unit: data.directoryOptIn ? data.showUnit : true
      })
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromDirectory = async () => {
    if (confirm('Are you sure you want to remove yourself from the resident directory?')) {
      setIsLoading(true)
      try {
        await updateProfile({
          directory_opt_in: false,
          show_email: false,
          show_phone: false,
          show_unit: false
        })
        setSuccessMessage('You have been removed from the directory.')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err: any) {
        setError(err.message || 'Failed to update directory settings')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white">Profile Settings</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/70 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  className="glass-input"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  className="glass-input"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="glass-input"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="glass-input"
                placeholder="(XXX) XXX-XXXX"
              />
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white/80">
                <span className="font-semibold">Unit:</span> {profile?.unit_number}
              </p>
              <p className="text-white/60 text-sm mt-1">
                Unit number cannot be changed. Contact the HOA if this is incorrect.
              </p>
            </div>
          </div>

          {/* Directory Settings */}
          <div className="space-y-4 p-6 bg-white/10 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Resident Directory Settings</h2>

            <div className="flex items-center">
              <input
                {...register('directoryOptIn')}
                type="checkbox"
                className="h-4 w-4 text-seafoam focus:ring-seafoam border-white/30 rounded bg-white/10"
              />
              <label className="ml-2 block text-sm text-white">
                Include me in the resident directory
              </label>
            </div>

            {directoryOptIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pl-6"
              >
                <p className="text-sm text-white/70">Choose what information to display:</p>

                <div className="flex items-center">
                  <input
                    {...register('showUnit')}
                    type="checkbox"
                    className="h-4 w-4 text-seafoam focus:ring-seafoam border-white/30 rounded bg-white/10"
                  />
                  <label className="ml-2 block text-sm text-white/80">
                    Show my unit number
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('showEmail')}
                    type="checkbox"
                    className="h-4 w-4 text-seafoam focus:ring-seafoam border-white/30 rounded bg-white/10"
                  />
                  <label className="ml-2 block text-sm text-white/80">
                    Show my email address
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register('showPhone')}
                    type="checkbox"
                    className="h-4 w-4 text-seafoam focus:ring-seafoam border-white/30 rounded bg-white/10"
                  />
                  <label className="ml-2 block text-sm text-white/80">
                    Show my phone number
                  </label>
                </div>
              </motion.div>
            )}

            {profile?.directory_opt_in && (
              <div className="pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={handleRemoveFromDirectory}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Remove me from the directory completely
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/50 rounded-lg p-4"
            >
              <p className="text-sm text-green-400">{successMessage}</p>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className={`glass-button ${(!isDirty || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Profile