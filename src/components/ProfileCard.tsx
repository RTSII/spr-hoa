import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Home, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfilePictureUpload from './ProfilePictureUpload'

interface ProfileCardProps {
  editable?: boolean
  minimal?: boolean
}

const ProfileCard: React.FC<ProfileCardProps> = ({ editable = false, minimal = false }) => {
  const { profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [currentPicture, setCurrentPicture] = useState<string | undefined>(
    profile?.profile_picture_url,
  )

  if (!profile) return null

  const handlePictureUploadComplete = (url: string) => {
    setCurrentPicture(url)
  }

  // Default profile picture if none exists
  const defaultProfilePicture = `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=0D8ABC&color=fff&size=256`

  // Card style variations based on props
  const cardStyle = minimal
    ? 'backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl overflow-hidden'
    : 'backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardStyle}
    >
      <div className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Profile Picture Section */}
          <div className="relative">
            {isEditing ? (
              <ProfilePictureUpload
                onUploadComplete={handlePictureUploadComplete}
                currentPicture={currentPicture}
              />
            ) : (
              <div className="group relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/20">
                  <img
                    src={currentPicture || defaultProfilePicture}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                {editable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Edit2 className="h-4 w-4 text-white" />
                  </button>
                )}

                {/* Profile picture status indicator */}
                {profile.profile_picture_status === 'pending' && (
                  <div className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-yellow-500 text-xs text-white">
                    !
                  </div>
                )}

                {profile.profile_picture_status === 'rejected' && (
                  <div className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs text-white">
                    <X className="h-3 w-3" />
                  </div>
                )}
              </div>
            )}

            {isEditing && editable && (
              <div className="mt-3 flex justify-center space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                >
                  <X className="mr-1 h-3 w-3" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">
              {profile.first_name} {profile.last_name}
            </h2>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                <Home className="h-4 w-4 text-teal-400" />
                <span>Unit {profile.unit_number}</span>
              </div>

              {!minimal && (
                <>
                  <div className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                    <Mail className="h-4 w-4 text-teal-400" />
                    <span>{profile.email}</span>
                  </div>

                  {profile.phone && (
                    <div className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                      <Phone className="h-4 w-4 text-teal-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Picture Status Messages */}
        {currentPicture && profile.profile_picture_status === 'pending' && (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/20 p-3">
            <p className="text-sm text-yellow-300">
              Your profile picture is pending approval from the administrator.
            </p>
          </div>
        )}

        {profile.profile_picture_status === 'rejected' && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
            <p className="text-sm text-red-300">
              Your profile picture was rejected:{' '}
              {profile.profile_picture_rejection_reason || 'No reason provided'}
            </p>
            {editable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 rounded-md bg-red-500/30 px-3 py-1 text-sm text-white transition-colors hover:bg-red-500/50"
              >
                Upload New Picture
              </button>
            )}
          </div>
        )}
      </div>

      {!minimal && (
        <div className="border-t border-white/10 bg-gradient-to-r from-blue-900/50 to-teal-900/50 px-6 py-4">
          <div className="flex items-center">
            <div className="mr-2 h-2 w-2 rounded-full bg-teal-400"></div>
            <span className="text-sm font-medium text-teal-300">
              {profile.directory_opt_in
                ? 'Listed in Community Directory'
                : 'Not listed in Community Directory'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProfileCard
