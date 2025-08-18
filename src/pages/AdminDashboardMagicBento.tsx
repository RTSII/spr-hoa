import React, { useState, useEffect, useRef } from 'react'
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
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AdminMessaging from '@/components/AdminMessaging'
import AdminEmailSystem from '@/components/AdminEmailSystem'
import NewsManagementSystem from '@/components/NewsManagementSystem'
import PhotoApprovalSystem from '@/components/PhotoApprovalSystem'
import UserManagementSystem from '@/components/UserManagementSystem'
import MCPDashboard from '@/components/MCPDashboard'
import { BentoCard } from '@/components/magicui'
import { MCPProvider } from '@/contexts/MCPContext'

import { adminService, AdminStats } from '@/lib/adminService'

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
  const navigate = useNavigate()
  // Overview grid (wide rectangular, no scaling)
  const gridWrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Admin stats for overview cards
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (activeTab === 'overview') {
      setLoadingStats(true)
      adminService
        .getAdminDashboardStats()
        .then((data) => {
          if (!isMounted) return
          setStats(data)
          setStatsError(null)
        })
        .catch((e: any) => {
          if (!isMounted) return
          setStatsError(e?.message || 'Failed to load stats')
        })
        .finally(() => {
          if (!isMounted) return
          setLoadingStats(false)
        })
      return () => {}
    }
    return () => {
      isMounted = false
    }
  }, [activeTab])

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
              ref={gridWrapRef}
              className="w-full"
              style={{
                // Wide rectangular grid: two rows, many columns. No scaling.
                ['--gap' as any]: '12px',
                ['--gridH' as any]: 'min(680px, calc(100svh - 220px))',
                // Larger container width within viewport
                maxWidth: 'min(1440px, 96vw)',
                marginInline: 'auto',
              }}
            >
              {statsError && (
                <div className="mb-2 text-center text-[11px] text-red-300">
                  Failed to load stats. Some counts may be unavailable.
                </div>
              )}
              <BentoCard
                className="w-full p-3 md:p-4"
                glowColor="59, 130, 246"
                spotlightRadius={200}
                enableTilt={false}
                enableMagnetism={false}
                enableStars={false}
              >
                <div
                  ref={gridRef}
                  className="grid"
                  style={
                    {
                      // 12 columns, 2 rows layout for a wide rectangle
                      gridTemplateColumns: 'repeat(12, 1fr)',
                      gridTemplateRows: 'repeat(2, 1fr)',
                      gap: 'var(--gap)',
                      height: 'var(--gridH)',
                    } as React.CSSProperties
                  }
                >
                  {/* Message Center Card (largest square) */}
                  <BentoCard
                    className="col-span-6 row-span-2 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={200}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('messaging')}
                  >
                    <div className="relative flex h-full flex-col">
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] text-blue-200 md:text-xs">
                          {loadingStats ? '…' : stats ? stats.messages_sent : '-'}
                        </span>
                      </div>
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-blue-400 md:mr-2 md:h-4 md:w-4" />
                        Message Center
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">
                        Open inbox and email tools
                      </p>
                    </div>
                  </BentoCard>

                  {/* News Management Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('news')}
                  >
                    <div className="relative flex h-full flex-col">
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[11px] text-pink-200 md:text-xs">
                          {loadingStats ? '…' : stats ? stats.published_news : '-'}
                        </span>
                      </div>
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <Newspaper className="mr-1.5 h-3 w-3 text-pink-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        News
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">Create/Edit Posts</p>
                    </div>
                  </BentoCard>

                  {/* Owner Management Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="relative flex h-full flex-col">
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[11px] text-green-200 md:text-xs">
                          {loadingStats ? '…' : stats ? stats.total_users : '-'}
                        </span>
                      </div>
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <Users className="mr-1.5 h-3 w-3 text-green-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Owners
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">Manage Owners</p>
                    </div>
                  </BentoCard>

                  {/* Photo Management Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('photos')}
                  >
                    <div className="relative flex h-full flex-col">
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-[11px] text-yellow-200 md:text-xs">
                          {loadingStats ? '…' : stats ? stats.pending_photos : '-'}
                        </span>
                      </div>
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <Camera className="mr-1.5 h-3 w-3 text-yellow-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Photos
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">Manage Photos</p>
                    </div>
                  </BentoCard>

                  {/* System Settings Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('settings')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <Settings className="mr-1.5 h-3 w-3 text-indigo-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Settings
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">System Settings</p>
                    </div>
                  </BentoCard>
                  {/* ReactBits MCP Integration Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => setActiveTab('mcp')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <Server className="mr-1.5 h-3 w-3 text-cyan-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        ReactBits MCP
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">
                        Realtime integration
                      </p>
                    </div>
                  </BentoCard>
                  {/* Admin Analytics Card (square) */}
                  <BentoCard
                    className="col-span-2 row-span-1 h-full cursor-pointer select-none p-3 md:p-4"
                    glowColor="59, 130, 246"
                    spotlightRadius={150}
                    enableStars={false}
                    enableTilt={true}
                    enableMagnetism={true}
                    enableBorderGlow
                    onClick={() => navigate('/admin/analytics')}
                  >
                    <div className="flex h-full flex-col">
                      <h2 className="mb-1.5 flex items-center text-sm font-bold text-white md:mb-2 md:text-base">
                        <BarChart3 className="mr-1.5 h-3 w-3 text-teal-400 md:mr-2 md:h-3.5 md:w-3.5" />
                        Admin Analytics
                      </h2>
                      <p className="text-xs text-white/70 md:text-sm">Open analytics</p>
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <MessageSquare className="mr-3 h-6 w-6 text-blue-400" />
                  Message Center
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Newspaper className="mr-3 h-6 w-6 text-pink-400" />
                  News Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Camera className="mr-3 h-6 w-6 text-yellow-400" />
                  Photo Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <PhotoApprovalSystem onClose={() => setActiveTab('overview')} />
            </BentoCard>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-8">
            <BentoCard
              className="p-8"
              glowColor="16, 185, 129"
              enableTilt={false}
              enableMagnetism={false}
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Users className="mr-3 h-6 w-6 text-green-400" />
                  Owner Management
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <UserManagementSystem />
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <Settings className="mr-3 h-6 w-6 text-indigo-400" />
                  System Settings
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <BentoCard
                  className="p-6"
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={false}
                  enableBorderGlow
                >
                  <div className="flex h-full flex-col">
                    <h3 className="mb-2 flex items-center text-lg font-semibold text-white">
                      <Settings className="mr-2 h-5 w-5 text-indigo-400" />
                      General Settings
                    </h3>
                    <p className="text-white/70">System settings component goes here</p>
                  </div>
                </BentoCard>
                <BentoCard
                  className="p-6"
                  enableTilt={false}
                  enableMagnetism={false}
                  enableStars={false}
                  enableBorderGlow
                >
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <BarChart3 className="mr-3 h-6 w-6 text-teal-400" />
                  Analytics & Reports
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
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
              enableStars={false}
              enableBorderGlow
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-2xl font-bold text-white">
                  <TestTube className="mr-3 h-6 w-6 text-purple-400" />
                  System Testing & Verification
                </h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-4 w-4" />
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
                enableStars={false}
                enableBorderGlow
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center text-2xl font-bold text-white">
                    <Server className="mr-3 h-6 w-6 text-cyan-400" />
                    ReactBits MCP Integration
                  </h2>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white"
                    aria-label="Close"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
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
    <div className="min-h-screen overflow-hidden bg-black p-3 md:p-6">
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
