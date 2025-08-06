-- SPR-HOA Photo Management System Setup
-- Run this script in Supabase SQL Editor

-- Create photo submissions table
CREATE TABLE IF NOT EXISTS photo_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT,
  photo_url TEXT, -- Alternative field for URL storage
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  category VARCHAR(50) DEFAULT 'community',
  submission_type VARCHAR(20) DEFAULT 'gallery_photo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add profile picture approval fields to owner_profiles
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_admin_notes TEXT;

-- Enable RLS on photo_submissions
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;

-- Photo submission policies
CREATE POLICY IF NOT EXISTS "Users can submit photos" ON photo_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own photos" ON photo_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view approved photos" ON photo_submissions
  FOR SELECT USING (status = 'approved');

CREATE POLICY IF NOT EXISTS "Admins can manage all photos" ON photo_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Profile picture policies
CREATE POLICY IF NOT EXISTS "Users can update own profile pictures" ON owner_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can update profile picture status" ON owner_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admin review photo function
CREATE OR REPLACE FUNCTION admin_review_photo(
  p_submission_id UUID,
  p_status VARCHAR,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update the photo submission
  UPDATE photo_submissions
  SET
    status = p_status,
    admin_notes = p_admin_notes,
    rejection_reason = CASE
      WHEN p_status = 'rejected' THEN p_rejection_reason
      ELSE NULL
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_submission_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin review profile picture function
CREATE OR REPLACE FUNCTION admin_review_profile_picture(
  p_profile_id UUID,
  p_status VARCHAR,
  p_rejection_reason TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update the profile picture status
  UPDATE owner_profiles
  SET
    profile_picture_status = p_status,
    profile_picture_reviewed_at = CURRENT_TIMESTAMP,
    profile_picture_rejection_reason = CASE
      WHEN p_status = 'rejected' THEN p_rejection_reason
      ELSE NULL
    END,
    profile_picture_admin_notes = p_admin_notes
  WHERE id = p_profile_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin stats function to include profile pictures
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'active_users', COALESCE((SELECT COUNT(*) FROM owner_profiles), 0),
    'total_users', COALESCE((SELECT COUNT(*) FROM owner_profiles), 0),
    'pending_photos', COALESCE((
      SELECT COUNT(*) FROM photo_submissions WHERE status = 'pending'
    ), 0) + COALESCE((
      SELECT COUNT(*) FROM owner_profiles WHERE profile_picture_status = 'pending'
    ), 0),
    'published_news', COALESCE((SELECT COUNT(*) FROM news_posts WHERE status = 'published'), 0),
    'messages_sent', COALESCE((SELECT COUNT(*) FROM admin_messages), 0),
    'recent_activity', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_submissions_updated_at
  BEFORE UPDATE ON photo_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage setup recommendations
COMMENT ON TABLE photo_submissions IS 'Photo submissions for community gallery and profile pictures';

-- Storage setup notes (displayed in SQL result)
SELECT '
IMPORTANT: Storage Setup Required
-----------------------------------
1. Create a "photos" bucket with public read access
2. Set up storage policies:
   - Allow authenticated users to upload photos
   - Allow users to read their own photos
   - Allow admins to manage all photos

Example policies:
- FOR INSERT: (auth.uid() = user_id)
- FOR SELECT: (auth.uid() = user_id OR bucket_id = "photos" AND object = "public/*")
- FOR ALL (admin): (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
' AS storage_setup_instructions;

-- Insert dummy admin user if not exists (for testing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'rtsii10@gmail.com') THEN
    -- First try to find user in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'rtsii10@gmail.com') THEN
      INSERT INTO admin_users (user_id, role)
      SELECT id, 'admin' FROM auth.users WHERE email = 'rtsii10@gmail.com';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to create test admin user: %', SQLERRM;
END $$;
