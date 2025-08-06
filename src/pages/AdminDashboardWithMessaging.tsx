import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminMessaging from '@/components/AdminMessaging';
import MessagingTestComponent from '@/components/MessagingTestComponent';

// Import other admin components (adjust paths as needed)
// import PhotoManagement from '@/components/PhotoManagement';
// import UserManagement from '@/components/UserManagement';
// import AdminAnalytics from '@/components/AdminAnalytics';

type AdminTab = 'overview' | 'messaging' | 'testing' | 'photos' | 'users' | 'analytics';

const AdminDashboardWithMessaging: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-white/70">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'messaging', label: 'Send Messages', icon: MessageSquare },
    { id: 'testing', label: 'System Tests', icon: TestTube },
    { id: 'photos', label: 'Photo Management', icon: Camera },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick Stats Cards */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Residents</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Messages Sent</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Send className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Pending Photos</p>
                    <p className="text-2xl font-bold text-white">--</p>
                  </div>
                  <Camera className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">System Status</p>
                    <p className="text-2xl font-bold text-green-400">Online</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('messaging')}
                  className="p-6 bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-teal-500/30 transition-all duration-300"
                >
                  <MessageSquare className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Send Message</h3>
                  <p className="text-white/70 text-sm">Send messages to residents</p>
                </button>

                <button
                  onClick={() => setActiveTab('testing')}
                  className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <TestTube className="h-8 w-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">System Test</h3>
                  <p className="text-white/70 text-sm">Test messaging system</p>
                </button>

                <button
                  onClick={() => setActiveTab('photos')}
                  className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
                >
                  <Camera className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Review Photos</h3>
                  <p className="text-white/70 text-sm">Manage photo submissions</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Messaging system activated</p>
                    <p className="text-white/60 text-sm">Ready to send messages to residents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'messaging':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                Send Message to Residents
              </h2>
              <AdminMessaging />
            </div>
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TestTube className="h-6 w-6 mr-3 text-purple-400" />
                System Testing & Verification
              </h2>
              <MessagingTestComponent />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Camera className="h-6 w-6 mr-3 text-green-400" />
                Photo Management
              </h2>
              <div className="text-center py-12">
                <Camera className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">Photo management component goes here</p>
                <p className="text-white/50 text-sm mt-2">
                  Import your existing PhotoManagement component
                </p>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-400" />
                User Management
              </h2>
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">User management component goes here</p>
                <p className="text-white/50 text-sm mt-2">
                  Import your existing UserManagement component
                </p>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-teal-400" />
                Analytics & Reports
              </h2>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">Analytics component goes here</p>
                <p className="text-white/50 text-sm mt-2">
                  Import your existing Analytics component
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage your SPR-HOA community portal</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <p className="text-white font-semibold">Rob Stevens</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
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
  );
};

export default AdminDashboardWithMessaging;
