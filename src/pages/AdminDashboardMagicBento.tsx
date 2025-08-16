import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MessageSquare,
  Camera,
  Settings,
  BarChart3,
  Newspaper,
  TestTube,
  Server,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AdminMessaging from '@/components/AdminMessaging'
import AdminEmailSystem from '@/components/AdminEmailSystem'
import NewsManagementSystem from '@/components/NewsManagementSystem'
import PhotoApprovalSystem from '@/components/PhotoApprovalSystem'
import UserManagementSystem from '@/components/UserManagementSystem'
import MCPDashboard from '@/components/MCPDashboard'
import { BentoCard } from '@/components/magicui'
import { MCPProvider } from '@/contexts/MCPContext'

type AdminTab =
  | 'overview'
  | 'messaging'
  | 'news'
  | 'photos'
  | 'users'
  | 'settings'
  | 'analytics'
  | 'testing'
  | 'mcp'

const AdminDashboardMagicBento: React.FC = () => {
  const { user: _user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  // Sub-tab for Message Center
  const [messageSubTab, setMessageSubTab] = useState<'site' | 'email'>('site')


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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex w-full justify-center">
            <div
              className="w-full"
              style={{
                // horizontal-first sizing, with height safety clamp
                ['--gap' as any]: '12px',
                ['--avail' as any]: 'calc(100svh - 360px)', // space kept for hero/header
                // target width prefers wide rectangle; clamp by height-derived width and viewport width
                maxWidth: 'min(1100px, 90vw, calc(2 * var(--avail) + var(--gap)))',
              }}
            >
              <BentoCard
                className="w-full p-2 md:p-2.5"
                glowColor="59, 130, 246"
                spotlightRadius={200}
                enableTilt={false}
                enableMagnetism={false}
              >
                <div
                  className="grid"
                  style={
                    {
                      // square size derives from container width
                      gridTemplateColumns: 'repeat(4, calc((100% - var(--gap) * 3) / 4))',
                      gridAutoRows: 'calc((100% - var(--gap) * 3) / 4)',
                      gap: 'var(--gap)',
                    } as React.CSSProperties
                  }
                >
                  {/* Message Center Card (largest square) */}
                  <BentoCard
                    className="aspect-square col-span-2 row-span-2 cursor-pointer select-none p-2 md:p-2.5"
                    glowColor="59, 130, 246"
                    spotlightRadius={200}
                    onClick={() => setActiveTab('messaging')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-sm font-bold text-white md:mb-1 md:text-base">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-blue-400 md:mr-2 md:h-4 md:w-4" />
                        Message Center
                      </h2>
                      <p className="text-[10px] text-white/60 md:text-[10.5px]">
                        Open inbox and email tools
                      </p>
                    </div>
                  </BentoCard>

                  {/* News Management Card (square) */}
                  <BentoCard
                    className="aspect-square col-span-1 row-span-1 cursor-pointer select-none p-2 md:p-2"
                    glowColor="236, 72, 153"
                    spotlightRadius={150}
                    onClick={() => setActiveTab('news')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-xs font-bold text-white md:mb-1 md:text-sm">
                        <Newspaper className="mr-1.5 h-3 w-3 text-pink-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        News
                      </h2>
                      <p className="text-[9.5px] text-white/60 md:text-[10px]">Create/Edit Posts</p>
                    </div>
                  </BentoCard>

                  {/* Owner Management Card (square) */}
                  <BentoCard
                    className="aspect-square col-span-1 row-span-1 cursor-pointer select-none p-2 md:p-2.5"
                    glowColor="16, 185, 129"
                    spotlightRadius={150}
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-xs font-bold text-white md:mb-1 md:text-sm">
                        <Users className="mr-1.5 h-3 w-3 text-green-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Owners
                      </h2>
                      <p className="text-[9.5px] text-white/60 md:text-[10px]">Manage Owners</p>
                    </div>
                  </BentoCard>

                  {/* Photo Management Card (square) */}
                  <BentoCard
                    className="aspect-square col-span-1 row-span-1 cursor-pointer select-none p-2 md:p-2.5"
                    glowColor="245, 158, 11"
                    spotlightRadius={150}
                    onClick={() => setActiveTab('photos')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-xs font-bold text-white md:mb-1 md:text-sm">
                        <Camera className="mr-1.5 h-3 w-3 text-yellow-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Photos
                      </h2>
                      <p className="text-[9.5px] text-white/60 md:text-[10px]">Manage Photos</p>
                    </div>
                  </BentoCard>

                  {/* System Settings Card (square) */}
                  <BentoCard
                    className="aspect-square col-span-1 row-span-1 cursor-pointer select-none p-2 md:p-2.5"
                    glowColor="99, 102, 241"
                    spotlightRadius={150}
                    onClick={() => setActiveTab('settings')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-xs font-bold text-white md:mb-1 md:text-sm">
                        <Settings className="mr-1.5 h-3 w-3 text-indigo-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Settings
                      </h2>
                      <p className="text-[9.5px] text-white/60 md:text-[10px]">System Settings</p>
                    </div>
                  </BentoCard>
                  {/* ReactBits MCP Integration Card (square) */}
                  <BentoCard
                    className="aspect-square col-span-1 row-span-1 cursor-pointer select-none p-2 md:p-2.5"
                    glowColor="14, 165, 233"
                    spotlightRadius={150}
                    onClick={() => setActiveTab('mcp')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1 flex items-center text-xs font-bold text-white md:mb-1 md:text-sm">
                        <Server className="mr-1.5 h-3 w-3 text-cyan-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        ReactBits MCP
                      </h2>
                      <p className="text-[9.5px] text-white/60 md:text-[10px]">
                        Realtime integration
                      </p>
                    </div>
                  </BentoCard>
                </div>
              </BentoCard>
            </div>
          </div>
        )

      case 'messaging':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="59, 130, 246"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <MessageSquare className="mr-3 h-6 w-6 text-blue-400" />
                  Message Center
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Segmented control for Site Messages vs Send Email */}
              <div className="mb-6">
                <div className="inline-flex rounded-lg border border-white/20 bg-white/5 p-1">
                  <button
                    onClick={() => setMessageSubTab('site')}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      messageSubTab === 'site'
                        ? 'border border-blue-500/40 bg-blue-500/20 text-blue-200'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Site Messages
                  </button>
                  <button
                    onClick={() => setMessageSubTab('email')}
                    className={`ml-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      messageSubTab === 'email'
                        ? 'border border-purple-500/40 bg-purple-500/20 text-purple-200'
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
                  {messageSubTab === 'site' ? <AdminMessaging /> : <AdminEmailSystem />}
                </motion.div>
              </AnimatePresence>
            </BentoCard>
          </div>
        )

      case 'news':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="236, 72, 153"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Newspaper className="mr-3 h-6 w-6 text-pink-400" />
                  News Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <NewsManagementSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="245, 158, 11"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Camera className="mr-3 h-6 w-6 text-yellow-400" />
                  Photo Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <PhotoApprovalSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-8">
            <BentoCard className="p-8" glowColor="16, 185, 129">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Users className="mr-3 h-6 w-6 text-green-400" />
                  Owner Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <UserManagementSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="99, 102, 241"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Settings className="mr-3 h-6 w-6 text-indigo-400" />
                  System Settings
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <BentoCard className="p-6" enableTilt={false} enableMagnetism={false}>
                  <div className="flex h-full flex-col">
                    <h3 className="mb-2 flex items-center text-lg font-semibold text-white">
                      <Settings className="mr-2 h-5 w-5 text-indigo-400" />
                      General Settings
                    </h3>
                    <p className="text-white/70">System settings component goes here</p>
                  </div>
                </BentoCard>
                <BentoCard className="p-6" enableTilt={false} enableMagnetism={false}>
                  <div className="flex h-full flex-col">
                    <h3 className="mb-2 flex items-center text-lg font-semibold text-white">
                      <BarChart3 className="mr-2 h-5 w-5 text-teal-400" />
                      Analytics & Reports
                    </h3>
                    <p className="text-white/70">Analytics dashboard component goes here</p>
                  </div>
                </BentoCard>
              </div>
            </BentoCard>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="13, 148, 136"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <BarChart3 className="mr-3 h-6 w-6 text-teal-400" />
                  Analytics & Reports
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/70">Analytics dashboard component goes here</p>
              </div>
            </BentoCard>
          </div>
        )

      case 'testing':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="163, 163, 163"
              enableTilt={false}
              enableMagnetism={false}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <TestTube className="mr-3 h-6 w-6 text-purple-400" />
                  System Testing & Verification
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-white/70 transition-colors duration-200 hover:text-white"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="py-12 text-center">
                <TestTube className="mx-auto mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/70">Testing components go here</p>
              </div>
            </BentoCard>
          </div>
        )

      case 'mcp':
        return (
          <MCPProvider>
            <div className="space-y-8">
              <BentoCard
                className="p-8"
                glowColor="14, 165, 233"
                enableTilt={false}
                enableMagnetism={false}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center text-2xl font-bold text-white">
                    <Server className="mr-3 h-6 w-6 text-cyan-400" />
                    ReactBits MCP Integration
                  </h2>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Back to Dashboard
                  </button>
                </div>
                <MCPDashboard onClose={() => setActiveTab('overview')} />
              </BentoCard>
            </div>
          </MCPProvider>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3 md:p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-white/70 md:text-base">
              Manage your SPR-HOA community portal
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 md:text-sm">Welcome back,</p>
            <p className="text-sm font-semibold text-white md:text-base">Rob</p>
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
  )
}

export default AdminDashboardMagicBento
