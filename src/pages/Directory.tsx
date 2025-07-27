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
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (profile && !profile.directory_opt_in) {
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }
    fetchResidents();
  }, [profile]);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('directory_opt_in', true)
        .order('unit_number');
      if (error) throw error;
      setResidents(data || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
    const unit = resident.unit_number.toLowerCase();
    return fullName.includes(searchLower) || unit.includes(searchLower);
  });

  // Helper: get resident photo or shadow image
  const getResidentPhoto = (resident: any) => {
    if (
      resident.show_profile_photo &&
      resident.profile_picture_url &&
      resident.profile_picture_status === 'approved'
    ) {
      return resident.profile_picture_url;
    }
    return require('@/assets/images/shadow_profile.png'); // fallback shadow image
  };

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
                className="luxury-card p-8 rounded-2xl shadow-lg bg-gradient-to-br from-[#2953A6] via-white/10 to-[#6bb7e3] border-2 border-[#2953A6] hover:scale-[1.02] transition-transform duration-300"
                style={{ boxShadow: '0 4px 32px 0 rgba(41,83,166,0.12)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Resident Photo */}
                  <div className="flex-shrink-0">
                    <img
                      src={getResidentPhoto(resident)}
                      alt="Resident profile"
                      className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-[#e6eaf3]"
                      title={resident.show_profile_photo ? (resident.profile_picture_status === 'approved' ? 'Profile photo approved' : 'Photo pending approval') : 'No photo shared'}
                    />
                  </div>
                  {/* Resident Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white tracking-wide">
                        {resident.first_name} {resident.last_name}
                      </h3>
                      {resident.show_unit && (
                        <span className="ml-2 px-3 py-1 rounded-full bg-[#2953A6] text-white text-xs font-semibold" title="Unit number shown">Unit {resident.unit_number}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {resident.show_email && (
                        <span className="flex items-center gap-1 text-white/90 text-sm" title="Email shared">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4-4 4m8 0l-4 4-4-4" /></svg>
                          <a href={`mailto:${resident.email}`} className="underline hover:text-[#6bb7e3]">{resident.email}</a>
                        </span>
                      )}
                      {resident.show_phone && resident.phone && (
                        <span className="flex items-center gap-1 text-white/90 text-sm" title="Phone shared">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l.4 2M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M16 7a4 4 0 01-8 0" /></svg>
                          <a href={`tel:${resident.phone}`} className="underline hover:text-[#6bb7e3]">{resident.phone}</a>
                        </span>
                      )}
                      {!resident.show_email && !resident.show_phone && (
                        <span className="text-white/60 italic" title="Contact info private">Contact info private</span>
                      )}
                    </div>
                  </div>
                  {/* Privacy/Photo Status Icons */}
                  <div className="flex flex-col items-end gap-2">
                    {resident.show_profile_photo && resident.profile_picture_status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[#6bb7e3] text-xs" title="Photo approved and shown">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Photo Shared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-white/50 text-xs" title="No photo shared or pending approval">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        No Photo
                      </span>
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