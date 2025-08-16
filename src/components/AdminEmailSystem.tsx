import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Users,
  Search,
  Building,
  User,
  Send,
  Check,
  X,
  Loader,
  AlertTriangle,
  CheckCircle,
  Plus,
  LayoutTemplate,
  Eye,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Resident {
  user_id: string
  first_name: string
  last_name: string
  unit_number: string
  email: string
  directory_opt_in: boolean
}

interface EmailTemplate {
  id: string
  template_name: string
  subject_template: string
  content_template: string
  is_default: boolean
}

const AdminEmailSystem: React.FC = () => {
  const { user } = useAuth()
  const [recipients, setRecipients] = useState<Resident[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Resident[]>([])
  const [recipientMode, setRecipientMode] = useState<'all' | 'building' | 'individual'>(
    'individual',
  )
  const [selectedBuilding, setSelectedBuilding] = useState('')

  // Email composition
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showTemplates, setShowTemplates] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_message_templates')
        .select('*')
        .order('is_default', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const performSearch = async () => {
    setSearchLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_residents', {
        p_search_term: searchTerm,
      })

      if (error) throw error
      // Only include residents with email addresses for email system
      setSearchResults((data || []).filter((resident: Resident) => resident.email))
    } catch (error) {
      console.error('Error searching residents:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const applyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject_template)
    setContent(template.content_template)
    setSelectedTemplate(template.id)
    setShowTemplates(false)
  }

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const getRecipientEmails = async () => {
    try {
      let recipientIds: string[] = []

      switch (recipientMode) {
        case 'all':
          const { data: allData, error: allError } = await supabase.rpc('get_all_recipients')
          if (allError) throw allError
          recipientIds = allData || []
          break

        case 'building':
          if (!selectedBuilding) {
            throw new Error('Please select a building')
          }
          const { data: buildingData, error: buildingError } = await supabase.rpc(
            'get_building_recipients',
            {
              p_building: selectedBuilding,
            },
          )
          if (buildingError) throw buildingError
          recipientIds = buildingData || []
          break

        case 'individual':
          if (selectedRecipients.length === 0) {
            throw new Error('Please select at least one recipient')
          }
          recipientIds = selectedRecipients
          break
      }

      // Get email addresses for recipients with email notifications enabled
      const { data: recipientData, error: recipientError } = await supabase
        .from('owner_profiles')
        .select('email, first_name, last_name, user_id')
        .in('user_id', recipientIds)

      if (recipientError) throw recipientError

      // Filter for users who have email notifications enabled and have email addresses
      const emailRecipients: string[] = []

      if (recipientData) {
        for (const recipient of recipientData) {
          if (!recipient.email) continue

          const { data: prefs } = await supabase
            .from('user_notification_preferences')
            .select('email_notifications')
            .eq('user_id', recipient.user_id)
            .single()

          if (prefs?.email_notifications) {
            emailRecipients.push(recipient.email)
          }
        }
      }

      return emailRecipients
    } catch (error) {
      throw error
    }
  }

  const handleSendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      setResult({
        success: false,
        message: 'Please enter both subject and content',
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const emailRecipients = await getRecipientEmails()

      if (emailRecipients.length === 0) {
        throw new Error(
          'No email recipients found. Recipients must have email addresses and email notifications enabled.',
        )
      }

      // Create professional HTML email content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2953A6, #6bb7e3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🏖️ Sandpiper Run HOA</h1>
            <p>Message from Rob Steen, HOA Administrator</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; color: #333; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2953A6; margin-bottom: 20px;">${subject}</h2>
            <div style="white-space: pre-wrap; line-height: 1.6; margin: 20px 0; font-size: 16px;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <div style="color: #666; font-size: 14px;">
              <p><strong>Best regards,</strong><br>
              Rob Steen<br>
              Sandpiper Run HOA Administrator<br>
              <a href="mailto:rob@ursllc.com" style="color: #2953A6;">rob@ursllc.com</a></p>

              <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                This email was sent via the Sandpiper Run HOA Portal.<br>
                Sent on: ${new Date().toLocaleString()}<br>
                Priority: ${priority.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      `

      // Send email via Edge Function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(
        'send-email',
        {
          body: {
            to: emailRecipients,
            subject: `SPR-HOA: ${subject}`,
            html: htmlContent,
            from: 'Rob Steen <rob@ursllc.com>',
          },
        },
      )

      if (emailError) {
        console.error('Email sending error:', emailError)
        throw new Error('Failed to send email: ' + emailError.message)
      }

      setResult({
        success: true,
        message: `Email sent successfully to ${emailRecipients.length} recipient(s)`,
        details: {
          recipientCount: emailRecipients.length,
          priority: priority,
          mode: recipientMode,
          subject: subject,
        },
      })

      // Clear form
      setSubject('')
      setContent('')
      setSelectedRecipients([])
      setSearchTerm('')
      setSearchResults([])
      setSelectedTemplate('')
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send email',
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const getRecipientSummary = () => {
    switch (recipientMode) {
      case 'all':
        return 'All opted-in residents with email addresses'
      case 'building':
        return selectedBuilding
          ? `All residents in Building ${selectedBuilding} with email`
          : 'Select a building'
      case 'individual':
        return `${selectedRecipients.length} selected resident(s) with email`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-6 w-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Send Email to Residents</h2>
            <p className="text-sm text-white/70">Send emails from rob@ursllc.com</p>
          </div>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center space-x-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span>Templates</span>
        </button>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">Email Templates</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer rounded-lg bg-white/10 p-4 transition-colors hover:bg-white/20"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-semibold text-white">{template.template_name}</h4>
                  <p className="mt-1 text-sm text-white/70">{template.subject_template}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-white/50">
                    {template.content_template.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recipient Selection */}
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Select Email Recipients</h3>

          {/* Recipient Mode Selection */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'all', icon: Users, label: 'All Residents' },
                { mode: 'building', icon: Building, label: 'By Building' },
                { mode: 'individual', icon: User, label: 'Individual' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setRecipientMode(mode as any)}
                  className={`rounded-lg border-2 p-3 transition-all ${
                    recipientMode === mode
                      ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="mx-auto mb-1 h-5 w-5" />
                  <div className="text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Building Selection */}
          {recipientMode === 'building' && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white">Select Building</label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="">Choose a building...</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
                <option value="C">Building C</option>
                <option value="D">Building D</option>
              </select>
            </div>
          )}

          {/* Individual Search */}
          {recipientMode === 'individual' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or unit number..."
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                {searchLoading && (
                  <Loader className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform animate-spin text-white/50" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {searchResults.map((resident) => (
                    <div
                      key={resident.user_id}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        selectedRecipients.includes(resident.user_id)
                          ? 'border-blue-500/50 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => toggleRecipient(resident.user_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            {resident.first_name} {resident.last_name}
                          </div>
                          <div className="text-sm text-white/70">
                            Unit {resident.unit_number} • {resident.email}
                          </div>
                        </div>
                        {selectedRecipients.includes(resident.user_id) && (
                          <Check className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Recipients Summary */}
              {selectedRecipients.length > 0 && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="text-sm text-blue-300">
                    {selectedRecipients.length} recipient(s) selected
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recipient Summary */}
          <div className="mt-4 rounded-lg bg-white/10 p-3">
            <div className="text-sm text-white/80">
              <strong>Sending to:</strong> {getRecipientSummary()}
            </div>
            <div className="mt-1 text-xs text-white/60">
              Only residents with email addresses and email notifications enabled
            </div>
          </div>
        </div>

        {/* Email Composition */}
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Compose Email</h3>

          <div className="space-y-4">
            {/* From Field (Display Only) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">From</label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                Rob Steen &lt;rob@ursllc.com&gt;
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Message Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your email message here..."
                rows={8}
                className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendEmail}
              disabled={loading || !subject.trim() || !content.trim()}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Sending Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card border p-4 ${
            result.success
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.message}
              </p>
              {result.details && result.success && (
                <div className="mt-2 text-sm text-white/70">
                  <div>Recipients: {result.details.recipientCount}</div>
                  <div>Priority: {result.details.priority}</div>
                  <div>Subject: "{result.details.subject}"</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AdminEmailSystem
