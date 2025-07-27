-- Complete Sandpiper Run Portal Database Setup
-- Run this entire script in your Supabase SQL Editor

-- First, run the main setup
-- This creates all tables and populates the owners_master table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create owners_master table (contains all unit/account data from index.html)
CREATE TABLE IF NOT EXISTS owners_master (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_number VARCHAR(10) NOT NULL UNIQUE,
  hoa_account_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create owner_profiles table
CREATE TABLE IF NOT EXISTS owner_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_number VARCHAR(10) NOT NULL REFERENCES owners_master(unit_number),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  directory_opt_in BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_unit BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id),
  UNIQUE(unit_number)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create forms_submissions table
CREATE TABLE IF NOT EXISTS forms_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_type VARCHAR(50) NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  form_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_owner_profiles_user_id ON owner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_unit_number ON owner_profiles(unit_number);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forms_submissions_submitted_by ON forms_submissions(submitted_by);

-- Insert all unit/account data from index.html
INSERT INTO owners_master (unit_number, hoa_account_number) VALUES
('A1A', '73298'),
('A1B', '73299'),
('A1C', '73300'),
('A1D', '73301'),
('A2A', '73302'),
('A2B', '73303'),
('A2C', '73304'),
('A2D', '73305'),
('A3A', '73306'),
('A3B', '73307'),
('A3C', '73308'),
('A3D', '73309'),
('A4A', '73310'),
('A4B', '73311'),
('A4C', '73312'),
('A4D', '73313'),
('A5A', '73314'),
('A5B', '73315'),
('A5C', '73316'),
('A5D', '73317'),
('A6A', '73318'),
('A6B', '73319'),
('A6C', '73320'),
('A6D', '73321'),
('A7A', '73322'),
('A7B', '73323'),
('A7C', '73324'),
('A7D', '73325'),
('A8A', '73326'),
('A8B', '73327'),
('A8C', '73328'),
('A8D', '73329'),
('A9A', '73330'),
('A9B', '73331'),
('A9C', '73332'),
('A9D', '73333'),
('B1A', '73334'),
('B1B', '73335'),
('B1C', '73336'),
('B1D', '73337'),
('B2A', '73338'),
('B2B', '73339'),
('B2C', '73340'),
('B2D', '73341'),
('B3A', '73342'),
('B3B', '73343'),
('B3C', '73344'),
('B3D', '73345'),
('B4A', '73346'),
('B4B', '73347'),
('B4C', '73348'),
('B4D', '73349'),
('B5A', '73350'),
('B5B', '73351'),
('B5C', '73352'),
('B5D', '73353'),
('B6A', '73354'),
('B6B', '73355'),
('B6C', '73356'),
('B6D', '73357'),
('B7A', '73358'),
('B7B', '73359'),
('B7C', '73360'),
('B7D', '73361'),
('B8A', '73362'),
('B8B', '73363'),
('B8C', '73364'),
('B8D', '73365'),
('B9A', '73366'),
('B9B', '73367'),
('B9C', '73368'),
('B9D', '73369'),
('C1A', '73370'),
('C1B', '73371'),
('C1C', '73372'),
('C1D', '73373'),
('C2A', '73374'),
('C2B', '73375'),
('C2C', '73376'),
('C2D', '73377'),
('C3A', '73378'),
('C3B', '73379'),
('C3C', '73380'),
('C3D', '73381'),
('C4A', '73382'),
('C4B', '73383'),
('C4C', '73384'),
('C4D', '73385'),
('C5A', '73386'),
('C5B', '73387'),
('C5C', '73388'),
('C5D', '73389'),
('C6A', '73390'),
('C6B', '73391'),
('C6C', '73392'),
('C6D', '73393'),
('C7A', '73394'),
('C7B', '73395'),
('C7C', '73396'),
('C7D', '73397'),
('C8A', '73398'),
('C8B', '73399'),
('C8C', '73400'),
('C8D', '73401'),
('C9A', '73402'),
('C9B', '73403'),
('C9C', '73404'),
('C9D', '73405'),
('D1A', '73406'),
('D1B', '73407'),
('D1C', '73408'),
('D1D', '73409'),
('D2A', '73410'),
('D2B', '73411'),
('D2C', '73412'),
('D2D', '73413'),
('D3A', '73414'),
('D3B', '73415'),
('D3C', '73416'),
('D3D', '73417'),
('D4A', '73418'),
('D4B', '73419'),
('D4C', '73420'),
('D4D', '73421'),
('D5A', '73422'),
('D5B', '73423'),
('D5C', '73424'),
('D5D', '73425'),
('D6A', '73426'),
('D6B', '73427'),
('D6C', '73428'),
('D6D', '73429'),
('D7A', '73430'),
('D7B', '73431'),
('D7C', '73432'),
('D7D', '73433'),
('D8A', '73434'),
('D8B', '73435'),
('D8C', '73436'),
('D8D', '73437'),
('D9A', '73438'),
('D9B', '73439'),
('D9C', '73440'),
('D9D', '73441'),
('E1A', '73442'),
('E1B', '73443'),
('E1C', '73444'),
('E1D', '73445'),
('E2A', '73446'),
('E2B', '73447'),
('E2C', '73448'),
('E2D', '73449'),
('E3A', '73450'),
('E3B', '73451'),
('E3C', '73452'),
('E3D', '73453'),
('E4A', '73454'),
('E4B', '73455'),
('E4C', '73456'),
('E4D', '73457'),
('E5A', '73458'),
('E5B', '73459'),
('E5C', '73460'),
('E5D', '73461'),
('E5E', '73462')
ON CONFLICT (unit_number) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view directory profiles" ON owner_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON owner_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON owner_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON owner_profiles;
DROP POLICY IF EXISTS "Authenticated users can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can view published news" ON news_articles;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON photos;
DROP POLICY IF EXISTS "Users can view their own submissions" ON forms_submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON forms_submissions;

-- Create RLS policies

-- Owner profiles: Users can read all profiles in directory, but only update their own
CREATE POLICY "Users can view directory profiles" ON owner_profiles
  FOR SELECT USING (directory_opt_in = true);

CREATE POLICY "Users can view their own profile" ON owner_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON owner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON owner_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events: All authenticated users can view
CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Community posts: All authenticated users can view and create
CREATE POLICY "Authenticated users can view posts" ON community_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- News articles: All authenticated users can view published articles
CREATE POLICY "Authenticated users can view published news" ON news_articles
  FOR SELECT USING (published = true AND auth.role() = 'authenticated');

-- Photos: All authenticated users can view
CREATE POLICY "Authenticated users can view photos" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Forms submissions: Users can only view and create their own
CREATE POLICY "Users can view their own submissions" ON forms_submissions
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create submissions" ON forms_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_owner_profiles_updated_at ON owner_profiles;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
DROP TRIGGER IF EXISTS update_forms_submissions_updated_at ON forms_submissions;

-- Create triggers for updated_at
CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE
    ON owner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE
    ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE
    ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE
    ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_submissions_updated_at BEFORE UPDATE
    ON forms_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;