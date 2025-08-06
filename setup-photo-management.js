import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.log('Please make sure your .env file contains:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define SQL statements for photo management setup
const SQL_STATEMENTS = [
  // Create photo submissions table
  `CREATE TABLE IF NOT EXISTS photo_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    admin_notes TEXT,
    category VARCHAR(50) DEFAULT 'community',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Add profile picture approval fields to owner_profiles
  `ALTER TABLE owner_profiles
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_admin_notes TEXT`,

  // Enable RLS on photo_submissions
  `ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY`,

  // Photo submission policies
  `CREATE POLICY IF NOT EXISTS "Users can submit photos" ON photo_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id)`,

  `CREATE POLICY IF NOT EXISTS "Users can view own photos" ON photo_submissions
    FOR SELECT USING (user_id = auth.uid())`,

  `CREATE POLICY IF NOT EXISTS "Admins can manage all photos" ON photo_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    )`,

  // Profile picture policies
  `CREATE POLICY IF NOT EXISTS "Users can update own profile pictures" ON owner_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)`,

  `CREATE POLICY IF NOT EXISTS "Admins can update profile picture status" ON owner_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    )`,

  // Admin review photo function
  `CREATE OR REPLACE FUNCTION admin_review_photo(
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
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  // Admin review profile picture function
  `CREATE OR REPLACE FUNCTION admin_review_profile_picture(
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
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  // Update admin stats function to include profile pictures
  `CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
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
  $$ LANGUAGE plpgsql SECURITY DEFINER`
];

// Run SQL setup
async function runSqlSetup() {
  console.log('🚀 Setting up photo management database tables...');

  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const statement = SQL_STATEMENTS[i];
    console.log(`⏳ Executing SQL statement ${i + 1}/${SQL_STATEMENTS.length}...`);

    try {
      // Execute SQL statement using the REST API
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Log error but continue with other statements
        console.warn(`⚠️ Statement ${i + 1} had an issue:`, error.message);
        console.log('Continuing with next statement...');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.warn(`⚠️ Error executing statement ${i + 1}:`, err.message);
    }
  }

  console.log('\n🎉 Photo management database setup completed!');
}

// Create storage buckets if needed
async function setupStorage() {
  console.log('\n🗄️ Setting up storage buckets...');

  try {
    // Check if the photos bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.warn('⚠️ Error checking storage buckets:', error.message);
      return;
    }

    const photosBucketExists = buckets.some(bucket => bucket.name === 'photos');

    if (!photosBucketExists) {
      console.log('Creating photos bucket...');
      const { error: createError } = await supabase.storage.createBucket('photos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.warn('⚠️ Error creating photos bucket:', createError.message);
      } else {
        console.log('✅ Photos bucket created successfully');
      }
    } else {
      console.log('✅ Photos bucket already exists');
    }

    // Set up storage policies for photos bucket
    // Note: This part is tricky with the JS client, so we'll provide instructions
    console.log('\n⚠️ Important: You need to manually set up the following storage policies in the Supabase dashboard:');
    console.log('1. Allow authenticated users to upload photos');
    console.log('2. Allow users to read their own photos');
    console.log('3. Allow admins to manage all photos');
    console.log('4. Allow public access to approved photos');

  } catch (err) {
    console.warn('⚠️ Error setting up storage:', err.message);
  }
}

// Verify admin_users table exists
async function verifyAdminTable() {
  console.log('\n🔍 Verifying admin_users table...');

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('⚠️ admin_users table does not exist. Creating it...');

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admins can view admin_users" ON admin_users
          FOR SELECT USING (
            auth.uid() IN (SELECT user_id FROM admin_users)
          );
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSql });

      if (createError) {
        console.warn('⚠️ Error creating admin_users table:', createError.message);
      } else {
        console.log('✅ admin_users table created successfully');
      }
    } else if (error) {
      console.warn('⚠️ Error checking admin_users table:', error.message);
    } else {
      console.log('✅ admin_users table exists');
    }
  } catch (err) {
    console.warn('⚠️ Error verifying admin_users table:', err.message);
  }
}

// Verify admin user exists
async function verifyAdminUser() {
  console.log('\n👤 Checking for admin user...');

  try {
    // Check if admin email exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({
      filter: {
        email: 'rtsii10@gmail.com'
      }
    });

    if (authError) {
      console.warn('⚠️ Cannot verify admin user:', authError.message);
      console.log('You need to manually create the admin user:');
      console.log('1. Register a user with email: rtsii10@gmail.com');
      console.log('2. Add the user to admin_users table');
      return;
    }

    const adminUsers = authUser?.users || [];

    if (adminUsers.length === 0) {
      console.log('⚠️ Admin user not found in auth.users');
      console.log('Please register a user with email: rtsii10@gmail.com');
      return;
    }

    const adminUserId = adminUsers[0].id;

    // Check if admin exists in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', adminUserId);

    if (adminError) {
      console.warn('⚠️ Error checking admin_users table:', adminError.message);
      return;
    }

    if (!adminData || adminData.length === 0) {
      console.log('⚠️ Admin user exists but not in admin_users table. Adding...');

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ user_id: adminUserId, role: 'admin' });

      if (insertError) {
        console.warn('⚠️ Error adding admin user to admin_users table:', insertError.message);
      } else {
        console.log('✅ Admin user added to admin_users table');
      }
    } else {
      console.log('✅ Admin user exists and is properly set up');
    }
  } catch (err) {
    console.warn('⚠️ Error verifying admin user:', err.message);
  }
}

// Main function
async function main() {
  console.log('📸 SPR-HOA Photo Management System Setup');
  console.log('========================================\n');

  try {
    // Verify admin_users table exists
    await verifyAdminTable();

    // Verify admin user exists
    await verifyAdminUser();

    // Run SQL setup
    await runSqlSetup();

    // Set up storage
    await setupStorage();

    console.log('\n🎉 Photo management system setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Log in as admin: rtsii10@gmail.com / basedgod');
    console.log('2. Go to Photo Management to see the approval system');
    console.log('3. Test uploading profile pictures as regular users');
    console.log('4. Approve or reject photos from the admin dashboard');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Supabase credentials in .env file');
    console.log('2. Ensure you have the right permissions');
    console.log('3. Try manual setup using QUICK_ADMIN_SETUP.md or PROFILE_PICTURE_APPROVAL.sql');
  }
}

// Run the main function
main();
