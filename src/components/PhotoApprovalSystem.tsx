import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Search,
  AlertCircle,
  UserCircle,
  ImageIcon,
  Home,
  RefreshCw,
  FileImage,
} from 'lucide-react'
import { adminService, PhotoSubmission } from '@/lib/adminService'
import { supabase } from '@/lib/supabase'
import { searchPhotos, storePhotoMetadata } from '@/lib/supermemory'

interface PhotoApprovalSystemProps {
  onClose: () => void
}

// Enhanced PhotoSubmission type with additional fields
interface EnhancedPhotoSubmission extends PhotoSubmission {
  user_profile?: {
    first_name: string
    last_name: string
    unit_number: string
  }
  submission_type: 'community' | 'profile'
  photo_type?: string
}

const PhotoApprovalSystem: React.FC<PhotoApprovalSystemProps> = ({ onClose }) => {
  const [submissions, setSubmissions] = useState<EnhancedPhotoSubmission[]>([])
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [typeFilter, setTypeFilter] = useState<'all' | 'community' | 'profile'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    'community',
    'events',
    'amenities',
    'profile',
  ])
  const [newCategory, setNewCategory] = useState('')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const [viewingPhoto, setViewingPhoto] = useState<EnhancedPhotoSubmission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    community: 0,
    profile: 0,
  })

  // Image zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1)
  const imageRef = useRef<HTMLImageElement>(null)

  // Fetch unique categories from photo submissions
  useEffect(() => {
    const fetchCategories = async () => {
      // First try to fetch from dedicated categories table
      const { data: categoryData, error: categoryError } = await supabase
        .from('photo_categories')
        .select('category_name')
        .order('created_at', { ascending: true })

      if (!categoryError && categoryData && categoryData.length > 0) {
        // Use categories from dedicated table
        const categoryNames = categoryData.map((item) => item.category_name) as string[]
        setCategories(categoryNames)
      } else {
        // Fallback to unique categories from photo submissions
        const { data, error } = await supabase
          .from('photo_submissions')
          .select('category')
          .neq('category', null)

        if (!error && data) {
          const uniqueCategories = Array.from(
            new Set(data.map((item) => item.category)),
          ) as string[]
          setCategories(uniqueCategories)
        }
      }
    }

    fetchCategories()
  }, [])

  // For profile photo review - we'll also check pending profile pictures
  const getProfilePhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select(
          `
          id,
          user_id,
          first_name,
          last_name,
          unit_number,
          profile_picture_url,
          profile_picture_status,
          profile_picture_rejection_reason,
          profile_picture_submitted_at
        `,
        )
        .in('profile_picture_status', ['pending', 'rejected'])

      if (error) throw error

      // Convert profile picture entries to photo submission format
      const profileSubmissions: EnhancedPhotoSubmission[] = (data || [])
        .filter((profile) => profile.profile_picture_url && profile.profile_picture_status)
        .map((profile) => ({
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
            unit_number: profile.unit_number,
          },
          submission_type: 'profile',
          category: 'profile',
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
        communityPhotos = (data || []).map((photo) => ({
          ...photo,
          submission_type: 'community',
          photo_type: photo.category || 'general',
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
        allPhotos = allPhotos.filter((photo) => photo.status === filter)
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        allPhotos = allPhotos.filter((photo) => photo.submission_type === typeFilter)
      }

      // Apply search filter
      if (searchTerm) {
        allPhotos = allPhotos.filter(
          (photo) =>
            photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            photo.category?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Calculate stats
      const newStats = {
        total: communityPhotos.length + profilePhotos.length,
        pending: allPhotos.filter((p) => p.status === 'pending').length,
        approved: allPhotos.filter((p) => p.status === 'approved').length,
        rejected: allPhotos.filter((p) => p.status === 'rejected').length,
        community: communityPhotos.length,
        profile: profilePhotos.length,
      }

      setSubmissions(allPhotos)
      setStats(newStats)
    } catch (error) {
      console.error('Error loading photo submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    try {
      setLoading(true)

      // Save the new category to the database
      const { error } = await supabase.from('photo_categories').insert({
        category_name: newCategory.trim(),
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Add the new category to our local state
      const updatedCategories = [...categories, newCategory.trim()]
      setCategories(updatedCategories)
      setNewCategory('')
      setShowCategoryForm(false)

      console.log('New category added:', newCategory.trim())
    } catch (error) {
      console.error('Error adding category:', error)
      // Show error to user
      alert('Error adding category: ' + (error as Error).message)
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
            profile_picture_admin_notes: adminNotes,
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
            profile_picture_admin_notes: adminNotes,
          })
          .eq('id', submission.id)
      } else {
        await adminService.reviewPhotoSubmission(submission.id, 'rejected', adminNotes, reason)
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
      const selectedItems = submissions.filter((s) => selectedSubmissions.includes(s.id))
      const communityPhotos = selectedItems.filter((s) => s.submission_type === 'community')
      const profilePhotos = selectedItems.filter((s) => s.submission_type === 'profile')

      // Process community photos
      if (communityPhotos.length > 0) {
        const communityIds = communityPhotos.map((p) => p.id)
        await adminService.bulkApprovePhotos(communityIds)
      }

      // Process profile photos
      for (const photo of profilePhotos) {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'approved',
            profile_picture_admin_notes: 'Bulk approved by admin',
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
      const selectedItems = submissions.filter((s) => selectedSubmissions.includes(s.id))
      const communityPhotos = selectedItems.filter((s) => s.submission_type === 'community')
      const profilePhotos = selectedItems.filter((s) => s.submission_type === 'profile')

      // Process community photos
      if (communityPhotos.length > 0) {
        const communityIds = communityPhotos.map((p) => p.id)
        await adminService.bulkRejectPhotos(communityIds, reason)
      }

      // Process profile photos
      for (const photo of profilePhotos) {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'rejected',
            profile_picture_rejection_reason: reason,
            profile_picture_admin_notes: 'Bulk rejected by admin',
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

  const handleSupermemorySearch = async () => {
    try {
      if (!supermemoryQuery) return
      const results = await searchPhotos(supermemoryQuery)
      setSupermemoryResults(results?.results || [])
    } catch (error) {
      console.error('Supermemory search error:', error)
      setSupermemoryResults([])
    }
  }

  // Store photo metadata in Supermemory when approving
  const storePhotoInSupermemory = async (photo: EnhancedPhotoSubmission) => {
    try {
      await storePhotoMetadata({
        title: photo.title || 'Untitled Photo',
        description: photo.description || '',
        category: photo.category || 'uncategorized',
        photoUrl: photo.file_url || '',
        userId: photo.user_id || '',
        status: photo.status,
      })
    } catch (error) {
      console.error('Error storing photo in Supermemory:', error)
    }
  }

  const handleApprovePhoto = async (photoId: string) => {
    try {
      const { data, error } = await supabase
        .from('photo_submissions')
        .update({ status: 'approved' })
        .eq('id', photoId)
        .select()

      if (error) throw error

      // Find the approved photo to store in Supermemory
      const approvedPhoto = submissions.find((photo) => photo.id === photoId)
      if (approvedPhoto) {
        await storePhotoInSupermemory(approvedPhoto)
      }

      loadSubmissions()
    } catch (error) {
      console.error('Error approving photo:', error)
      alert('Error approving photo: ' + (error as Error).message)
    }
  }

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_profile?.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'approved':
        return 'text-green-400 bg-green-500/20'
      case 'rejected':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const typeIcon = (type: 'community' | 'profile') => {
    return type === 'community' ? ImageIcon : UserCircle
  }

  const typeColor = (type: 'community' | 'profile') => {
    return type === 'community'
      ? 'text-blue-400 bg-blue-500/20'
      : 'text-purple-400 bg-purple-500/20'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Photo Approval System</h2>
            <div className="flex space-x-1">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                {filteredSubmissions.length} items
              </span>
              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300">
                {stats.pending} pending
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSubmissions}
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
            <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 border-b border-white/10 p-6">
          <div className="flex flex-wrap gap-4">
            {/* Stats Cards */}
            <div className="flex space-x-2">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2">
                <span className="text-xs text-blue-400">Community</span>
                <p className="text-lg font-semibold text-white">{stats.community}</p>
              </div>
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2">
                <span className="text-xs text-purple-400">Profile</span>
                <p className="text-lg font-semibold text-white">{stats.profile}</p>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2 overflow-hidden rounded-lg bg-black/30">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-2 text-sm ${typeFilter === 'all' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('community')}
                className={`flex items-center space-x-1 px-3 py-2 text-sm ${typeFilter === 'community' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Community</span>
              </button>
              <button
                onClick={() => setTypeFilter('profile')}
                className={`flex items-center space-x-1 px-3 py-2 text-sm ${typeFilter === 'profile' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <UserCircle className="h-3 w-3" />
                <span>Profile</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 overflow-hidden rounded-lg bg-black/30">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`flex items-center space-x-1 px-3 py-2 text-sm ${filter === 'pending' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <AlertCircle className="h-3 w-3 text-yellow-400" />
                <span>Pending</span>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`flex items-center space-x-1 px-3 py-2 text-sm ${filter === 'approved' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Approved</span>
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`flex items-center space-x-1 px-3 py-2 text-sm ${filter === 'rejected' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              >
                <XCircle className="h-3 w-3 text-red-400" />
                <span>Rejected</span>
              </button>
            </div>
          </div>

          {/* Category Management Section */}
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-white">Photo Categories (Albums)</h3>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="rounded border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-sm text-orange-400 transition-all hover:bg-orange-500/30"
              >
                {showCategoryForm ? 'Cancel' : 'Add Category'}
              </button>
            </div>

            {/* Category List */}
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Add Category Form */}
            <AnimatePresence>
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                      placeholder="Enter new category name"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/30 py-3 pl-10 pr-4 text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                placeholder="Search photos, titles, descriptions, or residents..."
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSubmissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <span className="font-medium text-blue-300">
                {selectedSubmissions.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkApprove}
                  disabled={loading}
                  className="rounded border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50"
                >
                  Bulk Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkReject}
                  disabled={loading}
                  className="rounded border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
                >
                  Bulk Reject
                </motion.button>
                <button
                  onClick={() => setSelectedSubmissions([])}
                  className="rounded border border-gray-500/30 bg-gray-500/20 px-4 py-2 text-gray-400 transition-all hover:bg-gray-500/30"
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
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-400"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-white/60">
              <Camera className="mb-4 h-16 w-16 opacity-50" />
              <h3 className="mb-2 text-xl font-semibold">No Photos Found</h3>
              <p>No photo submissions match your current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSubmissions.map((submission) => {
                const TypeIcon = typeIcon(submission.submission_type)
                return (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="overflow-hidden rounded-lg border border-white/10 bg-black/20 transition-all hover:border-orange-400/50"
                  >
                    {/* Photo Preview */}
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {submission.file_url ? (
                        <img
                          src={submission.file_url}
                          alt={submission.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-12 w-12 text-gray-600" />
                        </div>
                      )}

                      {/* Selection Checkbox */}
                      <div className="absolute left-2 top-2">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions([...selectedSubmissions, submission.id])
                            } else {
                              setSelectedSubmissions(
                                selectedSubmissions.filter((id) => id !== submission.id),
                              )
                            }
                          }}
                          className="h-4 w-4 rounded border-white/30 bg-black/50 text-orange-400 focus:ring-orange-400"
                        />
                      </div>

                      {/* Type Badge */}
                      <div className="absolute right-2 top-2">
                        <span
                          className={`flex items-center space-x-1 rounded px-2 py-1 text-xs ${typeColor(submission.submission_type)}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          <span>
                            {submission.submission_type === 'community' ? 'Community' : 'Profile'}
                          </span>
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span
                          className={`rounded px-2 py-1 text-xs ${statusColor(submission.status)}`}
                        >
                          {submission.status}
                        </span>
                      </div>

                      {/* View Button */}
                      <div className="absolute bottom-2 right-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewingPhoto(submission)}
                          className="rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Photo Info */}
                    <div className="p-4">
                      <h4 className="mb-1 truncate font-semibold text-white">{submission.title}</h4>

                      {/* User Info */}
                      {submission.user_profile && (
                        <div className="mb-2 flex items-center space-x-1 text-sm text-white/70">
                          <User className="h-3 w-3" />
                          <span>
                            {submission.user_profile.first_name} {submission.user_profile.last_name}
                          </span>
                          <span>•</span>
                          <Home className="h-3 w-3" />
                          <span>Unit {submission.user_profile.unit_number}</span>
                        </div>
                      )}

                      <p className="mb-2 line-clamp-2 text-sm text-white/70">
                        {submission.description || 'No description provided'}
                      </p>

                      <div className="mb-3 flex items-center justify-between text-xs text-white/50">
                        <span>
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </span>
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
                            className="flex-1 rounded border border-green-500/30 bg-green-500/20 py-2 text-sm text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50"
                          >
                            <CheckCircle className="mx-auto h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingPhoto(submission)}
                            disabled={loading}
                            className="flex-1 rounded border border-orange-500/30 bg-orange-500/20 py-2 text-sm text-orange-400 transition-all hover:bg-orange-500/30 disabled:opacity-50"
                          >
                            <Eye className="mx-auto h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setRejectionReason('Does not meet community guidelines')
                              setViewingPhoto(submission)
                            }}
                            disabled={loading}
                            className="flex-1 rounded border border-red-500/30 bg-red-500/20 py-2 text-sm text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
                          >
                            <XCircle className="mx-auto h-4 w-4" />
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
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="flex max-h-[90%] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-slate-800"
              >
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-white">{viewingPhoto.title}</h3>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`flex items-center space-x-1 rounded px-2 py-1 text-xs ${statusColor(viewingPhoto.status)}`}
                        >
                          {viewingPhoto.status}
                        </span>
                        <span
                          className={`flex items-center space-x-1 rounded px-2 py-1 text-xs ${typeColor(viewingPhoto.submission_type)}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          <span>
                            {viewingPhoto.submission_type === 'community' ? 'Community' : 'Profile'}
                          </span>
                        </span>
                        {viewingPhoto.user_profile && (
                          <span className="text-sm text-white/70">
                            {viewingPhoto.user_profile.first_name}{' '}
                            {viewingPhoto.user_profile.last_name} • Unit{' '}
                            {viewingPhoto.user_profile.unit_number}
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

                <div className="flex flex-1 flex-col overflow-auto md:flex-row">
                  {/* Photo */}
                  <div className="relative flex flex-1 items-center justify-center bg-black/50 p-6">
                    {viewingPhoto.file_url ? (
                      <div className="relative max-h-[60vh] overflow-hidden">
                        <img
                          ref={imageRef}
                          src={viewingPhoto.file_url}
                          alt={viewingPhoto.title}
                          className="max-w-full object-contain transition-transform duration-200"
                          style={{ transform: `scale(${zoomLevel})` }}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center space-x-2 rounded-lg bg-black/50 p-2">
                          <button
                            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                            className="p-1 text-white/70 transition-colors hover:text-white"
                          >
                            -
                          </button>
                          <span className="text-xs text-white/70">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button
                            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
                            className="p-1 text-white/70 transition-colors hover:text-white"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setZoomLevel(1)}
                            className="p-1 text-xs text-white/70 transition-colors hover:text-white"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileImage className="mb-2 h-24 w-24" />
                        <p>No image available</p>
                      </div>
                    )}
                  </div>

                  {/* Details and Actions */}
                  <div className="flex w-full flex-col border-t border-white/10 p-6 md:w-80 md:border-l md:border-t-0">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold text-white">Description</h4>
                        <p className="text-white/80">
                          {viewingPhoto.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Submitted:</span>
                          <span className="ml-2 text-white">
                            {new Date(viewingPhoto.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {viewingPhoto.submission_type === 'community' && (
                          <div>
                            <span className="text-white/60">Category:</span>
                            <span className="ml-2 capitalize text-white">
                              {viewingPhoto.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Reason (if rejected) */}
                      {viewingPhoto.status === 'rejected' && viewingPhoto.rejection_reason && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                          <h5 className="mb-1 text-sm font-medium text-red-400">
                            Rejection Reason:
                          </h5>
                          <p className="text-sm text-white/80">{viewingPhoto.rejection_reason}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      <div>
                        <label className="mb-2 block font-semibold text-white">Admin Notes</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full resize-none rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                          rows={3}
                          placeholder="Add notes about this submission..."
                        />
                      </div>

                      {/* Rejection Reason (if rejecting) */}
                      {viewingPhoto.status === 'pending' && (
                        <div>
                          <label className="mb-2 block font-semibold text-white">
                            Rejection Reason{' '}
                            <span className="text-xs text-white/60">(if rejecting)</span>
                          </label>
                          <input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                            placeholder="Reason for rejection..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {viewingPhoto.status === 'pending' && (
                      <div className="mt-auto flex space-x-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(viewingPhoto)}
                          disabled={loading}
                          className="flex-1 rounded-lg border border-green-500/30 bg-green-500/20 py-3 font-medium text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(viewingPhoto)}
                          disabled={loading || !rejectionReason.trim()}
                          className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 py-3 font-medium text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
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
