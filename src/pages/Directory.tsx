import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Mail, Phone, Home, User, X } from 'lucide-react'
import ReactBitsProfileCard from '@/components/ReactBitsProfileCard'

type DirectoryEntry = {
  id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  profile_picture_url?: string
  profile_picture_status?: string
  show_email: boolean
  show_phone: boolean
  show_unit: boolean
  directory_opt_in: boolean
}

const Directory = () => {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const [residents, setResidents] = useState<DirectoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [expandedResident, setExpandedResident] = useState<DirectoryEntry | null>(null)

  // Helper to get preferred contact method
  const getPreferredContact = (resident: DirectoryEntry) => {
    if (resident.show_email && resident.email) return resident.email
    if (resident.show_phone && resident.phone) return resident.phone
    return ''
  }

  useEffect(() => {
    if (profile && !profile.directory_opt_in) {
      setAccessDenied(true)
      setIsLoading(false)
      return
    }
    fetchResidents()
  }, [profile])

  // Handle escape key to close expanded card
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expandedResident) {
        setExpandedResident(null)
      }
    }

    if (expandedResident) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [expandedResident])

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select(
          `
          id,
          unit_number,
          first_name,
          last_name,
          email,
          phone,
          profile_picture_url,
          profile_picture_status,
          show_email,
          show_phone,
          show_unit,
          directory_opt_in
        `,
        )
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

  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase()
    const unit = resident.unit_number.toLowerCase()
    const building = resident.unit_number.charAt(0).toUpperCase()
    const buildingMatch = buildingFilter ? building === buildingFilter : true
    return buildingMatch && (fullName.includes(searchLower) || unit.includes(searchLower))
  })

  // Helper: get resident photo or default avatar
  const getResidentPhoto = (resident: DirectoryEntry) => {
    if (resident.profile_picture_url && resident.profile_picture_status === 'approved') {
      return resident.profile_picture_url
    }
    // Default avatar using UI Avatars service
    return `https://ui-avatars.com/api/?name=${resident.first_name}+${resident.last_name}&background=2953A6&color=fff&size=256`
  }

  const exportDirectoryPDF = async () => {
    const element = document.getElementById('directory-list-pdf')
    if (!element) return
    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pageWidth - 40
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.setFillColor('#2953A6')
    pdf.rect(0, 0, pageWidth, 60, 'F')
    pdf.setTextColor('#fff')
    pdf.setFontSize(22)
    pdf.text('Sandpiper Run Resident Directory', 40, 40)
    pdf.addImage(imgData, 'PNG', 20, 70, pdfWidth, pdfHeight)
    pdf.save(`sandpiper-run-directory-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleThumbnailClick = (resident: DirectoryEntry) => {
    setExpandedResident(resident)
  }

  const handleContactClick = (resident: DirectoryEntry) => {
    const contact = getPreferredContact(resident)
    if (contact) {
      if (contact.includes('@')) {
        window.location.href = `mailto:${contact}`
      } else {
        window.location.href = `tel:${contact}`
      }
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-white md:mb-0">
            Resident Directory
          </h1>
          <div className="flex items-center space-x-4">
            <a
              href="/profile"
              className="glass-button rounded-lg bg-gradient-to-r from-[#2953A6] to-[#6bb7e3] px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-[#1e3a6b] hover:to-[#4a90e2] focus:outline-none focus:ring-2 focus:ring-seafoam"
              aria-label="Manage My Directory Profile"
            >
              Manage My Directory Profile
            </a>
            <button
              onClick={exportDirectoryPDF}
              className="glass-button text-sm"
              disabled={filteredResidents.length === 0}
            >
              🖨️ Export Directory (PDF)
            </button>
          </div>
        </div>

        {/* Opt-in Notice */}
        {profile && !profile.directory_opt_in && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-seafoam/50 bg-seafoam/20 p-4"
          >
            <p className="text-white">
              You are not currently listed in the directory.
              <a href="/profile" className="ml-2 font-medium text-seafoam hover:text-seafoam/80">
                Update your preferences
              </a>
            </p>
          </motion.div>
        )}

        {/* Building Filter & Search Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-seafoam md:w-48"
            aria-label="Filter by building"
          >
            <option value="">All Buildings</option>
            <option value="A">Building A</option>
            <option value="B">Building B</option>
            <option value="C">Building C</option>
            <option value="D">Building D</option>
          </select>
          <input
            type="text"
            placeholder="Search by name or unit number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-seafoam"
          />
        </div>

        {/* Supermemory AI Search Bar */}
        <div className="mb-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!supermemoryQuery) return
              const { supermemorySearch } = await import('../lib/supermemoryClient')
              try {
                const result = await supermemorySearch(supermemoryQuery, 'resident-directory')
                setSupermemoryResults(result?.results || [])
              } catch (err) {
                setSupermemoryResults([])
              }
            }}
            className="flex gap-2"
            role="search"
            aria-label="AI-powered resident search"
          >
            <input
              type="text"
              placeholder="AI-powered search (e.g. 'owners with pets', 'find all B units')"
              value={supermemoryQuery}
              onChange={(e) => setSupermemoryQuery(e.target.value)}
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-seafoam"
            />
            <button type="submit" className="glass-button text-sm" disabled={!supermemoryQuery}>
              🔍 AI Search
            </button>
          </form>
          {supermemoryResults.length > 0 && (
            <div className="mt-2 text-white/80">
              <div className="mb-1 font-bold">AI Search Results:</div>
              <ul className="ml-6 list-disc">
                {supermemoryResults.map((res, i) => (
                  <li key={i}>{typeof res === 'string' ? res : JSON.stringify(res)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Directory Stats */}
        <div className="mb-6 text-sm text-white/70">
          Showing {filteredResidents.length} of {residents.length} residents
        </div>

        {/* Directory List */}
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-white/70">Loading directory...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-white/70">
              {searchTerm
                ? 'No residents found matching your search.'
                : 'No residents have opted into the directory yet.'}
            </p>
          </div>
        ) : (
          <div id="directory-list-pdf" className="space-y-4">
            {filteredResidents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="luxury-card rounded-2xl border-2 border-[#2953A6] bg-gradient-to-br from-[#2953A6] via-white/10 to-[#6bb7e3] p-6 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                style={{ boxShadow: '0 4px 32px 0 rgba(41,83,166,0.12)' }}
              >
                <div className="flex items-center space-x-4">
                  {/* ReactBits Profile Card Thumbnail */}
                  <div
                    className="flex-shrink-0 transform cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => handleThumbnailClick(resident)}
                  >
                    <ReactBitsProfileCard
                      avatarUrl={getResidentPhoto(resident)}
                      name={`${resident.first_name} ${resident.last_name}`}
                      title={`Unit ${resident.unit_number}`}
                      handle={resident.unit_number}
                      status={
                        resident.profile_picture_status === 'approved' ? 'Verified' : 'Resident'
                      }
                      size="small"
                      enableTilt={true}
                      showUserInfo={false}
                      className="profile-thumbnail"
                    />
                  </div>

                  {/* Resident Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {resident.first_name} {resident.last_name}
                      </h3>
                      {/* Only show unit if opted-in */}
                      {resident.show_unit && (
                        <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-seafoam">
                          Unit {resident.unit_number}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {/* Only show email if opted-in */}
                      {resident.show_email && resident.email && (
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Mail className="h-4 w-4 text-seafoam" />
                          <a
                            href={`mailto:${resident.email}`}
                            className="transition-colors hover:text-seafoam"
                          >
                            {resident.email}
                          </a>
                        </div>
                      )}

                      {/* Only show phone if opted-in and present */}
                      {resident.show_phone && resident.phone && (
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <Phone className="h-4 w-4 text-seafoam" />
                          <a
                            href={`tel:${resident.phone}`}
                            className="transition-colors hover:text-seafoam"
                          >
                            {resident.phone}
                          </a>
                        </div>
                      )}

                      {!resident.show_email && !resident.show_phone && (
                        <div className="flex items-center gap-2 text-sm italic text-white/60">
                          <User className="h-4 w-4" />
                          <span>Contact info private</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Picture Status */}
                  <div className="flex-shrink-0">
                    {resident.profile_picture_url &&
                    resident.profile_picture_status === 'approved' ? (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                        <span>Photo Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-white/50">
                        <div className="h-2 w-2 rounded-full bg-white/30"></div>
                        <span>Default Avatar</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 rounded-lg bg-white/5 p-4">
          <p className="text-center text-sm text-white/60">
            This directory only shows residents who have opted in. Contact information and profile
            pictures are displayed based on individual privacy preferences.
          </p>
        </div>
      </motion.div>

      {/* Expanded Profile Card Modal */}
      <AnimatePresence>
        {expandedResident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setExpandedResident(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setExpandedResident(null)}
                className="absolute -right-4 -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Expanded Profile Card */}
              <ReactBitsProfileCard
                avatarUrl={getResidentPhoto(expandedResident)}
                name={`${expandedResident.first_name} ${expandedResident.last_name}`}
                title={`Resident • Unit ${expandedResident.unit_number}`}
                handle={expandedResident.unit_number}
                status={getPreferredContact(expandedResident) || 'Contact info private'}
                contactText="Contact"
                size="large"
                enableTilt={true}
                showUserInfo={true}
                onContactClick={() => handleContactClick(expandedResident)}
                behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(41,100%,90%,var(--card-opacity)) 4%,hsla(41,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(41,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(41,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#2953A6c4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#6bb7e3ff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#2953A6ff 0%,#6bb7e3ff 40%,#6bb7e3ff 60%,#2953A6ff 100%)"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .profile-thumbnail {
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(41, 83, 166, 0.3);
        }
      `}</style>
    </div>
  )
}

export default Directory
