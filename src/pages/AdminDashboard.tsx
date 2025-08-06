import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  FileText,
  Camera,
  MessageSquare,
  Newspaper,
  Bell,
  ChevronRight,
  Waves,
  Sun,
  Wind,
  Settings,
  BarChart3,
  Shield,
  Mail,
  Database,
  Eye,
  UserPlus,
  Send,
  Activity,
  CheckCircle,
  XCircle,
  Upload,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import OwnerInbox from '@/components/OwnerInbox'
import ProfileCard from '@/components/ProfileCard'
import PhotoApprovalSystem from '@/components/PhotoApprovalSystem'
import UserManagementSystem from '@/components/UserManagementSystem'
import NewsManagementSystem from '@/components/NewsManagementSystem'
import AdminMessaging from '@/components/AdminMessaging'
import AdminEmailSystem from '@/components/AdminEmailSystem'
import MessagingTestComponent from '@/components/MessagingTestComponent'
import { useAuth } from '@/contexts/AuthContext'
import { adminService, AdminMessage, AdminStats } from '@/lib/adminService'
import aerialViewImg from '@/assets/images/aerial_view.jpg'

const AdminDashboard = () => {
  const { user, adminProfile, isAdmin, signOut } = useAuth()

  console.log('AdminDashboard - user:', user, 'adminProfile:', adminProfile, 'isAdmin:', isAdmin)

  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showInbox, setShowInbox] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [activeAdminPanel, setActiveAdminPanel] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real admin data state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [recentMessages, setRecentMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(false)

  // Message form state
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [generalMessage, setGeneralMessage] = useState('')

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load admin data
  useEffect(() => {
    if (isAdmin && user) {
      loadAdminData()
    }
  }, [isAdmin, user])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [stats, messages] = await Promise.all([
        adminService.getAdminDashboardStats(),
        adminService.getRecentMessages(5)
      ])
      setAdminStats(stats)
      setRecentMessages(messages)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (type: 'emergency' | 'general', message: string) => {
    if (!message.trim()) return

    try {
      setLoading(true)
      await adminService.sendMessage({
        message_type: type,
        title: type === 'emergency' ? 'Emergency Alert' : 'General Notice',
        content: message,
        priority: type === 'emergency' ? 'urgent' : 'medium'
      })

      // Clear the message and reload data
      if (type === 'emergency') {
        setEmergencyMessage('')
      } else {
        setGeneralMessage('')
      }

      await loadAdminData()

      // Show success feedback
      alert(`${type === 'emergency' ? 'Emergency alert' : 'General notice'} sent successfully!`)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  console.log('AdminDashboard rendering...')

  // Mock data for admin functions
  const mockPendingPhotos = [
    { id: 1, title: 'Pool Sunset', user: 'John Smith', unit: '4A', submitted: '2 hours ago' },
    { id: 2, title: 'Beach Walk', user: 'Sarah Johnson', unit: '2B', submitted: '1 day ago' },
    { id: 3, title: 'Community Event', user: 'Mike Wilson', unit: '6C', submitted: '3 hours ago' }
  ]

  const mockUsers = [
    { id: 1, name: 'John Smith', unit: '4A', email: 'john@email.com', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', unit: '2B', email: 'sarah@email.com', status: 'active', joined: '2024-02-10' },
    { id: 3, name: 'Mike Wilson', unit: '6C', email: 'mike@email.com', status: 'pending', joined: '2024-03-05' }
  ]

  const mockNewsRequests = [
    { id: 1, title: 'Beach Cleanup Event', category: 'Community', priority: 'high', submitted: '1 hour ago' },
    { id: 2, title: 'Pool Maintenance Notice', category: 'Maintenance', priority: 'medium', submitted: '2 days ago' }
  ]

  const adminFeatures = [
    {
      id: 'message-center',
      title: 'Message Center',
      description: 'Send Alerts & Notices',
      icon: Mail,
      color: 'from-red-500 via-pink-600 to-rose-600',
      position: { top: '15%', left: '12%' },
      delay: 0.1
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage Residents',
      icon: UserPlus,
      color: 'from-blue-500 via-cyan-600 to-teal-600',
      position: { top: '10%', right: '15%' },
      delay: 0.2
    },
    {
      id: 'news-admin',
      title: 'News Management',
      description: 'Manage News & Posts',
      icon: Newspaper,
      color: 'from-purple-500 via-violet-600 to-indigo-600',
      position: { top: '40%', left: '8%' },
      delay: 0.3
    },
    {
      id: 'photo-admin',
      title: 'Photo Management',
      description: 'Review & Manage Photos',
      icon: Camera,
      color: 'from-orange-500 via-amber-600 to-yellow-600',
      position: { bottom: '30%', right: '12%' },
      delay: 0.4
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Portal Usage Statistics',
      icon: BarChart3,
      color: 'from-emerald-500 via-green-600 to-teal-600',
      position: { bottom: '15%', left: '15%' },
      delay: 0.5
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Portal Configuration',
      icon: Settings,
      color: 'from-slate-500 via-gray-600 to-zinc-600',
      position: { top: '60%', right: '20%' },
      delay: 0.6
    },
    {
      id: 'admin-messaging',
      title: 'Site Messages',
      description: 'Send Inbox Messages',
      icon: MessageSquare,
      color: 'from-blue-500 via-indigo-600 to-purple-600',
      position: { bottom: '45%', left: '25%' },
      delay: 0.7
    },
    {
      id: 'admin-email',
      title: 'Send Emails',
      description: 'Email from rob@ursllc.com',
      icon: Mail,
      color: 'from-green-500 via-emerald-600 to-teal-600',
      position: { top: '25%', left: '40%' },
      delay: 0.9
    },
    {
      id: 'messaging-test',
      title: 'System Testing',
      description: 'Test Messaging System',
      icon: Activity,
      color: 'from-green-500 via-emerald-600 to-teal-600',
      position: { top: '35%', right: '35%' },
      delay: 0.8
    }
  ]

  const handleFeatureClick = (featureId: string) => {
    setActiveAdminPanel(featureId)
  }

  const renderAdminPanel = () => {
    if (!activeAdminPanel) return null

    const panelVariants = {
      hidden: { opacity: 0, scale: 0.9, y: 20 },
      visible: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 }
    }

    switch (activeAdminPanel) {
      case 'message-center':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="h-6 w-6 text-red-400" />
              <h3 className="text-2xl font-bold text-white">Message Center</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emergency Alert */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-red-400 mb-4">Emergency Alert</h4>
                <textarea
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  className="w-full h-32 p-4 bg-black/30 border border-red-400/30 rounded-lg text-white placeholder-white/50 resize-none focus:border-red-400 focus:outline-none"
                  placeholder="Type emergency message..."
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage('emergency', emergencyMessage)}
                  disabled={loading || !emergencyMessage.trim()}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Emergency Alert'}
                </motion.button>
              </div>

              {/* General Notice */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">General Notice</h4>
                <textarea
                  value={generalMessage}
                  onChange={(e) => setGeneralMessage(e.target.value)}
                  className="w-full h-32 p-4 bg-black/30 border border-blue-400/30 rounded-lg text-white placeholder-white/50 resize-none focus:border-blue-400 focus:outline-none"
                  placeholder="Type general notice..."
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage('general', generalMessage)}
                  disabled={loading || !generalMessage.trim()}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send General Notice'}
                </motion.button>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Messages</h4>
              <div className="space-y-3">
                {recentMessages.length > 0 ? recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        msg.message_type === 'emergency' ? 'bg-red-500/20 text-red-300' :
                        msg.message_type === 'maintenance' ? 'bg-yellow-500/20 text-yellow-300' :
                        msg.message_type === 'event' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {msg.message_type.charAt(0).toUpperCase() + msg.message_type.slice(1)}
                      </span>
                      <p className="text-white mt-1">{msg.title}</p>
                      <p className="text-white/80 text-sm mt-1">{msg.content.substring(0, 100)}{msg.content.length > 100 ? '...' : ''}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(msg.sent_at).toLocaleString()} • {msg.recipients_count} recipients
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-white/60">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages sent yet</p>
                    <p className="text-sm">Send your first message above</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )

      case 'photo-admin':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Camera className="h-6 w-6 text-orange-400" />
              <h3 className="text-2xl font-bold text-white">Photo Management</h3>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">Pending Photo Approvals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPendingPhotos.map((photo) => (
                  <div key={photo.id} className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <div className="w-full h-32 bg-gradient-to-br from-orange-200 to-orange-400 rounded-lg mb-3 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-orange-700" />
                    </div>
                    <h5 className="text-white font-semibold">{photo.title}</h5>
                    <p className="text-white/70 text-sm">By {photo.user} • Unit {photo.unit}</p>
                    <p className="text-white/50 text-xs mb-3">{photo.submitted}</p>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-all text-sm"
                      >
                        <CheckCircle className="h-4 w-4 mx-auto" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-all text-sm"
                      >
                        <XCircle className="h-4 w-4 mx-auto" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 'user-management':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">User Management</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </motion.button>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                    placeholder="Search users..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Filter className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-white font-semibold">{user.name}</h5>
                        <p className="text-white/70 text-sm">Unit {user.unit} • {user.email}</p>
                        <p className="text-white/50 text-xs">Joined {user.joined}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-all"
                      >
                        <Edit3 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 'news-admin':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Newspaper className="h-6 w-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">News Management</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Post */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">Create News Post</h4>
                <div className="space-y-4">
                  <input
                    className="w-full p-3 bg-black/30 border border-purple-400/30 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                    placeholder="Post title..."
                  />
                  <select className="w-full p-3 bg-black/30 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none">
                    <option value="">Select category...</option>
                    <option value="community">Community</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="events">Events</option>
                    <option value="announcements">Announcements</option>
                  </select>
                  <textarea
                    className="w-full h-32 p-3 bg-black/30 border border-purple-400/30 rounded-lg text-white placeholder-white/50 resize-none focus:border-purple-400 focus:outline-none"
                    placeholder="Write your news post content..."
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                  >
                    Publish Post
                  </motion.button>
                </div>
              </div>

              {/* Pending News Requests */}
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">Pending Requests</h4>
                <div className="space-y-3">
                  {mockNewsRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-semibold">{request.title}</h5>
                        <span className={`px-2 py-1 text-xs rounded ${
                          request.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          request.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{request.category} • {request.submitted}</p>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-all text-sm"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-all text-sm"
                        >
                          Edit
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'analytics':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="h-6 w-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Analytics Dashboard</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Users', value: '156', trend: '+12%', color: 'text-green-400' },
                { label: 'Monthly Logins', value: '1,234', trend: '+8%', color: 'text-blue-400' },
                { label: 'Messages Sent', value: '89', trend: '+23%', color: 'text-purple-400' },
                { label: 'Photo Submissions', value: '45', trend: '+15%', color: 'text-orange-400' }
              ].map((stat, idx) => (
                <div key={idx} className="glass-card p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-white/80 text-sm mb-1">{stat.label}</div>
                  <div className="text-green-400 text-xs">{stat.trend}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold text-green-400 mb-4">Portal Activity</h4>
              <div className="h-64 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Analytics Chart Placeholder</p>
                  <p className="text-sm">Real charts would be integrated here</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'system-settings':
        return (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-white">System Settings</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-gray-400 mb-4">Portal Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Portal Name</label>
                    <input
                      className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-gray-400 focus:outline-none"
                      defaultValue="Sandpiper Run HOA Portal"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Contact Email</label>
                    <input
                      className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-gray-400 focus:outline-none"
                      defaultValue="admin@sandpiperrun.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Maintenance Mode</label>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-white/70">Enable maintenance mode</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-gray-400 mb-4">Security Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Session Timeout (minutes)</label>
                    <input
                      className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-gray-400 focus:outline-none"
                      defaultValue="30"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Password Requirements</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-white/70">Require uppercase letters</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-white/70">Require numbers</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-white/70">Require special characters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg,
          rgba(15, 23, 42, 0.95) 0%,
          rgba(30, 41, 59, 0.9) 25%,
          rgba(51, 65, 85, 0.85) 50%,
          rgba(71, 85, 105, 0.8) 75%,
          rgba(15, 23, 42, 0.95) 100%),
          url(${aerialViewImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/40 to-purple-500/40 rounded-full"
            animate={{
              x: [0, 100 + i * 10, 0],
              y: [0, -100 - i * 5, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${5 + i * 6}%`,
              top: `${10 + i * 5}%`,
            }}
          />
        ))}
      </div>

      {/* Admin Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-900/20 to-purple-900/20 backdrop-blur-md border-b border-red-500/20">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-red-400" />
            <span className="text-red-200 font-semibold">ADMIN MODE</span>
            <span className="text-red-300/70">•</span>
            <span className="text-white/90">{user?.email || 'admin@spr-hoa.com'}</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-white/80">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-400" />
              <span>78°F</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-blue-400" />
              <span>12 mph</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <motion.button
              onClick={signOut}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 text-red-300 rounded border border-red-500/30 hover:bg-red-500/30 transition-all"
            >
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-8">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            SPR-HOA Admin Portal
          </motion.h1>
          <motion.p
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome back! Manage your luxury oceanfront community with powerful admin tools.
          </motion.p>
        </div>

        {/* Full-Screen Admin Systems */}
        <AnimatePresence mode="wait">
          {activeAdminPanel === 'photo-admin' && (
            <PhotoApprovalSystem onClose={() => setActiveAdminPanel(null)} />
          )}
          {activeAdminPanel === 'user-management' && (
            <UserManagementSystem onClose={() => setActiveAdminPanel(null)} />
          )}
          {activeAdminPanel === 'news-admin' && (
            <NewsManagementSystem onClose={() => setActiveAdminPanel(null)} />
          )}
          {activeAdminPanel === 'admin-messaging' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveAdminPanel(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="w-full max-w-7xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">Send Message to Residents</h2>
                  <button
                    onClick={() => setActiveAdminPanel(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                  <AdminMessaging />
                </div>
              </motion.div>
            </motion.div>
          )}
          {activeAdminPanel === 'messaging-test' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveAdminPanel(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="w-full max-w-6xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">System Testing & Verification</h2>
                  <button
                    onClick={() => setActiveAdminPanel(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                  <MessagingTestComponent />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Panel Content */}
        <AnimatePresence mode="wait">
          {activeAdminPanel &&
           activeAdminPanel !== 'photo-admin' &&
           activeAdminPanel !== 'user-management' &&
           activeAdminPanel !== 'news-admin' ? (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveAdminPanel(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back to Dashboard</span>
                </motion.button>
              </div>
              {renderAdminPanel()}
            </motion.div>
          ) : (
            <motion.div
              key="constellation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Feature Constellation */}
              <div className="relative max-w-7xl mx-auto h-96 mb-16">
                {adminFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.id}
                      className="absolute cursor-pointer group"
                      style={feature.position}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: feature.delay,
                        type: "spring",
                        bounce: 0.4
                      }}
                      whileHover={{
                        scale: 1.15,
                        z: 50,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.3 }
                      }}
                      onHoverStart={() => setActiveFeature(feature.id)}
                      onHoverEnd={() => setActiveFeature(null)}
                      onClick={() => handleFeatureClick(feature.id)}
                    >
                      <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${feature.color} p-1 shadow-2xl transform transition-all duration-300 group-hover:shadow-3xl group-hover:shadow-${feature.color.split('-')[1]}-500/25`}>
                        <div className="w-full h-full bg-black/20 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center text-white p-3 group-hover:bg-black/10 transition-all">
                          <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                          <h3 className="text-sm font-semibold text-center leading-tight">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-white/80 text-center mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Connecting Lines with Pulse Effect */}
                      {activeFeature === feature.id && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <svg className="absolute -inset-32 w-64 h-64">
                            <defs>
                              <linearGradient id={`gradient-${feature.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                                <stop offset="50%" stopColor="rgba(147, 51, 234, 0.6)" />
                                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)" />
                              </linearGradient>
                              <filter id={`glow-${feature.id}`}>
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="48"
                              fill="none"
                              stroke={`url(#gradient-${feature.id})`}
                              strokeWidth="2"
                              filter={`url(#glow-${feature.id})`}
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.7 }}
                              transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="60"
                              fill="none"
                              stroke={`url(#gradient-${feature.id})`}
                              strokeWidth="1"
                              opacity="0.3"
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </svg>
                        </motion.div>
                      )}

                      {/* Click Ripple Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 pointer-events-none"
                        whileTap={{ opacity: [0, 0.3, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-6 mb-16">
                <motion.button
                  onClick={() => setShowInbox(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>View Messages</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600/80 hover:bg-purple-500/80 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Profile</span>
                </motion.button>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { label: 'Admin Sessions', value: adminProfile?.login_count || 1, color: 'text-blue-400', icon: Activity },
                  { label: 'Active Residents', value: adminStats?.active_users || '0', color: 'text-green-400', icon: Users },
                  { label: 'Pending Actions', value: adminStats?.pending_photos || '0', color: 'text-purple-400', icon: Bell }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon
                  return (
                    <motion.div
                      key={idx}
                      className="glass-card p-6 text-center group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <StatIcon className={`h-8 w-8 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                      <div className={`text-3xl font-bold ${stat.color} mb-2 group-hover:text-white transition-colors`}>
                        {stat.value}
                      </div>
                      <div className="text-white/80">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panels */}
      <AnimatePresence>
        {showInbox && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6"
          >
            <button
              onClick={() => setShowInbox(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Admin Messages</h3>
            <div className="text-white/70">Mock inbox content...</div>
          </motion.div>
        )}

        {showProfile && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50 p-6"
          >
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Admin Profile</h3>
            <div className="space-y-4 text-white/80">
              <div>
                <strong>Email:</strong> {user?.email || 'admin@spr-hoa.com'}
              </div>
              <div>
                <strong>Role:</strong> {adminProfile?.role || 'admin'}
              </div>
              <div>
                <strong>Login Count:</strong> {adminProfile?.login_count || 1}
              </div>
              <div>
                <strong>Last Login:</strong> {adminProfile?.last_login_at ? new Date(adminProfile.last_login_at).toLocaleString() : 'Recently'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay when panels are open */}
      <AnimatePresence>
        {(showInbox || showProfile || activeAdminPanel) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowInbox(false)
              setShowProfile(false)
              if (activeAdminPanel) setActiveAdminPanel(null)
            }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDashboard
