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
  Wind
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
      delay: 0.1
    },
    {
      id: 'directory',
      title: 'Directory',
      description: 'Resident Directory',
      href: '/directory',
      icon: Users,
      color: 'from-blue-500 via-cyan-600 to-teal-600',
      position: { top: '15%', right: '20%' },
      delay: 0.2
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Online Applications',
      href: '/forms',
      icon: FileText,
      color: 'from-teal-500 via-emerald-600 to-green-600',
      position: { bottom: '35%', right: '15%' },
      delay: 0.3
    },
    {
      id: 'photos',
      title: 'Gallery',
      description: 'Community Photos',
      href: '/photos',
      icon: Camera,
      color: 'from-fuchsia-500 via-pink-600 to-rose-600',
      position: { bottom: '20%', left: '20%' },
      delay: 0.4
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Local Updates',
      href: '/community',
      icon: MessageSquare,
      color: 'from-indigo-500 via-purple-600 to-pink-600',
      position: { top: '45%', left: '10%' },
      delay: 0.5
    },
    {
      id: 'news',
      title: 'News',
      description: 'HOA Announcements',
      href: '/news',
      icon: Newspaper,
      color: 'from-cyan-500 via-blue-600 to-indigo-600',
      position: { top: '50%', right: '12%' },
      delay: 0.6
    }
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background with Multiple Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950"></div>

        {/* Aerial view overlay with opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('${aerialViewImg}')`,
            filter: 'blur(1px)'
          }}
        ></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-fuchsia-900/40 animate-pulse"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 8
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
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
          className="backdrop-blur-xl bg-white/5 border-b border-white/10 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-yellow-400" />
                <span className="text-white/80 text-sm">78°F • Partly Cloudy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-blue-300" />
                <span className="text-white/70 text-sm">12 mph</span>
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
                className="relative p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Bell className="h-5 w-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-500 rounded-full animate-pulse"></div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white/30"
              >
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Welcome Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16 px-4"
        >
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Welcome Home
          </motion.h1>
          <motion.p
            className="text-2xl text-white/80 mb-4"
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
        <div className="relative h-96 mx-auto max-w-6xl">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: feature.delay, type: "spring", stiffness: 100 }}
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
                      z: 50
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative w-32 h-32 rounded-3xl backdrop-blur-xl border border-white/20
                      bg-gradient-to-br ${feature.color} p-1
                      shadow-2xl hover:shadow-3xl transition-all duration-500
                      group cursor-pointer
                    `}
                    style={{
                      boxShadow: activeFeature === feature.id
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.4)'
                        : '0 10px 25px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
                      <motion.div
                        animate={activeFeature === feature.id ? { rotate: 360 } : {}}
                        transition={{ duration: 0.8 }}
                      >
                        <IconComponent className="h-8 w-8 text-white mb-2" />
                      </motion.div>
                      <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
                      <p className="text-white/70 text-xs">{feature.description}</p>
                    </div>

                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.div>
                </Link>

                {/* Feature tooltip */}
                <AnimatePresence>
                  {activeFeature === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-3 py-2 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap backdrop-blur-sm border border-white/20"
                    >
                      Click to explore {feature.title}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-t border-white/20"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {/* Central connecting lines (constellation effect) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
          className="max-w-6xl mx-auto px-4 py-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Units', value: '165', icon: '🏠' },
              { label: 'Active Events', value: '3', icon: '📅' },
              { label: 'Pool Status', value: 'Open', icon: '🏊‍♀️' },
              { label: 'Beach Access', value: '24/7', icon: '🏖️' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10
                }}
                className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 text-center group"
              >
                <motion.div
                  className="text-3xl mb-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 backdrop-blur-xl bg-slate-900/95 border-l border-white/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInbox(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 backdrop-blur-xl bg-slate-900/95 border-l border-white/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfile(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              <div className="scale-75 origin-top">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
