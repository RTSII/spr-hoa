import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type DirectoryEntry = {
  id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  show_email: boolean
  show_phone: boolean
  show_unit: boolean
}

const Directory = () => {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [residents, setResidents] = useState<DirectoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResidents()
  }, [])

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('directory_opt_in', true)
        .order('unit_number')

      if (error) throw error
      setResidents(data || [])
    } catch (error) {
      console.error('Error fetching residents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase()
    const unit = resident.unit_number.toLowerCase()

    return fullName.includes(searchLower) || unit.includes(searchLower)
  })

  const exportDirectory = () => {
    // Create CSV content
    let csvContent = 'Name,Unit,Email,Phone\n'

    filteredResidents.forEach(resident => {
      const name = `${resident.first_name} ${resident.last_name}`
      const unit = resident.show_unit ? resident.unit_number : 'Private'
      const email = resident.show_email ? resident.email : 'Private'
      const phone = resident.show_phone ? (resident.phone || 'Not provided') : 'Private'

      csvContent += `"${name}","${unit}","${email}","${phone}"\n`
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sandpiper-run-directory-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-4 md:mb-0">
            Resident Directory
          </h1>
          <button
            onClick={exportDirectory}
            className="glass-button text-sm"
            disabled={filteredResidents.length === 0}
          >
            📥 Export Directory (CSV)
          </button>
        </div>

        {/* Opt-in Notice */}
        {profile && !profile.directory_opt_in && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-seafoam/20 border border-seafoam/50 rounded-lg p-4 mb-6"
          >
            <p className="text-white">
              You are not currently listed in the directory.
              <a href="/profile" className="ml-2 text-seafoam hover:text-seafoam/80 font-medium">
                Update your preferences
              </a>
            </p>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or unit number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Directory Stats */}
        <div className="mb-6 text-white/70 text-sm">
          Showing {filteredResidents.length} of {residents.length} residents
        </div>

        {/* Directory List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-white/70">Loading directory...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70">
              {searchTerm ? 'No residents found matching your search.' : 'No residents have opted into the directory yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResidents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {resident.first_name} {resident.last_name}
                    </h3>
                    {resident.show_unit && (
                      <p className="text-white/70">Unit {resident.unit_number}</p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 space-y-1 md:text-right">
                    {resident.show_email && (
                      <p className="text-white/80">
                        <a href={`mailto:${resident.email}`} className="hover:text-seafoam transition-colors">
                          {resident.email}
                        </a>
                      </p>
                    )}
                    {resident.show_phone && resident.phone && (
                      <p className="text-white/80">
                        <a href={`tel:${resident.phone}`} className="hover:text-seafoam transition-colors">
                          {resident.phone}
                        </a>
                      </p>
                    )}
                    {!resident.show_email && !resident.show_phone && (
                      <p className="text-white/50 text-sm italic">Contact information private</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <p className="text-white/60 text-sm text-center">
            This directory only shows residents who have opted in. Contact information is displayed based on individual privacy preferences.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Directory