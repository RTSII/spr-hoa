-- Create a user_roles table to assign roles to users
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL
);

-- Insert your user_id and assign admin role (replace 'your-user-uuid' with your actual user UUID)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-user-uuid', 'admin');

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
DECLARE
  current_role TEXT;
BEGIN
  SELECT role INTO current_role FROM user_roles WHERE user_id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify RLS policies to use is_admin() function

-- owner_profiles: Admin can read and update all profiles
DROP POLICY IF EXISTS "Admin can read all profiles" ON owner_profiles;
CREATE POLICY "Admin can read all profiles" ON owner_profiles
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all profiles" ON owner_profiles;
CREATE POLICY "Admin can update all profiles" ON owner_profiles
    FOR UPDATE USING (is_admin());

-- photos: Admin can read and update all photos
DROP POLICY IF EXISTS "Admin can read all photos" ON photos;
CREATE POLICY "Admin can read all photos" ON photos
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all photos" ON photos;
CREATE POLICY "Admin can update all photos" ON photos
    FOR UPDATE USING (is_admin());

-- owners_master: Allow unauthenticated read for verification (optional, less secure)
DROP POLICY IF EXISTS "Allow read owners_master for verification" ON owners_master;
CREATE POLICY "Allow read owners_master for verification" ON owners_master
    FOR SELECT USING (true);

-- Note: For production, consider using a secure server-side function for verification instead of open read
