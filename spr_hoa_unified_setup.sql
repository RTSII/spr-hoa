-- SPR HOA Unified Setup Script (Indie/Solo Admin)
-- Run this entire script in your Supabase SQL Editor
-- Admin: rtsii10@gmail.com

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Owners Master Table (Unit <-> HOA Account)
CREATE TABLE IF NOT EXISTS owners_master (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_number VARCHAR(10) NOT NULL UNIQUE,
  hoa_account_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(unit_number, hoa_account_number)
);

-- 3. Owner Profiles Table
CREATE TABLE IF NOT EXISTS owner_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  unit_number VARCHAR(10) NOT NULL REFERENCES owners_master(unit_number),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  directory_opt_in BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_unit BOOLEAN DEFAULT true,
  show_profile_photo BOOLEAN DEFAULT false,
  profile_picture_url TEXT,
  profile_picture_status VARCHAR(20) DEFAULT 'pending',
  profile_picture_rejection_reason TEXT,
  profile_picture_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIMEZONE('utc', NOW()),
  UNIQUE(user_id),
  UNIQUE(unit_number)
);

-- 4. Admin Users Table (Solo Admin)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Insert Yourself as Admin (replace USER_UUID after signup)
-- Get your user_id: SELECT id, email FROM auth.users WHERE email = 'rtsii10@gmail.com';
-- Then run:
-- INSERT INTO admin_users (user_id, email, role) VALUES ('YOUR-USER-UUID', 'rtsii10@gmail.com', 'admin');

-- 6. Onboarding Validation Function
CREATE OR REPLACE FUNCTION validate_owner_onboarding(unit_input TEXT, last4_input TEXT)
RETURNS TABLE(unit_number TEXT, hoa_account_number TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT unit_number, hoa_account_number
  FROM owners_master
  WHERE unit_number = unit_input
    AND RIGHT(hoa_account_number, 4) = last4_input
    AND hoa_account_number LIKE '7%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies
-- Owners Master: Anyone can read for verification
ALTER TABLE owners_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for verification" ON owners_master
  FOR SELECT USING (true);

-- Owner Profiles: Only owner or admin can update
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can update own profile" ON owner_profiles
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Owner can read own or opted-in profiles" ON owner_profiles
  FOR SELECT USING (directory_opt_in = true OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- 8. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE
    ON owner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_owner_profiles_unit_number ON owner_profiles(unit_number);

-- 10. Sample Data (Optional: Remove in production)
INSERT INTO owners_master (unit_number, hoa_account_number) VALUES
('B0G', '79999'),
('B2G', '73268')
ON CONFLICT (unit_number) DO NOTHING;

-- End of Setup
