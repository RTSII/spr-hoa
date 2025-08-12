import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Camera, Settings, BarChart3, Newspaper, TestTube } from 'lucide-react';
import { searchAdminDashboardEvents } from '@/lib/supermemory';
import { useAuth } from '@/contexts/AuthContext';
import AdminMessaging from '@/components/AdminMessaging';
import AdminEmailSystem from '@/components/AdminEmailSystem';
import NewsManagementSystem from '@/components/NewsManagementSystem';
import PhotoApprovalSystem from '@/components/PhotoApprovalSystem';
import UserManagementSystem from '@/components/UserManagementSystem';
import { BentoGrid, BentoCard } from '@/components/magicui';

type AdminTab = 'overview' | 'messaging' | 'news' | 'photos' | 'users' | 'settings' | 'analytics' | 'testing';

const AdminDashboardMagicBento: React.FC = () => {
  const { user: _user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  // Sub-tab for Message Center
  const [messageSubTab, setMessageSubTab] = useState<'site' | 'email'>('site');
  
  // Supermemory.ai search state
  const [supermemoryQuery, _setSupermemoryQuery] = useState('');
  const [supermemoryResults, _setSupermemoryResults] = useState<any[]>([]);
  const [searching, _setSearching] = useState(false);

  const _handleAdminSearch = async () => {
    if (!supermemoryQuery.trim()) return;
    
    _setSearching(true);
    try {
      const results = await searchAdminDashboardEvents(supermemoryQuery);
      _setSupermemoryResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Supermemory admin search failed:', err);
      _setSupermemoryResults([]);
    } finally {
      _setSearching(false);
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
          <div className="w-full flex justify-center">
            <div
              className="w-full"
              style={{
                // horizontal-first sizing, with height safety clamp
                ['--gap' as any]: '12px',
                ['--avail' as any]: 'calc(100svh - 360px)', // space kept for hero/header
                // target width prefers wide rectangle; clamp by height-derived width and viewport width
                maxWidth: 'min(1100px, 90vw, calc(2 * var(--avail) + var(--gap)))'
              }}
            >
              <BentoCard
                className="p-2 md:p-2.5 w-full"
                glowColor="59, 130, 246"
                spotlightRadius={200}
                enableTilt={false}
                enableMagnetism={false}
              >
              <div
                className="grid"
                style={{
                  // square size derives from container width
                  gridTemplateColumns: 'repeat(4, calc((100% - var(--gap) * 3) / 4))',
                  gridAutoRows: 'calc((100% - var(--gap) * 3) / 4)',
                  gap: 'var(--gap)'
                } as React.CSSProperties}
              >
                {/* Message Center Card (largest square) */}
                <BentoCard 
                  className="col-span-2 row-span-2 p-2 md:p-2.5 cursor-pointer select-none aspect-square"
                  glowColor="59, 130, 246"
                  spotlightRadius={200}
                  onClick={() => setActiveTab('messaging')}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-sm md:text-base font-bold text-white mb-1 md:mb-1 flex items-center">
                      <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-blue-400" />
                      Message Center
                    </h2>
                    <p className="text-white/60 text-[10px] md:text-[10.5px]">Open inbox and email tools</p>
                  </div>
                </BentoCard>

                {/* News Management Card (square) */}
                <BentoCard 
                  className="col-span-1 row-span-1 p-2 cursor-pointer select-none aspect-square md:p-2"
                  glowColor="236, 72, 153"
                  spotlightRadius={150}
                  onClick={() => setActiveTab('news')}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1 flex items-center">
                      <Newspaper className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-pink-400" />
                      News
                    </h2>
                    <p className="text-white/60 text-[9.5px] md:text-[10px]">Create/Edit Posts</p>
                  </div>
                </BentoCard>

                {/* Owner Management Card (square) */}
                <BentoCard 
                  className="col-span-1 row-span-1 p-2 cursor-pointer select-none aspect-square md:p-2.5"
                  glowColor="16, 185, 129"
                  spotlightRadius={150}
                  onClick={() => setActiveTab('users')}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1 flex items-center">
                      <Users className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-green-400" />
                      Owners
                    </h2>
                    <p className="text-white/60 text-[9.5px] md:text-[10px]">Manage Owners</p>
                  </div>
                </BentoCard>

                {/* Photo Management Card (square) */}
                <BentoCard 
                  className="col-span-1 row-span-1 p-2 cursor-pointer select-none aspect-square md:p-2.5"
                  glowColor="245, 158, 11"
                  spotlightRadius={150}
                  onClick={() => setActiveTab('photos')}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1 flex items-center">
                      <Camera className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-yellow-400" />
                      Photos
                    </h2>
                    <p className="text-white/60 text-[9.5px] md:text-[10px]">Manage Photos</p>
                  </div>
                </BentoCard>

                {/* System Settings Card (square) */}
                <BentoCard 
                  className="col-span-1 row-span-1 p-2 cursor-pointer select-none aspect-square md:p-2.5"
                  glowColor="99, 102, 241"
                  spotlightRadius={150}
                  onClick={() => setActiveTab('settings')}
                >
                  <div className="flex flex-col h-full">
                    <h2 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1 flex items-center">
                      <Settings className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-indigo-400" />
                      Settings
                    </h2>
                    <p className="text-white/60 text-[9.5px] md:text-[10px]">System Settings</p>
                  </div>
                </BentoCard>
              </div>
              </BentoCard>
            </div>
          </div>
        );

      case 'messaging':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="59, 130, 246" enableTilt={false} enableMagnetism={false}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-400" />
                  Message Center
                </h2>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Segmented control for Site Messages vs Send Email */}
              <div className="mb-6">
                <div className="inline-flex rounded-lg border border-white/20 bg-white/5 p-1">
                  <button
                    onClick={() => setMessageSubTab('site')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      messageSubTab === 'site'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Site Messages
                  </button>
                  <button
                    onClick={() => setMessageSubTab('email')}
                    className={`ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      messageSubTab === 'email'
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Send Email
                  </button>
                </div>
              </div>

              {/* Sub-tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageSubTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {messageSubTab === 'site' ? (
                    <AdminMessaging />
                  ) : (
                    <AdminEmailSystem />
                  )}
                </motion.div>
              </AnimatePresence>
            </BentoCard>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="236, 72, 153" enableTilt={false} enableMagnetism={false}>
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
              <NewsManagementSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="245, 158, 11" enableTilt={false} enableMagnetism={false}>
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
              <PhotoApprovalSystem onClose={() => setActiveTab('overview')} />
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
              <UserManagementSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="99, 102, 241" enableTilt={false} enableMagnetism={false}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BentoCard className="p-6" enableTilt={false} enableMagnetism={false}>
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-indigo-400" />
                      General Settings
                    </h3>
                    <p className="text-white/70">System settings component goes here</p>
                  </div>
                </BentoCard>
                <BentoCard className="p-6" enableTilt={false} enableMagnetism={false}>
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-teal-400" />
                      Analytics & Reports
                    </h3>
                    <p className="text-white/70">Analytics dashboard component goes here</p>
                  </div>
                </BentoCard>
              </div>
            </BentoCard>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="13, 148, 136" enableTilt={false} enableMagnetism={false}>
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
            <BentoCard className="p-8" glowColor="163, 163, 163" enableTilt={false} enableMagnetism={false}>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3 md:p-6 overflow-hidden">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-white/70 text-sm md:text-base">Manage your SPR-HOA community portal</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs md:text-sm">Welcome back,</p>
            <p className="text-white font-semibold text-sm md:text-base">Rob Stevens</p>
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
