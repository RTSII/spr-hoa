import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User, Phone, Home, CreditCard, Key, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    unitNumber: '',
    hoaLast4: '',
    token: searchParams.get('token') || '', // Pre-fill if token in URL
    directoryOptIn: false,
    showEmail: false,
    showPhone: false,
    showUnit: true
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required'
    if (!formData.lastName.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.email.includes('@')) return 'Please enter a valid email'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    if (!formData.unitNumber.trim()) return 'Unit number is required'
    if (!formData.hoaLast4.trim()) return 'Last 4 digits of HOA account are required'
    if (formData.hoaLast4.length !== 4) return 'Please enter exactly 4 digits'
    if (!/^\d{4}$/.test(formData.hoaLast4)) return 'HOA account digits must be numbers only'
    if (!formData.token.trim()) return 'Registration token is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // First validate the token, unit number, and HOA account
      const { data: tokenData, error: tokenError } = await supabase
        .from('registration_tokens')
        .select('*')
        .eq('unit_number', formData.unitNumber)
        .eq('hoa_last4', formData.hoaLast4)
        .eq('token', formData.token)
        .eq('used', false)
        .single()

      if (tokenError || !tokenData) {
        throw new Error('Invalid registration token, unit number, or HOA account information. Please verify all details are correct.')
      }

      // Verify unit exists in owners_master table
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners_master')
        .select('unit_number, hoa_account_number')
        .eq('unit_number', formData.unitNumber)
        .single()

      if (ownerError || !ownerData) {
        throw new Error('Unit number not found in our records. Please contact the HOA office.')
      }

      // Verify HOA account last 4 digits match
      const hoaAccountLast4 = ownerData.hoa_account_number.slice(-4)
      if (hoaAccountLast4 !== formData.hoaLast4) {
        throw new Error('HOA account number does not match our records.')
      }

      // Register the user
      await signUp(formData.email, formData.password, {
        unitNumber: formData.unitNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        directoryOptIn: formData.directoryOptIn,
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
        showUnit: formData.showUnit,
      })

      // Mark token as used
      await supabase
        .from('registration_tokens')
        .update({ 
          used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', tokenData.id)

      setSuccessMessage('Registration successful! Redirecting to login...')
      
      // Success - redirect to login after a short delay
      setTimeout(() => {
        navigate('/login?message=Registration successful! Please sign in with your new account.')
      }, 2000)
      
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with aerial view */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/src/assets/images/aerial_view.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/65 via-blue-800/55 to-teal-700/65"></div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 right-16 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Main registration card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative mb-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <img
                    src="/src/assets/images/spr_logo.jpg"
                    alt="Sandpiper Run"
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-lg -z-10"></div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-3xl font-bold text-white mb-2 tracking-tight"
              >
                Join Sandpiper Run
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/80 text-lg"
              >
                Create your community account
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 backdrop-blur-sm flex items-start space-x-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-red-100 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 backdrop-blur-sm flex items-start space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <p className="text-green-100 text-sm font-medium">{successMessage}</p>
                </motion.div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-white/90">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        autoComplete="given-name"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-white/90">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        autoComplete="family-name"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-white/90">
                    Phone Number <span className="text-white/50">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Account Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Account Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Directory Preferences Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Directory Preferences</h3>
                <p className="text-white/70 text-sm">Choose what information to share in the community directory</p>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="directoryOptIn"
                      checked={formData.directoryOptIn}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-400/50 focus:ring-offset-0"
                    />
                    <span className="text-white text-sm">Include me in the community directory</span>
                  </label>
                  
                  {formData.directoryOptIn && (
                    <div className="ml-8 space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showEmail"
                          checked={formData.showEmail}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-400/50 focus:ring-offset-0"
                        />
                        <span className="text-white/80 text-sm">Show email address</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showPhone"
                          checked={formData.showPhone}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-400/50 focus:ring-offset-0"
                        />
                        <span className="text-white/80 text-sm">Show phone number</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showUnit"
                          checked={formData.showUnit}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-400/50 focus:ring-offset-0"
                        />
                        <span className="text-white/80 text-sm">Show unit number</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Section - Token at the bottom as requested */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Ownership Verification</h3>
                <p className="text-white/70 text-sm">Verify your ownership with the information from your registration email</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="unitNumber" className="block text-sm font-semibold text-white/90">
                      Unit Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="unitNumber"
                        name="unitNumber"
                        type="text"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="e.g., 101, A-205"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="hoaLast4" className="block text-sm font-semibold text-white/90">
                      Last 4 Digits of HOA Account
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-white/50" />
                      </div>
                      <input
                        id="hoaLast4"
                        name="hoaLast4"
                        type="text"
                        maxLength={4}
                        value={formData.hoaLast4}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="1234"
                      />
                    </div>
                  </div>
                </div>

                {/* Token field - positioned at the bottom as requested */}
                <div className="space-y-2">
                  <label htmlFor="token" className="block text-sm font-semibold text-white/90">
                    Registration Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="token"
                      name="token"
                      type="text"
                      value={formData.token}
                      onChange={handleInputChange}
                      required
                      autoComplete="off"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter the token from your registration email"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">
                    This unique token was provided in your registration email and expires in 7 days from delivery.
                  </p>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">Already have an account?</span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-white hover:text-teal-300 font-medium transition-colors duration-200 group"
                >
                  <span>Sign in here</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Decorative bottom element */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60 text-sm">
             © 2025 PM-Shift Pool Guy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
