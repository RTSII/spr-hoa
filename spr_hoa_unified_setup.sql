-- SPR HOA Unified Setup Script (Enhanced Admin System)
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id),
  UNIQUE(unit_number)
);

-- 4. Enhanced Admin Users Table with Activity Tracking
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) DEFAULT 'admin',
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Admin Activity Log Table (Enhanced Feature)
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'message_sent', 'user_managed', etc.
  activity_description TEXT,
  metadata JSONB, -- Store additional data like message recipients, etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. System Settings Table (For Admin Configuration)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Enhanced Owner Messages Table
CREATE TABLE IF NOT EXISTS owner_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES owner_profiles(id) ON DELETE CASCADE,
  sent_by_admin UUID REFERENCES admin_users(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'info', -- 'emergency', 'notice', 'info'
  broadcast BOOLEAN DEFAULT false, -- true for all residents
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB -- For additional message data
);

-- 8. Registration Tokens Table (Enhanced)
CREATE TABLE IF NOT EXISTS registration_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_number VARCHAR(10) NOT NULL REFERENCES owners_master(unit_number),
  hoa_last4 VARCHAR(4) NOT NULL,
  token VARCHAR(32) NOT NULL UNIQUE,
  created_by UUID REFERENCES admin_users(id),
  used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Insert Default System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('portal_name', 'Sandpiper Run Owners Portal', 'string', 'Main portal name displayed to users'),
('maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('session_timeout_hours', '24', 'number', 'Hours before user session expires'),
('emergency_contact_email', 'rtsii10@gmail.com', 'string', 'Emergency contact email for system issues'),
('auto_approve_photos', 'false', 'boolean', 'Automatically approve uploaded photos')
ON CONFLICT (setting_key) DO NOTHING;

-- 10. Create Admin Setup Function
CREATE OR REPLACE FUNCTION setup_admin_account(admin_email TEXT, admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert admin record
  INSERT INTO admin_users (user_id, email, role, login_count, created_at)
  VALUES (admin_user_id, admin_email, 'admin', 0, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    email = admin_email,
    updated_at = NOW();

  -- Log admin creation
  INSERT INTO admin_activity_log (
    admin_user_id,
    activity_type,
    activity_description,
    created_at
  ) VALUES (
    (SELECT id FROM admin_users WHERE user_id = admin_user_id),
    'account_created',
    'Admin account created/updated',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 11. Create Admin Activity Logging Function
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_email TEXT,
  activity_type TEXT,
  activity_description TEXT DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get admin ID
  SELECT id INTO admin_id FROM admin_users WHERE email = admin_email;

  IF admin_id IS NOT NULL THEN
    INSERT INTO admin_activity_log (
      admin_user_id,
      activity_type,
      activity_description,
      metadata,
      created_at
    ) VALUES (
      admin_id,
      activity_type,
      activity_description,
      metadata_json,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. Row Level Security (RLS) Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin users can only see their own records
CREATE POLICY "Admin users can view own record" ON admin_users
  FOR SELECT USING (auth.email() = email);

-- Admin activity log is viewable by the admin who created it
CREATE POLICY "Admin can view own activity" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = admin_activity_log.admin_user_id
      AND admin_users.email = auth.email()
    )
  );

-- System settings are viewable by any admin
CREATE POLICY "Admins can view system settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.email()
    )
  );

-- 13. Insert Sample Data (Optional)
-- Uncomment and customize as needed

-- Sample owners master data
-- INSERT INTO owners_master (unit_number, hoa_account_number) VALUES
-- ('101', '7000001234'),
-- ('102', '7000001235'),
-- ('201', '7000002234'),
-- ('202', '7000002235')
-- ON CONFLICT (unit_number) DO NOTHING;

-- 14. Setup Instructions
/*
ADMIN SETUP INSTRUCTIONS:

1. After running this script, create your admin account in Supabase Auth:
   - Go to Authentication > Users in your Supabase dashboard
   - Click "Add User"
   - Email: rtsii10@gmail.com
   - Password: your_secure_password (not "basedgod" for production)
   - Click "Create User"

2. Get your user UUID:
   SELECT id, email FROM auth.users WHERE email = 'rtsii10@gmail.com';

3. Run the admin setup function:
   SELECT setup_admin_account('rtsii10@gmail.com', 'YOUR-USER-UUID');

4. Your enhanced admin system is now ready with:
   ✅ Login tracking and analytics
   ✅ Activity logging
   ✅ System settings management
   ✅ Enhanced messaging system
   ✅ Security policies

ALTERNATIVELY: Let the app auto-create your admin record on first login!
*/
