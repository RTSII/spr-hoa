import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { profile } = useAuth()

  const quickLinks = [
    {
      title: 'Calendar',
      description: 'View upcoming events and activities',
      href: '/calendar',
      icon: '📅',
      color: 'from-ocean to-seafoam',
    },
    {
      title: 'Community Feed',
      description: 'Stay updated with local happenings',
      href: '/community',
      icon: '💬',
      color: 'from-seafoam to-ocean',
    },
    {
      title: 'Online Forms',
      description: 'Access and submit important forms',
      href: '/forms',
      icon: '📋',
      color: 'from-ocean to-royal-blue',
    },
    {
      title: 'Photo Gallery',
      description: 'Browse community photos',
      href: '/photos',
      icon: '📸',
      color: 'from-royal-blue to-ocean',
    },
  ]

  const recentNews = [
    {
      title: 'Beach Restoration Update',
      date: 'December 15, 2024',
      preview: 'The beach restoration project is progressing well...',
    },
    {
      title: 'Holiday Schedule',
      date: 'December 10, 2024',
      preview: 'Please note the updated holiday schedule for amenities...',
    },
    {
      title: 'New Pool Hours',
      date: 'December 5, 2024',
      preview: 'Starting January 1st, the pool hours will be extended...',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-4xl font-display font-bold text-white mb-4">
          Welcome to Sandpiper Run
        </h1>
        <p className="text-xl text-white/80">
          Hello {profile?.first_name || 'Owner'}, Unit {profile?.unit_number}
        </p>
        <p className="text-white/60 mt-2">
          Your gateway to community information and services
        </p>
      </motion.div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={link.href}
              className="block h-full glass-card p-6 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className={`text-5xl mb-4 bg-gradient-to-br ${link.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                {link.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{link.title}</h3>
              <p className="text-white/70 text-sm">{link.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent News and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-display font-bold text-white mb-4">
            Recent News
          </h2>
          <div className="space-y-4">
            {recentNews.map((news, index) => (
              <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                <h3 className="text-lg font-semibold text-white">{news.title}</h3>
                <p className="text-sm text-white/60 mb-2">{news.date}</p>
                <p className="text-white/80 text-sm">{news.preview}</p>
                <Link to="/news" className="text-seafoam hover:text-seafoam/80 text-sm font-medium">
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-display font-bold text-white mb-4">
            Pawleys Island Weather
          </h2>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">☀️</div>
            <p className="text-4xl font-bold text-white">78°F</p>
            <p className="text-white/80 mt-2">Partly Cloudy</p>
            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <div>
                <p className="text-white/60">Humidity</p>
                <p className="text-white font-semibold">65%</p>
              </div>
              <div>
                <p className="text-white/60">Wind</p>
                <p className="text-white font-semibold">12 mph</p>
              </div>
              <div>
                <p className="text-white/60">UV Index</p>
                <p className="text-white font-semibold">6</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          Community at a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-seafoam">165</p>
            <p className="text-white/70 text-sm">Total Units</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-seafoam">3</p>
            <p className="text-white/70 text-sm">Upcoming Events</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-seafoam">24/7</p>
            <p className="text-white/70 text-sm">Security</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-seafoam">2</p>
            <p className="text-white/70 text-sm">Pools Open</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard