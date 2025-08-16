import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import sprLogoImg from '@/assets/images/spr_logo.jpg'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Calendar', href: '/calendar', icon: '📅' },
    { name: 'Community', href: '/community', icon: '💬' },
    { name: 'News', href: '/news', icon: '📰' },
    { name: 'Forms', href: '/forms', icon: '📋' },
    { name: 'Photos', href: '/photos', icon: '📸' },
    { name: 'Directory', href: '/directory', icon: '📖' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue via-ocean to-royal-blue">
      {/* Navigation */}
      <nav className="glass-card sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center">
                <img src={sprLogoImg} alt="Sandpiper Run" className="h-10 w-auto" />
                <span className="ml-3 hidden font-display text-xl font-bold text-white sm:block">
                  Sandpiper Run
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.href
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-seafoam focus:ring-offset-2"
                >
                  <div className="mr-3 hidden text-right sm:block">
                    <p className="text-sm font-medium text-white">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs text-white/70">Unit {profile?.unit_number}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-seafoam font-bold text-royal-blue">
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card absolute right-0 mt-2 w-48 rounded-md py-1 shadow-lg"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-4 text-white md:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-white/10 md:hidden"
          >
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-card mt-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white/70">
            © {new Date().getFullYear()} Sandpiper Run HOA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
