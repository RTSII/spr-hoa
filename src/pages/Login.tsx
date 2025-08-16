import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import aerialViewImg from '@/assets/images/aerial_view.jpg'
import birdImg from '@/assets/images/bird.jpeg'

const Login = () => {
  const navigate = useNavigate()
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true
      const mode = window.localStorage.getItem('spr_remember_me')
      return mode !== 'session'
    } catch {
      return true
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Login attempt with:', email, password)

    try {
      // Apply remember-me storage mode BEFORE sign-in so Supabase stores session accordingly
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('spr_remember_me', rememberMe ? 'local' : 'session')
        }
      } catch {}

      await signIn(email, password)
      console.log('SignIn completed successfully')

      // Check if this is the admin email and redirect appropriately
      if (email === 'rtsii10@gmail.com') {
        console.log('Redirecting to admin dashboard')
        navigate('/admin')
      } else {
        console.log('Redirecting to regular dashboard')
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to reset your password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setError('Password reset email sent successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with aerial view */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${aerialViewImg}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-teal-700/80"></div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-10 top-20 h-32 w-32 rounded-full bg-white/10 blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-32 right-16 h-48 w-48 rounded-full bg-teal-300/20 blur-2xl"
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Main login card */}
          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative mb-6"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm">
                  <img
                    src={birdImg}
                    alt="Bird Logo"
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-blue-500/30 blur-lg"></div>
                <div className="absolute -inset-4 -z-20 rounded-full bg-gradient-to-r from-purple-400/20 to-cyan-400/20 blur-xl"></div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-2 text-3xl font-bold tracking-tight text-white"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-white/80"
              >
                Sign in to your Sandpiper Run account
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
                  className="rounded-xl border border-red-400/50 bg-red-500/20 p-4 backdrop-blur-sm"
                >
                  <p className="text-sm font-medium text-red-100">{error}</p>
                </motion.div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username" // Added autocomplete attribute
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password" // Added autocomplete attribute
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 transition-colors hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center space-x-2 select-none">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-teal-500 focus:ring-teal-400"
                  />
                  <span className="text-sm font-medium text-white/90">Remember me</span>
                </label>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-teal-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm font-medium text-teal-300 transition-colors duration-200 hover:text-teal-200"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    to="/invite-request"
                    className="group inline-flex items-center space-x-2 font-medium text-white transition-colors duration-200 hover:text-teal-300"
                  >
                    <span>New to Sandpiper Run?</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Decorative bottom element */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">© 2025 PM-Shift Pool Guy</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
