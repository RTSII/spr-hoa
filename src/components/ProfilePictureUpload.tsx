import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadStatus('uploading');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
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

  const checkCurrentStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('owner_profiles')
      .select('profile_picture_status, profile_picture_rejection_reason')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUploadStatus(data.profile_picture_status || 'idle');
      setRejectionReason(data.profile_picture_rejection_reason || '');
    }
  };

  React.useEffect(() => {
    checkCurrentStatus();
  }, [user]);

  const getStatusMessage = () => {
    switch (uploadStatus) {
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

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={currentPicture || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
          {uploadStatus === 'pending' && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              ⏳
            </div>
          )}
          {uploadStatus === 'approved' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              ✓
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || uploadStatus === 'pending'}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {uploading ? 'Uploading...' : 'Upload a profile picture (pending admin approval)'}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-md ${statusMessage.bgColor}`}>
          <p className={`text-sm ${statusMessage.color}`}>{statusMessage.text}</p>
        </div>
      )}

      {uploadStatus === 'rejected' && (
        <button
          onClick={() => {
            setUploadStatus('idle');
            setRejectionReason('');
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Upload a new picture
        </button>
      )}
    </div>
  );
};

export default ProfilePictureUpload;