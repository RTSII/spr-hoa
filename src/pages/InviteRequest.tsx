import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, AlertCircle, User, Home, Mail, Calendar, CheckCircle } from 'lucide-react'
import { storeInviteRequest, searchInviteRequests } from '../lib/supermemory'

const InviteRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    unitNumber: '',
    purchaseDate: '',
    email: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Supermemory.ai search state
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.unitNumber.trim()) return 'Unit number is required'
    if (!formData.purchaseDate) return 'Date of purchase is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.email.includes('@')) return 'Please enter a valid email'
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
      // Send invite request email to rob@ursllc.com
      const emailData = {
        to: 'rob@ursllc.com',
        subject: 'New Sandpiper Run Invite Request',
        html: `
          <h2>New Invite Request</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Unit Number:</strong> ${formData.unitNumber}</p>
          <p><strong>Date of Purchase:</strong> ${formData.purchaseDate}</p>
          <p><strong>Preferred Email:</strong> ${formData.email}</p>
          <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
        `,
      }

      // For now, we'll simulate sending the email
      // In production, you'd integrate with your email service
      console.log('Invite request would be sent to rob@ursllc.com:', emailData)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store invite request in Supermemory.ai
      await storeInviteRequest({
        name: formData.name,
        unitNumber: formData.unitNumber,
        purchaseDate: formData.purchaseDate,
        email: formData.email,
        timestamp: new Date().toISOString(),
      })

      setSuccessMessage(
        'Your invite request has been submitted successfully! We will review your information and send you a registration link if approved.',
      )

      // Clear form after success
      setFormData({
        name: '',
        unitNumber: '',
        purchaseDate: '',
        email: '',
      })
    } catch (err: any) {
      console.error('Invite request error:', err)
      setError('Failed to submit invite request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!supermemoryQuery.trim()) return

    setSearching(true)
    try {
      const results = await searchInviteRequests(supermemoryQuery)
      setSupermemoryResults(Array.isArray(results) ? results : [])
    } catch (err) {
      console.error('Supermemory search failed:', err)
      setSupermemoryResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
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
          {/* Main invite request card */}
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
                    src="/src/assets/images/spr_logo.jpg"
                    alt="Sandpiper Run"
                    className="h-16 w-16 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-lg"></div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-2 text-3xl font-bold tracking-tight text-white"
              >
                Request an Invite
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-white/80"
              >
                Join the Sandpiper Run community
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
                  className="flex items-start space-x-3 rounded-xl border border-red-400/50 bg-red-500/20 p-4 backdrop-blur-sm"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                  <p className="text-sm font-medium text-red-100">{error}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start space-x-3 rounded-xl border border-green-400/50 bg-green-500/20 p-4 backdrop-blur-sm"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-300" />
                  <p className="text-sm font-medium text-green-100">{successMessage}</p>
                </motion.div>
              )}

              {/* Name field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-white/90">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Unit Number field */}
              <div className="space-y-2">
                <label htmlFor="unitNumber" className="block text-sm font-semibold text-white/90">
                  Unit Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="e.g., 101, A-205"
                  />
                </div>
              </div>

              {/* Purchase Date field */}
              <div className="space-y-2">
                <label htmlFor="purchaseDate" className="block text-sm font-semibold text-white/90">
                  Date of Purchase
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Calendar className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="purchaseDate"
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                  Preferred Email Contact
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="your@email.com"
                  />
                </div>
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
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  <>
                    <span>Submit Request</span>
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
              className="mt-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-transparent px-4 text-white/60">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center space-x-2 font-medium text-white transition-colors duration-200 hover:text-teal-300"
                >
                  <span>Sign in here</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Decorative bottom element */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-sm text-white/60">&copy; 2025 PM-Shift Pool Guy</p>
              </motion.div>

              {/* Supermemory.ai Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card relative z-10 mx-auto w-full max-w-md p-8 text-center"
              >
                <h1 className="mb-2 text-4xl font-bold text-white">Request Invite</h1>
                <p className="mb-8 text-white/80">
                  Fill out your information to request access to the Sandpiper Run community portal.
                </p>

                {/* Supermemory.ai Search Section */}
                <div className="mb-8 rounded-lg border border-white/20 bg-white/10 p-4">
                  <h2 className="mb-3 text-xl font-semibold text-white">Search Invite Requests</h2>
                  <p className="mb-4 text-sm text-white/70">
                    As admin, search through all invite requests using natural language queries.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={supermemoryQuery}
                      onChange={(e) => setSupermemoryQuery(e.target.value)}
                      placeholder="Search invites (e.g., 'requests from last week', 'unit 101 invites')"
                      className="flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="rounded bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 text-white transition-all hover:from-teal-400 hover:to-blue-500 disabled:opacity-50"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {supermemoryResults.length > 0 && (
                    <div className="mt-4 text-left">
                      <h3 className="mb-2 font-medium text-white">Search Results:</h3>
                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {supermemoryResults.map((result, index) => (
                          <div
                            key={index}
                            className="rounded border border-white/10 bg-white/5 p-2"
                          >
                            <div className="text-sm text-white">{result.content}</div>
                            <div className="mt-1 text-xs text-white/60">Score: {result.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default InviteRequest
