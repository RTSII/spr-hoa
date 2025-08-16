import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PhotoGalleryUpload from '@/components/PhotoGalleryUpload'
import CircularGallery from '@/components/CircularGallery'
import { searchPhotos } from '@/lib/supermemory'

interface Photo {
  id: string
  title: string
  description?: string
  photo_url: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
}

interface GalleryItem {
  id: string
  image: string
  title: string
  category: string
  description?: string
}

const Photos = () => {
  const { user } = useAuth()
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([])
  const [userPhotos, setUserPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])

  useEffect(() => {
    fetchApprovedPhotos()
    if (user) {
      fetchUserPhotos()
    }
  }, [user])

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

  const fetchApprovedPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photo_submissions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApprovedPhotos(data || [])
    } catch (error) {
      console.error('Error fetching approved photos:', error)
      setApprovedPhotos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPhotos = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('photo_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('submission_type', 'gallery_photo')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setUserPhotos(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            photo_url: item.file_url || item.photo_url,
            category: item.category,
            status: item.status,
            rejection_reason: item.rejection_reason,
            created_at: item.created_at,
          })),
        )
      }
    } catch (error) {
      console.error('Error fetching user photos:', error)
    }
  }

  const handleUploadComplete = () => {
    fetchUserPhotos()
    setShowUploadForm(false)
  }

  // Convert approved photos to gallery items format
  const galleryItems: GalleryItem[] = approvedPhotos.map((photo) => ({
    id: photo.id,
    image: photo.photo_url,
    title: photo.title,
    category: photo.category,
    description: photo.description,
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* My Photos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-white md:mb-0">My Photos</h1>
          <button
            className="glass-button text-sm"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? 'Cancel' : '📤 Upload Photo'}
          </button>
        </div>

        {showUploadForm ? (
          <div className="mb-8">
            <PhotoGalleryUpload onUploadComplete={handleUploadComplete} />
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-white/80">
              Upload your photos to share with the community! All photos will be reviewed by an
              administrator before appearing in the gallery.
            </p>
          </div>
        )}

        {/* User Submitted Photos */}
        {userPhotos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 transition-all duration-300 hover:bg-white/20"
              >
                <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-white/10">
                  {photo.photo_url ? (
                    <img
                      src={photo.photo_url}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
                      📷
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute right-2 top-2">
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(photo.status)}`}
                    >
                      {photo.status === 'pending' && 'Pending Review'}
                      {photo.status === 'approved' && 'Approved'}
                      {photo.status === 'rejected' && 'Rejected'}
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-white">{photo.title}</h3>
                {photo.description && (
                  <p className="mt-1 text-sm text-white/60">{photo.description}</p>
                )}

                {photo.status === 'rejected' && photo.rejection_reason && (
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/20 p-2">
                    <p className="text-xs text-red-300">
                      Rejection reason: {photo.rejection_reason}
                    </p>
                  </div>
                )}

                <p className="mt-2 text-xs text-white/40">
                  Submitted on {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Camera className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <p className="text-white/70">You haven't submitted any photos yet.</p>
            <button
              className="mt-4 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 text-white"
              onClick={() => setShowUploadForm(true)}
            >
              Upload Your First Photo
            </button>
          </div>
        )}
      </motion.div>

      {/* Community Gallery Section with Circular Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 font-display text-3xl font-bold text-white">Community Gallery</h1>
            <p className="text-white/70">
              Browse photos by category • Scroll to rotate • Click to explore
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-3 md:mt-0">
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
              {approvedPhotos.length} approved photos
            </span>
          </div>
        </div>

        {/* Circular Gallery */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : galleryItems.length > 0 ? (
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.05}
          />
        ) : (
          <div className="glass-card p-12 text-center">
            <Camera className="mx-auto mb-4 h-16 w-16 text-white/40" />
            <h3 className="mb-2 text-xl font-semibold text-white">No Photos Yet</h3>
            <p className="mb-6 text-white/70">
              The community gallery will display approved photos from residents.
            </p>
            <button
              className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-white transition-all hover:from-teal-400 hover:to-blue-500"
              onClick={() => setShowUploadForm(true)}
            >
              Be the First to Upload
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Photos
