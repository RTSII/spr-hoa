import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProfilePictureUploadProps {
  onUploadComplete: (url: string) => void;
  currentPicture?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onUploadComplete,
  currentPicture
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'pending' | 'approved' | 'rejected'>('idle');
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showLargePreview, setShowLargePreview] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus('uploading');
      setSelectedFile(file);

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Update profile with new picture (pending approval)
      const { error: updateError } = await supabase
        .from('owner_profiles')
        .update({
          profile_picture_url: publicUrl,
          profile_picture_status: 'pending',
          profile_picture_submitted_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setUploadStatus('pending');
      onUploadComplete(publicUrl);

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const checkCurrentStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('profile_picture_status, profile_picture_rejection_reason, profile_picture_url')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUploadStatus(data.profile_picture_status || 'idle');
        setRejectionReason(data.profile_picture_rejection_reason || '');

        // Set preview URL if available
        if (data.profile_picture_url && !previewUrl) {
          setPreviewUrl(data.profile_picture_url);
        }
      }
    } catch (error) {
      console.error('Error checking profile picture status:', error);
    }
  };

  useEffect(() => {
    checkCurrentStatus();

    // Set up a polling interval to check status every 30 seconds
    const statusInterval = setInterval(checkCurrentStatus, 30000);

    return () => {
      clearInterval(statusInterval);
      // Clean up any preview URLs to avoid memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user]);

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return {
          text: 'Uploading your profile picture...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'pending':
        return {
          text: 'Your profile picture is pending admin approval',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'approved':
        return {
          text: 'Your profile picture has been approved',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'rejected':
        return {
          text: `Your profile picture was rejected: ${rejectionReason}`,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return null;
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setRejectionReason('');
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const refreshStatus = () => {
    checkCurrentStatus();
  };

  const statusMessage = getStatusMessage();
  const displayImage = previewUrl || currentPicture;

  return (
    <div className="space-y-4">
      <div className="bg-[#2953A6]/10 border border-[#2953A6]/40 rounded-lg p-4 mb-2 flex items-start gap-2">
        <div className="mt-1">
          <AlertTriangle className="h-5 w-5 text-[#2953A6] flex-shrink-0" />
        </div>
        <div>
          <h4 className="text-[#2953A6] font-medium">Profile Picture Guidelines</h4>
          <p className="text-[#2953A6]/90 text-sm mt-1">
            Your photo will be visible to other residents after it has been approved by the administrator.
            Please use a clear photo of yourself for easy identification in the community directory.
          </p>
        </div>
      </div>

      {/* Image Preview and Upload Area */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image Preview */}
        <div className="relative group">
          <motion.div
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer"
            style={{ borderColor: dragActive ? '#3B82F6' : '#E5E7EB' }}
            whileHover={{ scale: 1.05 }}
            onClick={() => displayImage && setShowLargePreview(true)}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Camera className="h-10 w-10 text-gray-400" />
              </div>
            )}

            {uploadStatus === 'pending' && (
              <motion.div
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-yellow-500 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </motion.div>
            )}

            {uploadStatus === 'approved' && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}

            {uploadStatus === 'rejected' && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <XCircle className="h-5 w-5" />
              </div>
            )}
          </motion.div>

          {displayImage && (
            <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={refreshStatus}
                className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
                title="Refresh Status"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 w-full">
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50/30'
                : uploadStatus === 'pending'
                ? 'border-yellow-300 bg-yellow-50/30'
                : uploadStatus === 'rejected'
                ? 'border-red-300 bg-red-50/30'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className={`h-10 w-10 mb-2 ${
                uploadStatus === 'pending' ? 'text-yellow-500' :
                uploadStatus === 'rejected' ? 'text-red-500' :
                'text-blue-500'
              }`} />

              <h3 className="text-lg font-medium text-gray-700 mb-1">
                {uploadStatus === 'pending'
                  ? 'Photo Pending Approval'
                  : uploadStatus === 'rejected'
                  ? 'Photo Rejected'
                  : 'Upload Profile Picture'}
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                {uploadStatus === 'pending'
                  ? 'An administrator will review your photo soon'
                  : uploadStatus === 'rejected'
                  ? 'Please upload a new photo that meets our guidelines'
                  : 'Drag & drop your photo here or click to browse'}
              </p>

              {(uploadStatus !== 'pending') && (
                <label className="cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-4 py-2 rounded-md ${
                      uploadStatus === 'rejected'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium transition-colors`}
                  >
                    {uploading ? 'Uploading...' : uploadStatus === 'rejected' ? 'Try Again' : 'Select Photo'}
                  </motion.div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || uploadStatus === 'pending'}
                    className="hidden"
                  />
                </label>
              )}

              {uploadStatus === 'pending' && (
                <p className="text-xs text-yellow-700 italic mt-2">
                  Please wait while an administrator reviews your photo
                </p>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <motion.div
              className={`p-3 rounded-md mt-3 ${statusMessage.bgColor}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                {uploadStatus === 'uploading' && <div className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent border-blue-600 animate-spin"></div>}
                {uploadStatus === 'pending' && <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />}
                {uploadStatus === 'approved' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                {uploadStatus === 'rejected' && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                <p className={`text-sm ${statusMessage.color}`}>{statusMessage.text}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Large Preview Modal */}
      <AnimatePresence>
        {showLargePreview && displayImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLargePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl max-h-[80vh] bg-white rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={displayImage}
                alt="Profile"
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setShowLargePreview(false)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePictureUpload;
