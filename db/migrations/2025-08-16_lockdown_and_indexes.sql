-- Lock down internal content to authenticated users, add performance indexes, and secure storage
-- Paste into Supabase SQL editor and run top-to-bottom. Idempotent where possible.

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Photo submissions: restrict approved photos to authenticated only (no public)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photo_submissions'
      AND polname = 'Public can view approved photos'
  ) THEN
    DROP POLICY "Public can view approved photos" ON photo_submissions;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photo_submissions'
      AND polname = 'Authenticated can view approved photos'
  ) THEN
    CREATE POLICY "Authenticated can view approved photos" ON photo_submissions
      FOR SELECT TO authenticated
      USING (status = 'approved');
  END IF;
END $$;

-- 2) News posts: enable RLS and restrict reads to authenticated users for published posts
ALTER TABLE IF EXISTS news_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='news_posts'
      AND polname = 'Authenticated can read published news'
  ) THEN
    CREATE POLICY "Authenticated can read published news" ON news_posts
      FOR SELECT TO authenticated
      USING (status = 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='news_posts'
      AND polname = 'Admins can manage news_posts'
  ) THEN
    CREATE POLICY "Admins can manage news_posts" ON news_posts
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- 3) System settings: restrict reads to authenticated (adjust if you want some public configs)
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_settings'
      AND polname = 'Authenticated can view system_settings'
  ) THEN
    CREATE POLICY "Authenticated can view system_settings" ON system_settings
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_settings'
      AND polname = 'Admins can manage system_settings'
  ) THEN
    CREATE POLICY "Admins can manage system_settings" ON system_settings
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- 4) Owner profiles: make sure admin can read all, and users at least read their own
ALTER TABLE IF EXISTS owner_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='owner_profiles'
      AND polname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON owner_profiles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='owner_profiles'
      AND polname = 'Admins can manage owner_profiles'
  ) THEN
    CREATE POLICY "Admins can manage owner_profiles" ON owner_profiles
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- 5) Storage security: make photos bucket private and restrict access to authenticated users
-- Make bucket private (run once)
UPDATE storage.buckets SET public = FALSE WHERE name = 'photos';

-- Policies for storage.objects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
      AND polname = 'Authenticated can read photos bucket'
  ) THEN
    CREATE POLICY "Authenticated can read photos bucket" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'photos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
      AND polname = 'Authenticated can upload to photos bucket'
  ) THEN
    CREATE POLICY "Authenticated can upload to photos bucket" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'photos');
  END IF;
END $$;

-- Allow users to update/delete their own uploads; admins can manage all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
      AND polname = 'Users can manage own photos'
  ) THEN
    CREATE POLICY "Users can manage own photos" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'photos' AND owner = auth.uid())
      WITH CHECK (bucket_id = 'photos' AND owner = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
      AND polname = 'Admins can manage photos bucket'
  ) THEN
    CREATE POLICY "Admins can manage photos bucket" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id = 'photos' AND EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (bucket_id = 'photos' AND EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- IMPORTANT: After making the bucket private, update the frontend to use signed URLs
-- via supabase.storage.from('photos').createSignedUrl(path, expiresIn)

-- 6) Performance indexes
-- photo_submissions
CREATE INDEX IF NOT EXISTS idx_photo_submissions_status_created_at ON photo_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_user_created_at ON photo_submissions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_category ON photo_submissions (category);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_updated_at ON photo_submissions (updated_at DESC);

-- owner_profiles
CREATE INDEX IF NOT EXISTS idx_owner_profiles_user ON owner_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_pp_status ON owner_profiles (profile_picture_status);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_unit_number ON owner_profiles (unit_number);

-- news_posts
CREATE INDEX IF NOT EXISTS idx_news_posts_status_published_at ON news_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts (category);
-- tags array GIN index for search/filtering
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'tags'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_news_posts_tags_gin ON news_posts USING GIN (tags);
  END IF;
END $$;

-- admin_messages
CREATE INDEX IF NOT EXISTS idx_admin_messages_sent_at ON admin_messages (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_priority ON admin_messages (priority);

-- system_settings
CREATE UNIQUE INDEX IF NOT EXISTS ux_system_settings_setting_key ON system_settings (setting_key);

-- user_activity_logs (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activity_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_created_at ON user_activity_logs (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_activity_logs_type ON user_activity_logs (activity_type);
  END IF;
END $$;

-- photo_categories (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_categories') THEN
    -- RLS for photo_categories
    ALTER TABLE photo_categories ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_categories'
        AND polname = 'Authenticated can view photo_categories'
    ) THEN
      CREATE POLICY "Authenticated can view photo_categories" ON photo_categories
        FOR SELECT TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_categories'
        AND polname = 'Admins can manage photo_categories'
    ) THEN
      CREATE POLICY "Admins can manage photo_categories" ON photo_categories
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
        WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
    END IF;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_photo_categories_name ON photo_categories (name);
  END IF;
END $$;

-- admin_users safety
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_users_user_id ON admin_users (user_id);
