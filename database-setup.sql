-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS owner_profiles CASCADE;
DROP TABLE IF EXISTS owners_master CASCADE;

-- Create owners_master table
CREATE TABLE owners_master (
  unit_number VARCHAR(10) PRIMARY KEY,
  hoa_account_number VARCHAR(10) NOT NULL
);

-- Create owner_profiles table
CREATE TABLE owner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  unit_number VARCHAR(10) NOT NULL REFERENCES owners_master(unit_number),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  directory_opt_in BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  show_unit BOOLEAN DEFAULT TRUE
);

-- Insert test data into owners_master
INSERT INTO owners_master (unit_number, hoa_account_number) VALUES
('B0G', '79999'),
('B2G', '73268')
ON CONFLICT (unit_number) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE owners_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for owners_master: allow all users to read
CREATE POLICY "Allow read owners_master for verification" ON owners_master
  FOR SELECT USING (true);

-- RLS policies for owner_profiles
-- Users can insert their own profile if user_id matches auth.uid()
CREATE POLICY "Users can insert own profile" ON owner_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read profiles if opted in or own profile
CREATE POLICY "Users can read opted-in profiles" ON owner_profiles
  FOR SELECT USING (directory_opt_in = true OR auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON owner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_owner_profiles_unit_number ON owner_profiles(unit_number);

-- Additional setup can be added here

-- Note: This script avoids any ALTER VIEW or problematic statements
