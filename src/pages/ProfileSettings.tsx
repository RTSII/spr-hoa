import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  directory_opt_in: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_unit: boolean;
  profile_picture_url?: string;
  profile_picture_status?: string;
  unit_number?: string;
}

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    directory_opt_in: false,
    show_email: false,
    show_phone: false,
    show_unit: true,
    profile_picture_url: '',
    profile_picture_status: 'idle'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const { error } = await supabase
        .from('owner_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          directory_opt_in: profile.directory_opt_in,
          show_email: profile.show_email,
          show_phone: profile.show_phone,
          show_unit: profile.show_unit
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, profile_picture_url: url, profile_picture_status: 'pending' }));
  };

  const handleRemoveFromDirectory = async () => {
    try {
      const { error } = await supabase
        .from('owner_profiles')
        .update({
          directory_opt_in: false,
          show_email: false,
          show_phone: false,
          show_unit: false
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        directory_opt_in: false,
        show_email: false,
        show_phone: false,
        show_unit: false
      }));

      setMessage('You have been removed from the directory.');
    } catch (error) {
      console.error('Error removing from directory:', error);
      setMessage('Error removing from directory. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
        <ProfilePictureUpload
          currentPicture={profile.profile_picture_url}
          onUploadComplete={handleProfilePictureUpdate}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Directory Privacy Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Include in Directory</label>
              <p className="text-sm text-gray-500">Allow other residents to find you in the directory</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.directory_opt_in}
                onChange={(e) => setProfile({ ...profile, directory_opt_in: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {profile.directory_opt_in && (
            <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show Unit Number</label>
                <input
                  type="checkbox"
                  checked={profile.show_unit}
                  onChange={(e) => setProfile({ ...profile, show_unit: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show Email</label>
                <input
                  type="checkbox"
                  checked={profile.show_email}
                  onChange={(e) => setProfile({ ...profile, show_email: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show Phone</label>
                <input
                  type="checkbox"
                  checked={profile.show_phone}
                  onChange={(e) => setProfile({ ...profile, show_phone: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Directory Preview</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
            {profile.directory_opt_in && profile.show_unit && <p><strong>Unit:</strong> {profile.unit_number}</p>}
            {profile.directory_opt_in && profile.show_email && <p><strong>Email:</strong> {profile.email}</p>}
            {profile.directory_opt_in && profile.show_phone && <p><strong>Phone:</strong> {profile.phone}</p>}
            {!profile.directory_opt_in && <p className="text-gray-500 italic">Not included in directory</p>}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {profile.directory_opt_in && (
          <button
            onClick={handleRemoveFromDirectory}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove from Directory
          </button>
        )}
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;