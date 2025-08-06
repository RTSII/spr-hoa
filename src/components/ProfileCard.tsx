import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Home, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePictureUpload from './ProfilePictureUpload';

interface ProfileCardProps {
  editable?: boolean;
  minimal?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ editable = false, minimal = false }) => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPicture, setCurrentPicture] = useState<string | undefined>(profile?.profile_picture_url);

  if (!profile) return null;

  const handlePictureUploadComplete = (url: string) => {
    setCurrentPicture(url);
  };

  // Default profile picture if none exists
  const defaultProfilePicture = `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=0D8ABC&color=fff&size=256`;

  // Card style variations based on props
  const cardStyle = minimal
    ? "backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl overflow-hidden"
    : "backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardStyle}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Picture Section */}
          <div className="relative">
            {isEditing ? (
              <ProfilePictureUpload
                onUploadComplete={handlePictureUploadComplete}
                currentPicture={currentPicture}
              />
            ) : (
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden">
                  <img
                    src={currentPicture || defaultProfilePicture}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {editable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-4 w-4 text-white" />
                  </button>
                )}

                {/* Profile picture status indicator */}
                {profile.profile_picture_status === 'pending' && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    !
                  </div>
                )}

                {profile.profile_picture_status === 'rejected' && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    <X className="h-3 w-3" />
                  </div>
                )}
              </div>
            )}

            {isEditing && editable && (
              <div className="mt-3 flex justify-center space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm flex items-center"
                >
                  <X className="h-3 w-3 mr-1" /> Cancel
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
              <div className="flex items-center justify-center sm:justify-start text-white/80 gap-2">
                <Home className="h-4 w-4 text-teal-400" />
                <span>Unit {profile.unit_number}</span>
              </div>

              {!minimal && (
                <>
                  <div className="flex items-center justify-center sm:justify-start text-white/80 gap-2">
                    <Mail className="h-4 w-4 text-teal-400" />
                    <span>{profile.email}</span>
                  </div>

                  {profile.phone && (
                    <div className="flex items-center justify-center sm:justify-start text-white/80 gap-2">
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
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              Your profile picture is pending approval from the administrator.
            </p>
          </div>
        )}

        {profile.profile_picture_status === 'rejected' && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              Your profile picture was rejected: {profile.profile_picture_rejection_reason || 'No reason provided'}
            </p>
            {editable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-sm text-white bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-md transition-colors"
              >
                Upload New Picture
              </button>
            )}
          </div>
        )}
      </div>

      {!minimal && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900/50 to-teal-900/50 border-t border-white/10">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-teal-400 mr-2"></div>
            <span className="text-teal-300 text-sm font-medium">
              {profile.directory_opt_in ? 'Listed in Community Directory' : 'Not listed in Community Directory'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCard;
