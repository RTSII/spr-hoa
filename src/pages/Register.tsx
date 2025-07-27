import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type RegisterFormData = {
  unitNumber: string
  accountNumber: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  directoryOptIn: boolean
  showEmail: boolean
  showPhone: boolean
  showUnit: boolean
  receiveAlerts: boolean
}

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<RegisterFormData>({
    defaultValues: {
      directoryOptIn: false,
      showEmail: false,
      showPhone: false,
      showUnit: true,
      receiveAlerts: false
    }
  })

  const password = watch('password')
  const directoryOptIn = watch('directoryOptIn')
  const [showPassword, setShowPassword] = useState(false)

  const handleVerification = async () => {
    const unitNumber = getValues('unitNumber').toUpperCase().trim()
    const accountNumber = getValues('accountNumber').trim()

    console.log('Verifying unit:', unitNumber, 'account:', accountNumber) // Debug log

    setIsLoading(true)
    setVerificationError('')

    try {
      // Use limit(1) and maybeSingle() to ensure single row
      const { data, error } = await supabase
        .from('owners_master')
        .select('*')
        .eq('unit_number', unitNumber)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.log('Verification error:', error)
        setVerificationError('Invalid unit number. Please try again.')
        setIsLoading(false)
        return
      }

      if (!data) {
        setVerificationError('Invalid unit number. Please try again.')
        setIsLoading(false)
        return
      }

      // Extract last 4 digits of hoa_account_number ignoring leading '7'
      const hoaAccountNumber = data.hoa_account_number.trim()
      const lastFourDigits = hoaAccountNumber.length === 5 && hoaAccountNumber.startsWith('7')
        ? hoaAccountNumber.slice(1)
        : hoaAccountNumber.slice(-4)

      if (lastFourDigits !== accountNumber) {
        setVerificationError('Invalid account number. Please try again.')
        setIsLoading(false)
        return
      }

      // Check if this unit is already registered
      const { data: existingProfile } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('unit_number', unitNumber)
        .limit(1)
        .maybeSingle()

      if (existingProfile) {
        setVerificationError('This unit is already registered. Please login instead.')
        setIsLoading(false)
        return
      }

      setIsVerified(true)
      setValue('unitNumber', unitNumber) // Keep the uppercase version
    } catch (err) {
      console.log('Verification exception:', err)
      setVerificationError('An error occurred during verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
        setIsLoading(false)
        return
      }

      if (signUpData.user && !signUpData.session) {
        // Email confirmation required
        setError('Success! Please check your email to verify your account before logging in.')
        setIsLoading(false)
        return
      }

      // If signed in immediately, create profile
      await signUp(data.email, data.password, {
        unitNumber: data.unitNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        directoryOptIn: data.directoryOptIn,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
        showUnit: data.showUnit,
        receive_alerts: data.receiveAlerts
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="/src/assets/images/spr_logo.jpg"
            alt="Sandpiper Run"
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
          <p className="text-white/70 mt-2">Join the Sandpiper Run community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isVerified ? (
            <>
              <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                <h2 className="text-lg font-semibold text-white">Step 1: Verify Your Unit</h2>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Unit Number
                  </label>
                  <input
                    {...register('unitNumber', { required: 'Unit number is required' })}
                    type="text"
                    className="glass-input"
                    placeholder="e.g., A1A"
                    maxLength={3}
                  />
                  {errors.unitNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.unitNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    HOA Account Number (Last 4 digits)
                  </label>
                  <input
                    {...register('accountNumber', {
                      required: 'Account number is required',
                      pattern: {
                        value: /^\d{4}$/,
                        message: 'Please enter exactly 4 digits'
                      }
                    })}
                    type="text"
                    className="glass-input"
                    placeholder="XXXX"
                    maxLength={4}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.accountNumber.message}</p>
                  )}
                </div>

                {verificationError && (
                  <p className="text-sm text-red-400">{verificationError}</p>
                )}

                <button
                  type="button"
                  onClick={handleVerification}
                  disabled={isLoading}
                  className="glass-button w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    Phone (Optional)
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="glass-input"
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>

                {/* On-site Activity Alerts Opt-In */}
                <div className="flex items-center justify-between glass-card p-3 animate-fadeInUp">
                  <label className="font-medium text-white flex items-center">
                    Receive On-site Activity Alerts
                    <span className="ml-2 text-xs text-[var(--spr-ocean)] bg-[var(--spr-blue)]/20 px-2 py-1 rounded-full cursor-help" title="Opt in to receive important alerts about power outages, water shut-offs, and other on-site activities via email and/or SMS.">?</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer touch-area">
                    <input
                      type="checkbox"
                      {...register('receiveAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--spr-blue)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--spr-blue)]"></div>
                  </label>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="glass-input pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7z" />
                        <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3.172 3.172a4 4 0 015.656 0L10 4.343l1.172-1.171a4 4 0 115.656 5.656L10 15.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="glass-input"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Directory Options Section */}
                <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                  <h3 className="text-lg font-semibold text-white">Resident Directory Options</h3>

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
                      <p className="text-xs text-white/70">Choose what information to display:</p>

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

                      <div className="info-text mb-4 text-blue-900 text-center text-sm">
                        <strong>Note:</strong> You can upload a profile photo now or later from your profile settings. Uploading a photo is optional and not required to complete registration.
                      </div>

                      <p className="text-xs text-white/60 italic">
                        You can change these settings anytime from your profile page.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="glass-button w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="text-seafoam hover:text-seafoam/80">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register