import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  AlertCircle,
  UserCircle,
  Image as ImageIcon,
  Home,
  Inbox,
  RefreshCw,
  SlidersHorizontal,
  FileImage
} from 'lucide-react'
import { adminService, PhotoSubmission } from '@/lib/adminService'
import { supabase } from '@/lib/supabase'

interface PhotoApprovalSystemProps {
  onClose: () => void
}

// Enhanced PhotoSubmission type with additional fields
interface EnhancedPhotoSubmission extends PhotoSubmission {
  user_profile?: {
    first_name: string;
    last_name: string;
    unit_number: string;
  };
  submission_type: 'community' | 'profile';
  photo_type?: string;
}

const PhotoApprovalSystem: React.FC<PhotoApprovalSystemProps> = ({ onClose }) => {
  const [submissions, setSubmissions] = useState<EnhancedPhotoSubmission[]>([])
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [typeFilter, setTypeFilter] = useState<'all' | 'community' | 'profile'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<EnhancedPhotoSubmission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    community: 0,
    profile: 0
  })

  // Image zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1)
  const imageRef = useRef<HTMLImageElement>(null)

  // For profile photo review - we'll also check pending profile pictures
  const getProfilePhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          unit_number,
          profile_picture_url,
          profile_picture_status,
          profile_picture_rejection_reason,
          profile_picture_submitted_at
        `)
        .in('profile_picture_status', ['pending', 'rejected'])

      if (error) throw error

      // Convert profile picture entries to photo submission format
      const profileSubmissions: EnhancedPhotoSubmission[] = (data || [])
        .filter(profile => profile.profile_picture_url && profile.profile_picture_status)
        .map(profile => ({
          id: profile.id,
          user_id: profile.user_id,
          title: `Profile Picture - ${profile.first_name} ${profile.last_name}`,
          description: `Unit ${profile.unit_number} resident profile picture`,
          file_path: profile.profile_picture_url,
          file_url: profile.profile_picture_url,
          status: profile.profile_picture_status as 'pending' | 'approved' | 'rejected',
          rejection_reason: profile.profile_picture_rejection_reason || '',
          created_at: profile.profile_picture_submitted_at || new Date().toISOString(),
          updated_at: profile.profile_picture_submitted_at || new Date().toISOString(),
          user_profile: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            unit_number: profile.unit_number
          },
          submission_type: 'profile',
          category: 'profile'
        }))

      return profileSubmissions
    } catch (error) {
      console.error('Error fetching profile photos:', error)
      return []
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [filter, typeFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)

      // Get regular photo submissions
      let communityPhotos: EnhancedPhotoSubmission[] = []
      try {
        const data = await adminService.getAllPhotoSubmissions()

        // Convert to enhanced format
        communityPhotos = (data || []).map(photo => ({
          ...photo,
          submission_type: 'community',
          photo_type: photo.category || 'general'
        }))
      } catch (error) {
        console.error('Error loading community photos:', error)
      }

      // Get profile photos
      let profilePhotos: EnhancedPhotoSubmission[] = []
      try {
        profilePhotos = await getProfilePhotos()
      } catch (error) {
        console.error('Error loading profile photos:', error)
      }

      // Combine all photos
      let allPhotos = [...communityPhotos, ...profilePhotos]

      // Apply status filter
      if (filter !== 'all') {
        allPhotos = allPhotos.filter(photo => photo.status === filter)
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        allPhotos = allPhotos.filter(photo => photo.submission_type === typeFilter)
      }

      // Calculate stats
      const newStats = {
        total: communityPhotos.length + profilePhotos.length,
        pending: allPhotos.filter(p => p.status === 'pending').length,
        approved: allPhotos.filter(p => p.status === 'approved').length,
        rejected: allPhotos.filter(p => p.status === 'rejected').length,
        community: communityPhotos.length,
        profile: profilePhotos.length
      }

      setSubmissions(allPhotos)
      setStats(newStats)
    } catch (error) {
      console.error('Error loading photo submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submission: EnhancedPhotoSubmission) => {
    try {
      setLoading(true)

      // Different approval process for profile pictures vs community photos
      if (submission.submission_type === 'profile') {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'approved',
            profile_picture_admin_notes: adminNotes
          })
          .eq('id', submission.id)
      } else {
        await adminService.reviewPhotoSubmission(submission.id, 'approved', adminNotes)
      }

      await loadSubmissions()
      setAdminNotes('')

      // If viewing this photo in the modal, close it
      if (viewingPhoto?.id === submission.id) {
        setViewingPhoto(null)
      }
    } catch (error) {
      console.error('Error approving photo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (submission: EnhancedPhotoSubmission) => {
    try {
      setLoading(true)

      const reason = rejectionReason || 'Does not meet community guidelines'

      // Different rejection process for profile pictures vs community photos
      if (submission.submission_type === 'profile') {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'rejected',
            profile_picture_rejection_reason: reason,
            profile_picture_admin_notes: adminNotes
          })
          .eq('id', submission.id)
      } else {
        await adminService.reviewPhotoSubmission(
          submission.id,
          'rejected',
          adminNotes,
          reason
        )
      }

      await loadSubmissions()
      setRejectionReason('')
      setAdminNotes('')

      // If viewing this photo in the modal, close it
      if (viewingPhoto?.id === submission.id) {
        setViewingPhoto(null)
      }
    } catch (error) {
      console.error('Error rejecting photo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedSubmissions.length === 0) return

    try {
      setLoading(true)

      // Group selected submissions by type
      const selectedItems = submissions.filter(s => selectedSubmissions.includes(s.id))
      const communityPhotos = selectedItems.filter(s => s.submission_type === 'community')
      const profilePhotos = selectedItems.filter(s => s.submission_type === 'profile')

      // Process community photos
      if (communityPhotos.length > 0) {
        const communityIds = communityPhotos.map(p => p.id)
        await adminService.bulkApprovePhotos(communityIds)
      }

      // Process profile photos
      for (const photo of profilePhotos) {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'approved',
            profile_picture_admin_notes: 'Bulk approved by admin'
          })
          .eq('id', photo.id)
      }

      setSelectedSubmissions([])
      await loadSubmissions()
    } catch (error) {
      console.error('Error bulk approving photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedSubmissions.length === 0) return

    try {
      setLoading(true)

      const reason = rejectionReason || 'Bulk rejection - please review community guidelines'

      // Group selected submissions by type
      const selectedItems = submissions.filter(s => selectedSubmissions.includes(s.id))
      const communityPhotos = selectedItems.filter(s => s.submission_type === 'community')
      const profilePhotos = selectedItems.filter(s => s.submission_type === 'profile')

      // Process community photos
      if (communityPhotos.length > 0) {
        const communityIds = communityPhotos.map(p => p.id)
        await adminService.bulkRejectPhotos(communityIds, reason)
      }

      // Process profile photos
      for (const photo of profilePhotos) {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'rejected',
            profile_picture_rejection_reason: reason,
            profile_picture_admin_notes: 'Bulk rejected by admin'
          })
          .eq('id', photo.id)
      }

      setSelectedSubmissions([])
      setRejectionReason('')
      await loadSubmissions()
    } catch (error) {
      console.error('Error bulk rejecting photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.user_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.user_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.user_profile?.unit_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'approved': return 'text-green-400 bg-green-500/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const typeIcon = (type: 'community' | 'profile') => {
    return type === 'community' ? ImageIcon : UserCircle
  }

  const typeColor = (type: 'community' | 'profile') => {
    return type === 'community' ? 'text-blue-400 bg-blue-500/20' : 'text-purple-400 bg-purple-500/20'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Photo Approval System</h2>
            <div className="flex space-x-1">
              <span className="px-3 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                {filteredSubmissions.length} items
              </span>
              <span className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full">
                {stats.pending} pending
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSubmissions}
              className="p-2 bg-white/10 text-white/70 rounded-full hover:bg-white/20 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Stats Cards */}
            <div className="flex space-x-2">
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-xs text-blue-400">Community</span>
                <p className="text-lg font-semibold text-white">{stats.community}</p>
              </div>
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <span className="text-xs text-purple-400">Profile</span>
                <p className="text-lg font-semibold text-white">{stats.profile}</p>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2 bg-black/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-2 text-sm ${typeFilter === 'all' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('community')}
                className={`px-3 py-2 text-sm flex items-center space-x-1 ${typeFilter === 'community' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Community</span>
              </button>
              <button
                onClick={() => setTypeFilter('profile')}
                className={`px-3 py-2 text-sm flex items-center space-x-1 ${typeFilter === 'profile' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <UserCircle className="h-3 w-3" />
                <span>Profile</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 bg-black/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 text-sm flex items-center space-x-1 ${filter === 'pending' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <AlertCircle className="h-3 w-3 text-yellow-400" />
                <span>Pending</span>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-2 text-sm flex items-center space-x-1 ${filter === 'approved' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Approved</span>
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-2 text-sm flex items-center space-x-1 ${filter === 'rejected' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <XCircle className="h-3 w-3 text-red-400" />
                <span>Rejected</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                placeholder="Search photos, titles, descriptions, or residents..."
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSubmissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <span className="text-blue-300 font-medium">
                {selectedSubmissions.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkApprove}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
                >
                  Bulk Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkReject}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  Bulk Reject
                </motion.button>
                <button
                  onClick={() => setSelectedSubmissions([])}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30 hover:bg-gray-500/30 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && submissions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60">
              <Camera className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Photos Found</h3>
              <p>No photo submissions match your current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubmissions.map((submission) => {
                const TypeIcon = typeIcon(submission.submission_type)
                return (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/20 rounded-lg border border-white/10 overflow-hidden hover:border-orange-400/50 transition-all"
                  >
                    {/* Photo Preview */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {submission.file_url ? (
                        <img
                          src={submission.file_url}
                          alt={submission.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-600" />
                        </div>
                      )}

                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions([...selectedSubmissions, submission.id])
                            } else {
                              setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id))
                            }
                          }}
                          className="w-4 h-4 text-orange-400 bg-black/50 border-white/30 rounded focus:ring-orange-400"
                        />
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${typeColor(submission.submission_type)}`}>
                          <TypeIcon className="h-3 w-3" />
                          <span>{submission.submission_type === 'community' ? 'Community' : 'Profile'}</span>
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 text-xs rounded ${statusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>

                      {/* View Button */}
                      <div className="absolute bottom-2 right-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewingPhoto(submission)}
                          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Photo Info */}
                    <div className="p-4">
                      <h4 className="text-white font-semibold mb-1 truncate">{submission.title}</h4>

                      {/* User Info */}
                      {submission.user_profile && (
                        <div className="flex items-center space-x-1 text-white/70 text-sm mb-2">
                          <User className="h-3 w-3" />
                          <span>{submission.user_profile.first_name} {submission.user_profile.last_name}</span>
                          <span>•</span>
                          <Home className="h-3 w-3" />
                          <span>Unit {submission.user_profile.unit_number}</span>
                        </div>
                      )}

                      <p className="text-white/70 text-sm mb-2 line-clamp-2">
                        {submission.description || 'No description provided'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                        <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                        {submission.submission_type === 'community' && (
                          <span className="capitalize">{submission.category}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {submission.status === 'pending' && (
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(submission)}
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500/20 text-green-400 rounded text-sm border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mx-auto" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingPhoto(submission)}
                            disabled={loading}
                            className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded text-sm border border-orange-500/30 hover:bg-orange-500/30 transition-all disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4 mx-auto" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setRejectionReason('Does not meet community guidelines')
                              setViewingPhoto(submission)
                            }}
                            disabled={loading}
                            className="flex-1 py-2 bg-red-500/20 text-red-400 rounded text-sm border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4 mx-auto" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Photo Viewer Modal */}
        <AnimatePresence>
          {viewingPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-800 rounded-xl max-w-5xl w-full max-h-[90%] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{viewingPhoto.title}</h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${statusColor(viewingPhoto.status)}`}>
                          {viewingPhoto.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${typeColor(viewingPhoto.submission_type)}`}>
                          <TypeIcon className="h-3 w-3" />
                          <span>{viewingPhoto.submission_type === 'community' ? 'Community' : 'Profile'}</span>
                        </span>
                        {viewingPhoto.user_profile && (
                          <span className="text-white/70 text-sm">
                            {viewingPhoto.user_profile.first_name} {viewingPhoto.user_profile.last_name} • Unit {viewingPhoto.user_profile.unit_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingPhoto(null)
                        setZoomLevel(1)
                      }}
                      className="text-white/70 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto flex flex-col md:flex-row">
                  {/* Photo */}
                  <div className="p-6 flex-1 flex items-center justify-center relative bg-black/50">
                    {viewingPhoto.file_url ? (
                      <div className="relative overflow-hidden max-h-[60vh]">
                        <img
                          ref={imageRef}
                          src={viewingPhoto.file_url}
                          alt={viewingPhoto.title}
                          className="max-w-full object-contain transition-transform duration-200"
                          style={{ transform: `scale(${zoomLevel})` }}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-black/50 rounded-lg p-2">
                          <button
                            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                            className="p-1 text-white/70 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="text-white/70 text-xs">{Math.round(zoomLevel * 100)}%</span>
                          <button
                            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
                            className="p-1 text-white/70 hover:text-white transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setZoomLevel(1)}
                            className="p-1 text-white/70 hover:text-white transition-colors text-xs"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileImage className="h-24 w-24 mb-2" />
                        <p>No image available</p>
                      </div>
                    )}
                  </div>

                  {/* Details and Actions */}
                  <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Description</h4>
                        <p className="text-white/80">{viewingPhoto.description || 'No description provided'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Submitted:</span>
                          <span className="text-white ml-2">{new Date(viewingPhoto.created_at).toLocaleDateString()}</span>
                        </div>
                        {viewingPhoto.submission_type === 'community' && (
                          <div>
                            <span className="text-white/60">Category:</span>
                            <span className="text-white ml-2 capitalize">{viewingPhoto.category}</span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Reason (if rejected) */}
                      {viewingPhoto.status === 'rejected' && viewingPhoto.rejection_reason && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <h5 className="text-red-400 font-medium text-sm mb-1">Rejection Reason:</h5>
                          <p className="text-white/80 text-sm">{viewingPhoto.rejection_reason}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      <div>
                        <label className="block text-white font-semibold mb-2">Admin Notes</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:border-orange-400 focus:outline-none"
                          rows={3}
                          placeholder="Add notes about this submission..."
                        />
                      </div>

                      {/* Rejection Reason (if rejecting) */}
                      {viewingPhoto.status === 'pending' && (
                        <div>
                          <label className="block text-white font-semibold mb-2">
                            Rejection Reason <span className="text-white/60 text-xs">(if rejecting)</span>
                          </label>
                          <input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                            placeholder="Reason for rejection..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {viewingPhoto.status === 'pending' && (
                      <div className="flex space-x-3 pt-4 mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(viewingPhoto)}
                          disabled={loading}
                          className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50 font-medium"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(viewingPhoto)}
                          disabled={loading || !rejectionReason.trim()}
                          className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50 font-medium"
                        >
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default PhotoApprovalSystem
