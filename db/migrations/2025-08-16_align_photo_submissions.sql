-- Align photo submissions schema, RLS, and RPCs for single-admin workflow
-- Run in Supabase SQL Editor or apply via your migration tooling

-- 0) Ensure extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) photo_submissions: ensure columns used by frontend exist
ALTER TABLE IF EXISTS photo_submissions
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20) DEFAULT 'gallery_photo',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure status column exists with sensible default
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='photo_submissions' AND column_name='status'
  ) THEN
    ALTER TABLE photo_submissions ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

-- 2) Trigger to auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_photo_submissions_updated_at ON photo_submissions;
CREATE TRIGGER trg_photo_submissions_updated_at
  BEFORE UPDATE ON photo_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3) RLS for photo_submissions: single-admin moderation + resident visibility
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submissions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'photo_submissions' AND polname = 'Users can submit photos'
  ) THEN
    CREATE POLICY "Users can submit photos" ON photo_submissions
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can view their own submissions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'photo_submissions' AND polname = 'Users can view own photos'
  ) THEN
    CREATE POLICY "Users can view own photos" ON photo_submissions
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Public (or at least authenticated) can view approved photos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'photo_submissions' AND polname = 'Public can view approved photos'
  ) THEN
    CREATE POLICY "Public can view approved photos" ON photo_submissions
      FOR SELECT TO public
      USING (status = 'approved');
  END IF;
END $$;

-- Admins can manage all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'photo_submissions' AND polname = 'Admins can manage all photos'
  ) THEN
    CREATE POLICY "Admins can manage all photos" ON photo_submissions
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- 4) RPCs used by frontend
-- Admin review photo (frontend calls admin_review_photo)
CREATE OR REPLACE FUNCTION admin_review_photo(
  p_submission_id UUID,
  p_status VARCHAR,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Require admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE photo_submissions
  SET
    status = p_status,
    admin_notes = p_admin_notes,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_submission_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: drop legacy function name to avoid confusion (frontend does not use it)
DO $$ BEGIN
  -- Drop only if the specific signature exists to avoid migration failure
  PERFORM 1
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.proname = 'review_photo_submission'
    AND n.nspname = 'public'
    AND pg_get_function_identity_arguments(p.oid) = 'uuid, character varying, text, text';

  IF FOUND THEN
    DROP FUNCTION IF EXISTS review_photo_submission(UUID, VARCHAR, TEXT, TEXT);
  END IF;
END $$;

-- 5) owner_profiles: align profile picture defaults for moderation
ALTER TABLE IF EXISTS owner_profiles
  ALTER COLUMN profile_picture_status SET DEFAULT 'idle';

-- Ensure auxiliary columns exist
ALTER TABLE IF EXISTS owner_profiles
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_admin_notes TEXT;

-- Admin RPC for profile picture review
CREATE OR REPLACE FUNCTION admin_review_profile_picture(
  p_profile_id UUID,
  p_status VARCHAR,
  p_rejection_reason TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE owner_profiles
  SET
    profile_picture_status = p_status,
    profile_picture_reviewed_at = CURRENT_TIMESTAMP,
    profile_picture_rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    profile_picture_admin_notes = p_admin_notes
  WHERE id = p_profile_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
