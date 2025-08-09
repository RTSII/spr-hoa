import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { storePhotoMetadata } from '../lib/supermemory';

interface PhotoGalleryUploadProps {
  onUploadComplete: () => void;
}

const PhotoGalleryUpload: React.FC<PhotoGalleryUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'pending' | 'approved' | 'rejected'>('idle');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadStatus('uploading');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!title.trim()) {
        alert('Please enter a title for your photo.');
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

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

      // Insert record into photo_submissions table
      const { data, error: insertError } = await supabase
        .from('photo_submissions')
        .insert([
          {
            user_id: user?.id,
            title,
            description,
            file_path: filePath,
            photo_url: publicUrl,
            category: 'community',
            status: 'pending'
          }
        ])
        .select();

      if (insertError) throw insertError;

      // Store photo metadata in Supermemory.ai
      if (data && data.length > 0) {
        const photoId = data[0].id;
        await storePhotoMetadata({
          title,
          description,
          category: 'community',
          photoUrl: publicUrl,
          userId: user?.id || '',
          status: 'pending'
        });
      }

      setUploadStatus('pending');
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo: ' + (error as Error).message);
      setUploadStatus('idle');
    } finally {
      setUploading(false);
    }
  };

  const getUserSubmissions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('photo_submissions')
      .select('status, rejection_reason, title, submitted_at')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (data && data.length > 0) {
      const latest = data[0];
      const allowedStatuses = ['idle', 'uploading', 'pending', 'approved', 'rejected'] as const;
      if (allowedStatuses.includes(latest.status)) {
        setUploadStatus(latest.status as typeof allowedStatuses[number]);
      }
      setRejectionReason(latest.rejection_reason || '');
    }
  };

  React.useEffect(() => {
    getUserSubmissions();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload to Gallery</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter photo title"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || uploadStatus === 'pending'}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {uploading ? 'Uploading...' : 'Upload a photo (pending admin approval)'}
          </p>
        </div>

        {uploadStatus === 'pending' && (
          <div className="p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              ⏳ Your photo is pending admin approval
            </p>
          </div>
        )}

        {uploadStatus === 'rejected' && (
          <div className="p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">
              ❌ Your photo was rejected: {rejectionReason}
            </p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setRejectionReason('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              Upload a new photo
            </button>
          </div>
        )}

        {uploadStatus === 'approved' && (
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Your photo has been approved and added to the gallery
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGalleryUpload;