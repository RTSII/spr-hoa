import { motion } from 'framer-motion'
import { useState } from 'react'

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Sample events
  const events = [
    {
      id: 1,
      title: 'HOA Board Meeting',
      date: '2024-12-20',
      time: '6:00 PM',
      location: 'Community Center',
      description: 'Monthly board meeting. All owners welcome.',
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Holiday Beach Party',
      date: '2024-12-23',
      time: '4:00 PM',
      location: 'Beach Access #2',
      description: 'Annual holiday celebration with food and music.',
      type: 'social',
    },
    {
      id: 3,
      title: 'Pool Maintenance',
      date: '2024-12-28',
      time: '8:00 AM',
      location: 'Main Pool',
      description: 'Pool will be closed for routine maintenance.',
      type: 'maintenance',
    },
  ]

  const eventTypeColors = {
    meeting: 'bg-ocean',
    social: 'bg-seafoam',
    maintenance: 'bg-driftwood',
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Community Calendar
        </h1>

        {/* Calendar Grid Placeholder */}
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <p className="text-white/70 text-center">
            Interactive calendar will be displayed here
          </p>
        </div>

        {/* Upcoming Events */}
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Upcoming Events
        </h2>
        <div className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${eventTypeColors[event.type as keyof typeof eventTypeColors]}`}>
                      {event.type}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  </div>
                  <p className="text-white/80 mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>📅 {event.date}</span>
                    <span>🕐 {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>
                <button className="glass-button text-sm">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Calendar