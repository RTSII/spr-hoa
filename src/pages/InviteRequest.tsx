import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, AlertCircle, User, Home, Mail, Calendar, CheckCircle } from 'lucide-react'

const InviteRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    unitNumber: '',
    purchaseDate: '',
    email: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        `
      }

      // For now, we'll simulate sending the email
      // In production, you'd integrate with your email service
      console.log('Invite request would be sent to rob@ursllc.com:', emailData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccessMessage('Your invite request has been submitted successfully! We will review your information and send you a registration link if approved.')
      
      // Clear form after success
      setFormData({
        name: '',
        unitNumber: '',
        purchaseDate: '',
        email: ''
      })
      
    } catch (err: any) {
      console.error('Invite request error:', err)
      setError('Failed to submit invite request. Please try again.')
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
          className="w-full max-w-md"
        >
          {/* Main invite request card */}
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
                Request an Invite
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/80 text-lg"
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

              {/* Name field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-white/90">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
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

              {/* Purchase Date field */}
              <div className="space-y-2">
                <label htmlFor="purchaseDate" className="block text-sm font-semibold text-white/90">
                  Date of Purchase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                  Preferred Email Contact
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
                className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  <>
                    <span>Submit Request</span>
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

export default InviteRequest
