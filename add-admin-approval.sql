-- Admin Review/Approval System for Profile Pictures and Photo Gallery
-- Run this script after the main database setup

-- Add approval status columns to existing tables
ALTER TABLE owner_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS profile_picture_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update photos table to include approval workflow
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_profile_picture BOOLEAN DEFAULT false;

-- Create admin_users table to track admin permissions
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(20) DEFAULT 'moderator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id)
);

-- Create photo_submissions table for better tracking
CREATE TABLE IF NOT EXISTS photo_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('profile_picture', 'gallery_photo')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin review queue view
CREATE OR REPLACE VIEW admin_review_queue AS
SELECT 
  'profile_picture' as submission_type,
  op.user_id,
  op.first_name || ' ' || op.last_name as user_name,
  op.unit_number,
  op.profile_picture_url as photo_url,
  op.profile_picture_status as status,
  op.profile_picture_submitted_at as submitted_at,
  op.profile_picture_rejection_reason as rejection_reason,
  NULL as title,
  NULL as description
FROM owner_profiles op
WHERE op.profile_picture_url IS NOT NULL 
  AND op.profile_picture_status IN ('pending', 'rejected')

UNION ALL

SELECT 
  'gallery_photo' as submission_type,
  ps.user_id,
  op.first_name || ' ' || op.last_name as user_name,
  op.unit_number,
  ps.photo_url,
  ps.status,
  ps.submitted_at,
  ps.rejection_reason,
  ps.title,
  ps.description
FROM photo_submissions ps
JOIN owner_profiles op ON ps.user_id = op.user_id
WHERE ps.status IN ('pending', 'rejected')
ORDER BY submitted_at DESC;

-- Create approved_photos view for public display
CREATE OR REPLACE VIEW approved_photos AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.url,
  p.uploaded_by,
  op.first_name || ' ' || op.last_name as uploaded_by_name,
  op.unit_number,
  p.created_at
FROM photos p
JOIN owner_profiles op ON p.uploaded_by = op.user_id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC;

-- Create approved_profile_pictures view
CREATE OR REPLACE VIEW approved_profile_pictures AS
SELECT 
  op.user_id,
  op.first_name,
  op.last_name,
  op.unit_number,
  op.profile_picture_url,
  op.profile_picture_submitted_at
FROM owner_profiles op
WHERE op.profile_picture_status = 'approved';

-- Update RLS policies for admin access
-- Allow admins to update approval status
CREATE POLICY "Admins can update photo status" ON photos
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'moderator'))
  );

CREATE POLICY "Admins can update profile picture status" ON owner_profiles
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'moderator'))
  );

-- Allow admins to view all submissions
CREATE POLICY "Admins can view all submissions" ON photo_submissions
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'moderator'))
  );

-- Insert default admin (you'll need to update this with your user ID)
-- Run this after creating your account:
-- INSERT INTO admin_users (user_id, role, created_by) VALUES ('your-user-id', 'admin', 'your-user-id');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_submitted_by ON photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_picture_status ON owner_profiles(profile_picture_status);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_status ON photo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_user_id ON photo_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);