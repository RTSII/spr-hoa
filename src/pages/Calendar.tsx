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
        <h1 className="mb-6 font-display text-3xl font-bold text-white">Community Calendar</h1>

        {/* Calendar Grid Placeholder */}
        <div className="mb-8 rounded-lg bg-white/10 p-6">
          <p className="text-center text-white/70">Interactive calendar will be displayed here</p>
        </div>

        {/* Upcoming Events */}
        <h2 className="mb-4 font-display text-2xl font-bold text-white">Upcoming Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 transition-all duration-300 hover:bg-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium text-white ${eventTypeColors[event.type as keyof typeof eventTypeColors]}`}
                    >
                      {event.type}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  </div>
                  <p className="mb-2 text-white/80">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>📅 {event.date}</span>
                    <span>🕐 {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>
                <button className="glass-button text-sm">View Details</button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Calendar
