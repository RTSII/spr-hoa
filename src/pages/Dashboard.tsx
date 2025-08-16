import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
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
  Moon,
  Droplets,
  Wind,
} from 'lucide-react'
import OwnerInbox from '@/components/OwnerInbox'
import ProfileCard from '@/components/ProfileCard'
import aerialViewImg from '@/assets/images/aerial_view.jpg'
import poolOverheadImg from '@/assets/images/pool_overhead.jpg'

const Dashboard = () => {
  const { profile, user } = useAuth()
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showInbox, setShowInbox] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Events & Activities',
      href: '/calendar',
      icon: Calendar,
      color: 'from-purple-500 via-violet-600 to-indigo-600',
      position: { top: '20%', left: '15%' },
      delay: 0.1,
    },
    {
      id: 'directory',
      title: 'Directory',
      description: 'Resident Directory',
      href: '/directory',
      icon: Users,
      color: 'from-blue-500 via-cyan-600 to-teal-600',
      position: { top: '15%', right: '20%' },
      delay: 0.2,
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Online Applications',
      href: '/forms',
      icon: FileText,
      color: 'from-teal-500 via-emerald-600 to-green-600',
      position: { bottom: '35%', right: '15%' },
      delay: 0.3,
    },
    {
      id: 'photos',
      title: 'Gallery',
      description: 'Community Photos',
      href: '/photos',
      icon: Camera,
      color: 'from-fuchsia-500 via-pink-600 to-rose-600',
      position: { bottom: '20%', left: '20%' },
      delay: 0.4,
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Local Updates',
      href: '/community',
      icon: MessageSquare,
      color: 'from-indigo-500 via-purple-600 to-pink-600',
      position: { top: '45%', left: '10%' },
      delay: 0.5,
    },
    {
      id: 'news',
      title: 'News',
      description: 'HOA Announcements',
      href: '/news',
      icon: Newspaper,
      color: 'from-cyan-500 via-blue-600 to-indigo-600',
      position: { top: '50%', right: '12%' },
      delay: 0.6,
    },
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background with Multiple Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950"></div>

        {/* Aerial view overlay with opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('${aerialViewImg}')`,
            filter: 'blur(1px)',
          }}
        ></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-fuchsia-900/40"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white/20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 8,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Top Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-white/80">78°F • Partly Cloudy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-white/70">12 mph</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white">{formatTime(currentTime)}</div>
              <div className="text-sm text-white/70">{formatDate(currentTime)}</div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInbox(!showInbox)}
                className="relative rounded-full border border-white/20 bg-white/10 p-2 transition-all hover:bg-white/20"
              >
                <Bell className="h-5 w-5 text-white" />
                <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-fuchsia-500"></div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white"
              >
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Welcome Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-16 text-center"
        >
          <motion.h1
            className="mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-6xl font-bold text-transparent md:text-7xl"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Welcome Home
          </motion.h1>
          <motion.p
            className="mb-4 text-2xl text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {profile?.first_name} • Unit {profile?.unit_number}
          </motion.p>
          <motion.div
            className="flex items-center justify-center space-x-2 text-lg text-blue-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Waves className="h-5 w-5 animate-bounce" />
            <span>Sandpiper Run Luxury Oceanfront</span>
            <Waves className="h-5 w-5 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </motion.div>
        </motion.div>

        {/* Feature Navigation Constellation */}
        <div className="relative mx-auto h-96 max-w-6xl">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: feature.delay, type: 'spring', stiffness: 100 }}
                className="absolute"
                style={feature.position}
                onMouseEnter={() => setActiveFeature(feature.id)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <Link to={feature.href}>
                  <motion.div
                    whileHover={{
                      scale: 1.15,
                      rotateY: 15,
                      z: 50,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative h-32 w-32 rounded-3xl border border-white/20 bg-gradient-to-br backdrop-blur-xl ${feature.color} hover:shadow-3xl group cursor-pointer p-1 shadow-2xl transition-all duration-500`}
                    style={{
                      boxShadow:
                        activeFeature === feature.id
                          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.4)'
                          : '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>

                    {/* Content */}
                    <div className="relative flex h-full flex-col items-center justify-center p-4 text-center">
                      <motion.div
                        animate={activeFeature === feature.id ? { rotate: 360 } : {}}
                        transition={{ duration: 0.8 }}
                      >
                        <IconComponent className="mb-2 h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="mb-1 text-sm font-bold text-white">{feature.title}</h3>
                      <p className="text-xs text-white/70">{feature.description}</p>
                    </div>

                    {/* Hover overlay */}
                    <motion.div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.div>
                </Link>

                {/* Feature tooltip */}
                <AnimatePresence>
                  {activeFeature === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 top-full mt-4 -translate-x-1/2 transform whitespace-nowrap rounded-lg border border-white/20 bg-black/80 px-3 py-2 text-sm text-white backdrop-blur-sm"
                    >
                      Click to explore {feature.title}
                      <div className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform border-l border-t border-white/20 bg-black/80"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {/* Central connecting lines (constellation effect) */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(168, 85, 247, 0.3)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)' }} />
              </linearGradient>
            </defs>
            {features.map((feature, index) => {
              const nextFeature = features[(index + 1) % features.length]
              return (
                <motion.line
                  key={`line-${index}`}
                  x1={feature.position.left || `calc(100% - ${feature.position.right})`}
                  y1={feature.position.top || `calc(100% - ${feature.position.bottom})`}
                  x2={nextFeature.position.left || `calc(100% - ${nextFeature.position.right})`}
                  y2={nextFeature.position.top || `calc(100% - ${nextFeature.position.bottom})`}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ delay: 1 + index * 0.1, duration: 1 }}
                />
              )
            })}
          </svg>
        </div>

        {/* Quick Stats Ocean Wave Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-auto max-w-6xl px-4 py-16"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: 'Total Units', value: '165', icon: '🏠' },
              { label: 'Active Events', value: '3', icon: '📅' },
              { label: 'Pool Status', value: 'Open', icon: '🏊‍♀️' },
              { label: 'Beach Access', value: '24/7', icon: '🏖️' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                }}
                className="group rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 text-center backdrop-blur-xl"
              >
                <motion.div
                  className="mb-2 text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="mb-1 text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sliding Inbox Panel */}
      <AnimatePresence>
        {showInbox && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-96 overflow-y-auto border-l border-white/20 bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInbox(false)}
                  className="rounded-full p-2 transition-colors hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              {user && <OwnerInbox user_id={user.id} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding Profile Panel */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-96 overflow-y-auto border-l border-white/20 bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfile(false)}
                  className="rounded-full p-2 transition-colors hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              <div className="origin-top scale-75">
                <ProfileCard
                  name={`${profile?.first_name} ${profile?.last_name}`}
                  title={`Unit ${profile?.unit_number} Owner`}
                  handle={profile?.email?.split('@')[0] || 'owner'}
                  status="Online"
                  contactText="Edit Profile"
                  avatarUrl={`https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=6366f1&color=ffffff&size=400`}
                  onContactClick={() => window.open('/profile', '_blank')}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay when panels are open */}
      <AnimatePresence>
        {(showInbox || showProfile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowInbox(false)
              setShowProfile(false)
            }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
