import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface ReviewItem {
  submission_type: 'profile_picture' | 'gallery_photo'
  user_id: string
  user_name: string
  unit_number: string
  photo_url: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  rejection_reason?: string
  title?: string
  description?: string
}

const AdminReviewPanel: React.FC = () => {
  const { user } = useAuth()
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    fetchReviewItems()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (data && (data.role === 'admin' || data.role === 'moderator')) {
      setIsAdmin(true)
    }
  }

  const fetchReviewItems = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_review_queue')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setReviewItems(data || [])
    } catch (error) {
      console.error('Error fetching review items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (item: ReviewItem) => {
    try {
      if (item.submission_type === 'profile_picture') {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'approved',
            profile_picture_reviewed_by: user?.id,
            profile_picture_reviewed_at: new Date().toISOString(),
          })
          .eq('user_id', item.user_id)
      } else {
        await supabase
          .from('photo_submissions')
          .update({
            status: 'approved',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('user_id', item.user_id)
          .eq('photo_url', item.photo_url)

        // Also create the actual photo record
        await supabase.from('photos').insert({
          title: item.title || 'Gallery Photo',
          description: item.description,
          url: item.photo_url,
          uploaded_by: item.user_id,
          status: 'approved',
        })
      }

      setReviewItems((prev) =>
        prev.filter((i) => !(i.user_id === item.user_id && i.photo_url === item.photo_url)),
      )
    } catch (error) {
      console.error('Error approving item:', error)
    }
  }

  const handleReject = async (item: ReviewItem) => {
    if (!rejectionReason.trim()) return

    try {
      if (item.submission_type === 'profile_picture') {
        await supabase
          .from('owner_profiles')
          .update({
            profile_picture_status: 'rejected',
            profile_picture_rejection_reason: rejectionReason,
            profile_picture_reviewed_by: user?.id,
            profile_picture_reviewed_at: new Date().toISOString(),
          })
          .eq('user_id', item.user_id)
      } else {
        await supabase
          .from('photo_submissions')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('user_id', item.user_id)
          .eq('photo_url', item.photo_url)
      }

      setReviewItems((prev) =>
        prev.filter((i) => !(i.user_id === item.user_id && i.photo_url === item.photo_url)),
      )
      setSelectedItem(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting item:', error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Admin Access Required</h2>
        <p className="text-gray-600">You don't have admin privileges to access this panel.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-center">Loading review items...</div>
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Admin Review Panel</h2>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          Pending Reviews ({reviewItems.length})
        </h3>
      </div>

      <div className="space-y-4">
        {reviewItems.map((item) => (
          <div key={`${item.user_id}-${item.photo_url}`} className="rounded-lg border p-4">
            <div className="flex items-start space-x-4">
              <img
                src={item.photo_url}
                alt={item.title || 'Profile Picture'}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {item.submission_type === 'profile_picture'
                      ? 'Profile Picture'
                      : 'Gallery Photo'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.unit_number} - {item.user_name}
                  </span>
                </div>

                {item.title && <h4 className="font-semibold text-gray-800">{item.title}</h4>}

                {item.description && (
                  <p className="mb-2 text-sm text-gray-600">{item.description}</p>
                )}

                <p className="text-xs text-gray-500">
                  Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                </p>

                {item.rejection_reason && (
                  <p className="mt-1 text-sm text-red-600">
                    Previous rejection: {item.rejection_reason}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(item)}
                  className="rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviewItems.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No pending reviews</p>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Reject Submission</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mb-4 h-24 w-full rounded-md border p-2"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleReject(selectedItem)}
                disabled={!rejectionReason.trim()}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setRejectionReason('')
                }}
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviewPanel
