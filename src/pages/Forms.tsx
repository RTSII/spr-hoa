import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Forms = () => {
  const forms = [
    {
      id: 1,
      title: 'Unit Access Request Form',
      description: 'Request access for vendors, contractors, or guests to your unit',
      icon: '🔑',
      status: 'active',
      link: '/forms/unit-access',
    },
    {
      id: 2,
      title: 'Pet Registration Form',
      description: 'Register your pets with the HOA as required by community rules',
      icon: '🐕',
      status: 'active',
      link: '/forms/pet-registration',
    },
    {
      id: 3,
      title: 'Architectural Change Request',
      description: 'Submit requests for modifications to your unit',
      icon: '🏗️',
      status: 'coming-soon',
      link: '/forms/architectural',
    },
    {
      id: 4,
      title: 'Guest Parking Permit',
      description: 'Request parking permits for your guests',
      icon: '🚗',
      status: 'coming-soon',
      link: '/forms/parking',
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Online Forms
        </h1>
        <p className="text-white/80 mb-8">
          Access and submit important forms online for your convenience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 ${form.status === 'active'
                  ? 'hover:bg-white/20 cursor-pointer'
                  : 'opacity-60'
                } transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{form.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {form.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {form.description}
                  </p>
                  {form.status === 'active' ? (
                    <Link
                      to={form.link}
                      className="inline-flex items-center text-seafoam hover:text-seafoam/80 font-medium"
                    >
                      Fill out form →
                    </Link>
                  ) : (
                    <span className="text-white/50 text-sm">Coming Soon</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Forms