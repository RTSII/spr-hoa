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
      if (!supermemoryQuery) return;
      const results = await searchPhotos(supermemoryQuery);
      setSupermemoryResults(results?.results || []);
    } catch (error) {
      console.error('Supermemory search error:', error);
      setSupermemoryResults([]);
    }
  };

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
        setUserPhotos(data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          photo_url: item.file_url || item.photo_url,
          category: item.category,
          status: item.status,
          rejection_reason: item.rejection_reason,
          created_at: item.created_at
        })))
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
  const galleryItems: GalleryItem[] = approvedPhotos.map(photo => ({
    id: photo.id,
    image: photo.photo_url,
    title: photo.title,
    category: photo.category,
    description: photo.description
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-4 md:mb-0">
            My Photos
          </h1>
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
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm mb-6">
            <p className="text-white/80">
              Upload your photos to share with the community! All photos will be reviewed by an administrator before appearing in the gallery.
            </p>
          </div>
        )}

        {/* User Submitted Photos */}
        {userPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 hover:bg-white/20 transition-all duration-300"
              >
                <div className="aspect-square bg-white/10 rounded-lg mb-4 overflow-hidden relative">
                  {photo.photo_url ? (
                    <img
                      src={photo.photo_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📷
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(photo.status)}`}>
                      {photo.status === 'pending' && 'Pending Review'}
                      {photo.status === 'approved' && 'Approved'}
                      {photo.status === 'rejected' && 'Rejected'}
                    </div>
                  </div>
                </div>

                <h3 className="text-white font-medium">{photo.title}</h3>
                {photo.description && (
                  <p className="text-white/60 text-sm mt-1">{photo.description}</p>
                )}

                {photo.status === 'rejected' && photo.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-xs">
                      Rejection reason: {photo.rejection_reason}
                    </p>
                  </div>
                )}

                <p className="text-white/40 text-xs mt-2">
                  Submitted on {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 glass-card">
            <Camera className="h-12 w-12 mx-auto text-white/40 mb-4" />
            <p className="text-white/70">You haven't submitted any photos yet.</p>
            <button
              className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg"
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Community Gallery
            </h1>
            <p className="text-white/70">
              Browse photos by category • Scroll to rotate • Click to explore
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {approvedPhotos.length} approved photos
            </span>
          </div>
        </div>

        {/* Circular Gallery */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
          <div className="text-center p-12 glass-card">
            <Camera className="h-16 w-16 mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Photos Yet</h3>
            <p className="text-white/70 mb-6">
              The community gallery will display approved photos from residents.
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-400 hover:to-blue-500 transition-all"
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
