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
  FileText,
  Newspaper,
  LayoutTemplate,
  Search
} from 'lucide-react';
import { searchAdminDashboardEvents } from '@/lib/supermemory';
import { useAuth } from '@/contexts/AuthContext';
import AdminMessaging from '@/components/AdminMessaging';
import AdminEmailSystem from '@/components/AdminEmailSystem';
import NewsManagementSystem from '@/components/NewsManagementSystem';
import PhotoApprovalSystem from '@/components/PhotoApprovalSystem';
import UserManagementSystem from '@/components/UserManagementSystem';
import { BentoGrid, BentoCard } from '@/components/magicui';

type AdminTab = 'overview' | 'messaging' | 'news' | 'photos' | 'users' | 'settings' | 'analytics';

const AdminDashboardMagicBento: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Supermemory.ai search state
  const [supermemoryQuery, setSupermemoryQuery] = useState('');
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleAdminSearch = async () => {
    if (!supermemoryQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchAdminDashboardEvents(supermemoryQuery);
      setSupermemoryResults(results || []);
    } catch (err) {
      console.error('Supermemory admin search failed:', err);
      setSupermemoryResults([]);
    } finally {
      setSearching(false);
    }
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <BentoGrid className="gap-6">
            {/* Message Center Card */}
            <BentoCard 
              className="col-span-2 row-span-2 p-6"
              glowColor="59, 130, 246"
              spotlightRadius={200}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                  Message Center
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  <button
                    onClick={() => setActiveTab('messaging')}
                    className="p-4 bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-teal-500/30 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <Send className="h-8 w-8 text-blue-400 mb-2" />
                    <h3 className="text-white font-semibold">Site Messaging</h3>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('messaging')}
                    className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 flex flex-col items-center justify-center"
                  >
                    <LayoutTemplate className="h-8 w-8 text-purple-400 mb-2" />
                    <h3 className="text-white font-semibold">Send Email</h3>
                  </button>
                </div>
              </div>
            </BentoCard>

            {/* News Management Card */}
            <BentoCard 
              className="col-span-1 row-span-1 p-6"
              glowColor="236, 72, 153"
              spotlightRadius={150}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <Newspaper className="h-5 w-5 mr-2 text-pink-400" />
                  News
                </h2>
                <button
                  onClick={() => setActiveTab('news')}
                  className="mt-2 p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-lg hover:from-pink-500/30 hover:to-rose-500/30 transition-all duration-300 flex-grow flex flex-col items-center justify-center"
                >
                  <span className="text-white text-sm">Create/Edit Posts</span>
                </button>
              </div>
            </BentoCard>

            {/* Owner Management Card */}
            <BentoCard 
              className="col-span-1 row-span-1 p-6"
              glowColor="16, 185, 129"
              spotlightRadius={150}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-400" />
                  Owners
                </h2>
                <button
                  onClick={() => setActiveTab('users')}
                  className="mt-2 p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 flex-grow flex flex-col items-center justify-center"
                >
                  <span className="text-white text-sm">Manage Owners</span>
                </button>
              </div>
            </BentoCard>

            {/* Photo Management Card */}
            <BentoCard 
              className="col-span-1 row-span-1 p-6"
              glowColor="245, 158, 11"
              spotlightRadius={150}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-yellow-400" />
                  Photos
                </h2>
                <button
                  onClick={() => setActiveTab('photos')}
                  className="mt-2 p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg hover:from-yellow-500/30 hover:to-amber-500/30 transition-all duration-300 flex-grow flex flex-col items-center justify-center"
                >
                  <span className="text-white text-sm">Manage Photos</span>
                </button>
              </div>
            </BentoCard>

            {/* System Settings Card */}
            <BentoCard 
              className="col-span-1 row-span-1 p-6"
              glowColor="99, 102, 241"
              spotlightRadius={150}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-400" />
                  Settings
                </h2>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="mt-2 p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 flex-grow flex flex-col items-center justify-center"
                >
                  <span className="text-white text-sm">System Settings</span>
                </button>
              </div>
            </BentoCard>

            {/* Analytics Dashboard Card */}
            <BentoCard 
              className="col-span-2 row-span-1 p-6"
              glowColor="13, 148, 136"
              spotlightRadius={200}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-teal-400" />
                  Analytics Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-lg hover:from-teal-500/30 hover:to-cyan-500/30 transition-all duration-300"
                  >
                    <span className="text-white text-sm">View Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('testing')}
                    className="p-3 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-fuchsia-500/30 transition-all duration-300"
                  >
                    <TestTube className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                    <span className="text-white text-sm">System Tests</span>
                  </button>
                  
                  <div className="p-3 bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-white/70 text-sm">Testing Features</span>
                  </div>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        );

      case 'messaging':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="59, 130, 246">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                  Send Message to Residents
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <AdminMessaging />
            </BentoCard>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="236, 72, 153">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Newspaper className="h-6 w-6 mr-3 text-pink-400" />
                  News Management
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <NewsManagementSystem />
            </BentoCard>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="245, 158, 11">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Camera className="h-6 w-6 mr-3 text-yellow-400" />
                  Photo Management
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <PhotoApprovalSystem />
            </BentoCard>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="16, 185, 129">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3 text-green-400" />
                  Owner Management
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <UserManagementSystem />
            </BentoCard>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="99, 102, 241">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Settings className="h-6 w-6 mr-3 text-indigo-400" />
                  System Settings
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">System settings component goes here</p>
              </div>
            </BentoCard>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="13, 148, 136">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-teal-400" />
                  Analytics & Reports
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">Analytics dashboard component goes here</p>
              </div>
            </BentoCard>
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="163, 163, 163">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <TestTube className="h-6 w-6 mr-3 text-purple-400" />
                  System Testing & Verification
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="text-center py-12">
                <TestTube className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/70">Testing components go here</p>
              </div>
            </BentoCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage your SPR-HOA community portal</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <p className="text-white font-semibold">Rob Stevens</p>
          </div>
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

export default AdminDashboardMagicBento;
