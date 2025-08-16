import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MessageSquare,
  Camera,
  Settings,
  BarChart3,
  Bell,
  TestTube,
  Send,
  Eye,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AdminMessaging from '@/components/AdminMessaging'
import MessagingTestComponent from '@/components/MessagingTestComponent'

// Import other admin components (adjust paths as needed)
// import PhotoManagement from '@/components/PhotoManagement';
// import UserManagement from '@/components/UserManagement';
// import AdminAnalytics from '@/components/AdminAnalytics';

type AdminTab = 'overview' | 'messaging' | 'testing' | 'photos' | 'users' | 'analytics'

const AdminDashboardWithMessaging: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-400">Access Denied</h1>
          <p className="text-white/70">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'messaging', label: 'Send Messages', icon: MessageSquare },
    { id: 'testing', label: 'System Tests', icon: TestTube },
    { id: 'photos', label: 'Photo Management', icon: Camera },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Quick Stats Cards */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Total Residents</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Messages Sent</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Send className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Pending Photos</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Camera className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">System Status</p>
                    <p className="text-2xl font-bold text-green-400">Online</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => setActiveTab('messaging')}
                  className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-teal-500/20 p-6 transition-all duration-300 hover:from-blue-500/30 hover:to-teal-500/30"
                >
                  <MessageSquare className="mb-3 h-8 w-8 text-blue-400" />
                  <h3 className="mb-2 font-semibold text-white">Send Message</h3>
                  <p className="text-sm text-white/70">Send messages to residents</p>
                </button>

                <button
                  onClick={() => setActiveTab('testing')}
                  className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 transition-all duration-300 hover:from-purple-500/30 hover:to-pink-500/30"
                >
                  <TestTube className="mb-3 h-8 w-8 text-purple-400" />
                  <h3 className="mb-2 font-semibold text-white">System Test</h3>
                  <p className="text-sm text-white/70">Test messaging system</p>
                </button>

                <button
                  onClick={() => setActiveTab('photos')}
                  className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 transition-all duration-300 hover:from-green-500/30 hover:to-emerald-500/30"
                >
                  <Camera className="mb-3 h-8 w-8 text-green-400" />
                  <h3 className="mb-2 font-semibold text-white">Review Photos</h3>
                  <p className="text-sm text-white/70">Manage photo submissions</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 rounded-lg bg-white/5 p-4">
                  <Bell className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Messaging system activated</p>
                    <p className="text-sm text-white/60">Ready to send messages to residents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'messaging':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
                <MessageSquare className="mr-3 h-6 w-6 text-blue-400" />
                Send Message to Residents
              </h2>
              <AdminMessaging />
            </div>
          </div>
        )

      case 'testing':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
                <TestTube className="mr-3 h-6 w-6 text-purple-400" />
                System Testing & Verification
              </h2>
              <MessagingTestComponent />
            </div>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
                <Camera className="mr-3 h-6 w-6 text-green-400" />
                Photo Management
              </h2>
              <div className="py-12 text-center">
                <Camera className="mx-auto mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/70">Photo management component goes here</p>
                <p className="mt-2 text-sm text-white/50">
                  Import your existing PhotoManagement component
                </p>
              </div>
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
                <Users className="mr-3 h-6 w-6 text-blue-400" />
                User Management
              </h2>
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/70">User management component goes here</p>
                <p className="mt-2 text-sm text-white/50">
                  Import your existing UserManagement component
                </p>
              </div>
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
                <BarChart3 className="mr-3 h-6 w-6 text-teal-400" />
                Analytics & Reports
              </h2>
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/70">Analytics component goes here</p>
                <p className="mt-2 text-sm text-white/50">
                  Import your existing Analytics component
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70">Manage your SPR-HOA community portal</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Welcome back,</p>
            <p className="font-semibold text-white">Rob</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminDashboardWithMessaging
