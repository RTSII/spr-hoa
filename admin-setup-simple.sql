-- Simple Admin Setup Script
-- Run this in Supabase SQL Editor after the main setup

-- Step 1: Add approval columns to existing tables
ALTER TABLE owner_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(20) DEFAULT 'moderator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 3: Create photo submissions table
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
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Create admin review view (fixed version)
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
  AND op.profile_picture_status = 'pending'

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
WHERE ps.status = 'pending'
ORDER BY submitted_at DESC;

-- Step 5: Create approved photos view (fixed version)
CREATE OR REPLACE VIEW approved_photos AS
SELECT 
  p.id,
  p.title,
  COALESCE(p.description, '') as description,
  p.url,
  p.uploaded_by,
  op.first_name || ' ' || op.last_name as uploaded_by_name,
  op.unit_number,
  p.created_at
FROM photos p
JOIN owner_profiles op ON p.uploaded_by = op.user_id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC;

-- Step 6: Create approved profile pictures view
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

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_picture_status ON owner_profiles(profile_picture_status);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_status ON photo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Step 8: Insert your admin user (replace with actual user ID)
-- First, find your user ID by running this query:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then run this with your actual user ID:
-- INSERT INTO admin_users (user_id, role) VALUES ('your-actual-user-id', 'admin');

-- Step 9: Test the setup
-- You can test with this query:
-- SELECT * FROM admin_review_queue;