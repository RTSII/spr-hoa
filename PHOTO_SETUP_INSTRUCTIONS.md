# Photo Management System Setup Instructions

## Option 1: Manual Setup (Recommended)

### Step 1: Access Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query**

### Step 2: Run the SQL Setup Script
1. Open the file `PHOTO_MANAGEMENT_SETUP.sql` in this project
2. Copy the entire contents
3. Paste into the SQL Editor window
4. Click **RUN** to execute all commands

### Step 3: Set Up Storage Bucket
1. In your Supabase Dashboard, go to **Storage**
2. Click **Create new bucket**
3. Name it `photos`
4. Check the **Public bucket** option
5. Set a file size limit (e.g., 10MB)
6. Click **Create bucket**

### Step 4: Configure Storage Policies
1. Navigate to the `photos` bucket
2. Go to the **Policies** tab
3. Add the following policies:
   - **Name**: "Allow authenticated uploads"
   - **Allowed operations**: INSERT
   - **Target roles**: authenticated
   - **Policy definition**: `(bucket_id = 'photos')`

   - **Name**: "Allow users to view own photos"
   - **Allowed operations**: SELECT
   - **Target roles**: authenticated
   - **Policy definition**: `(bucket_id = 'photos' AND auth.uid() = (storage.foldername(name))[1]::uuid)`

   - **Name**: "Allow admins to manage photos"
   - **Allowed operations**: SELECT, INSERT, UPDATE, DELETE
   - **Target roles**: authenticated
   - **Policy definition**: `(bucket_id = 'photos' AND EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))`

   - **Name**: "Allow public access to photos"
   - **Allowed operations**: SELECT
   - **Target roles**: anon
   - **Policy definition**: `(bucket_id = 'photos')`

### Step 5: Verify Admin User Setup
1. Run the following SQL in the SQL Editor to check for admin users:
   ```sql
   SELECT * FROM admin_users;
   ```
2. If no results appear, add your admin user:
   ```sql
   -- First, find your user ID
   SELECT id FROM auth.users WHERE email = 'rtsii10@gmail.com';

   -- Then, insert into admin_users (replace YOUR_USER_ID with the ID from above)
   INSERT INTO admin_users (user_id, role)
   VALUES ('YOUR_USER_ID', 'admin');
   ```

## Option 2: Using JavaScript Setup Script (Advanced)

For those who have Node.js and service role access:

1. Make sure you have `@supabase/supabase-js` installed:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Run the setup script:
   ```bash
   node setup-photo-management.js
   ```

## Testing Your Setup

### Admin Photo Management
1. Log in as admin: `rtsii10@gmail.com` / `basedgod`
2. Click the **Photo Management** feature in the admin dashboard
3. The system should load without errors and show statistics
4. Test filtering between profile and community photos
5. Initially, there may be no photos - that's expected!

### Profile Picture Upload (User Side)
1. Log in as a regular user
2. Go to profile settings
3. Upload a profile picture
4. Verify it shows as "pending approval"
5. Log back in as admin
6. Go to Photo Management and approve/reject the profile picture
7. Log back in as the user to verify the status update

### Community Photo Upload
1. Log in as a regular user
2. Go to the Photos section
3. Upload a community photo
4. Verify it shows as "pending approval"
5. Log back in as admin
6. Go to Photo Management and approve/reject the photo
7. Log back in as the user to verify the status update

## Troubleshooting

### Storage Bucket Issues
- Ensure your Supabase storage service is activated
- Verify the policies allow uploads from authenticated users
- Check file size limits if large uploads fail

### RLS Policy Issues
- If users can't see their own photos, verify the RLS policies
- If admins can't manage photos, check the admin_users table

### Function Execution Errors
- If you see function execution errors, try running each function separately
- Make sure all required tables exist before creating functions

### Admin Access Issues
- Verify your admin user exists in both auth.users and admin_users tables
- Ensure the user_id in admin_users matches your admin user's UUID
