-- Align admin schema: news_posts, admin_messages, RPCs
-- Run this in Supabase SQL editor or via migration

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- NEWS POSTS: align to frontend expectations
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='news_posts' AND column_name='body'
  ) THEN
    ALTER TABLE news_posts RENAME COLUMN body TO content;
  END IF;
END $$;

-- Core columns
ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS featured_image_url text,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS search_vector tsvector,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Migrate is_published -> status if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='news_posts' AND column_name='is_published'
  ) THEN
    UPDATE news_posts
      SET status = CASE WHEN is_published THEN 'published' ELSE COALESCE(status,'draft') END
      WHERE status IS NULL;
    ALTER TABLE news_posts DROP COLUMN is_published;
  END IF;
END $$;

-- Search vector + updated_at trigger
CREATE OR REPLACE FUNCTION update_news_posts_tsv() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english', 
    coalesce(NEW.title,'') || ' ' || coalesce(NEW.content,'') || ' ' || array_to_string(COALESCE(NEW.tags, ARRAY[]::text[]), ' ')
  );
  NEW.updated_at := now();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS news_posts_vector_update ON news_posts;
CREATE TRIGGER news_posts_vector_update
  BEFORE INSERT OR UPDATE ON news_posts
  FOR EACH ROW EXECUTE PROCEDURE update_news_posts_tsv();

CREATE INDEX IF NOT EXISTS news_posts_search_idx ON news_posts USING GIN (search_vector);

-- ADMIN MESSAGES TABLE
CREATE TABLE IF NOT EXISTS admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type varchar(20) NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text NOT NULL,
  priority varchar(10) NOT NULL DEFAULT 'medium',
  recipients_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS for admin_messages: only admins can manage
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE polname='Admins can manage admin_messages'
  ) THEN
    CREATE POLICY "Admins can manage admin_messages" ON admin_messages
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
  END IF;
END $$;

-- RPC: send_admin_message
CREATE OR REPLACE FUNCTION send_admin_message(
  p_message_type varchar,
  p_title text,
  p_content text,
  p_priority varchar DEFAULT 'medium'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Require admin
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  INSERT INTO admin_messages (admin_user_id, message_type, title, content, priority)
  VALUES (auth.uid(), p_message_type, p_title, p_content, p_priority)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- RPC: get_admin_dashboard_stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'active_users', COALESCE((SELECT COUNT(*) FROM owner_profiles), 0),
    'total_users', COALESCE((SELECT COUNT(*) FROM owner_profiles), 0),
    'pending_photos', COALESCE((SELECT COUNT(*) FROM photo_submissions WHERE status = 'pending'), 0)
                      + COALESCE((SELECT COUNT(*) FROM owner_profiles WHERE profile_picture_status = 'pending'), 0),
    'published_news', COALESCE((SELECT COUNT(*) FROM news_posts WHERE status = 'published'), 0),
    'messages_sent', COALESCE((SELECT COUNT(*) FROM admin_messages), 0),
    'recent_activity', 0
  );
END;
$$;
