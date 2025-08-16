# 🚀 Quick Admin Setup Guide

## Manual Database Setup (Recommended)

Since the automated script requires service role permissions, here's the quick manual setup:

### Step 1: Access Supabase SQL Editor

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in the sidebar
3. Click **New Query**

### Step 2: Copy & Execute Admin Setup SQL

Copy and paste this expanded admin setup SQL:

```sql
-- Create admin messages table
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'general',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium',
    recipients_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create photo submissions table
CREATE TABLE IF NOT EXISTS photo_submissions (
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
);

-- Create news posts table
CREATE TABLE IF NOT EXISTS news_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'draft',
    featured_image_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add profile picture approval fields to owner_profiles
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_admin_notes TEXT;

-- Enable Row Level Security
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Admin can manage messages" ON admin_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view published messages" ON admin_messages
    FOR SELECT USING (sent_at IS NOT NULL);

-- Photo submission policies
CREATE POLICY "Users can submit photos" ON photo_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own photos" ON photo_submissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all photos" ON photo_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Profile picture policies
CREATE POLICY "Users can update their own profile pictures" ON owner_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update profile picture status" ON owner_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Create admin stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send message function
CREATE OR REPLACE FUNCTION send_admin_message(
    p_message_type VARCHAR,
    p_title TEXT,
    p_content TEXT,
    p_priority VARCHAR DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    recipient_count INTEGER;
BEGIN
    -- Count potential recipients
    SELECT COALESCE(COUNT(*), 0) INTO recipient_count
    FROM owner_profiles;

    -- Insert message
    INSERT INTO admin_messages (
        admin_user_id,
        message_type,
        title,
        content,
        priority,
        recipients_count,
        sent_at
    ) VALUES (
        auth.uid(),
        p_message_type,
        p_title,
        p_content,
        p_priority,
        recipient_count,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO message_id;

    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin review photo function
CREATE OR REPLACE FUNCTION admin_review_photo(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin review profile picture function
CREATE OR REPLACE FUNCTION admin_review_profile_picture(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Run the SQL

1. **Paste the SQL** into the Supabase SQL Editor
2. **Click "RUN"** to execute
3. You should see "Success. No rows returned" (this is normal)

## ✅ Test Admin Features

### 1. Login to Admin Dashboard

- Navigate to your app
- Login with: `rtsii10@gmail.com` / `basedgod`
- You should be redirected to the admin dashboard

### 2. Test Message Center

- Click **"Message Center"** from the constellation
- Type a test emergency alert
- Click **"Send Emergency Alert"**
- The message should be saved and appear in recent messages below

### 3. Admin Stats Should Work

- The stats at the bottom should now show real data
- Numbers will be low initially but should not be "0" errors

## 🎯 Quick Verification

If setup is successful, you should see:

- ✅ Admin dashboard loads without errors
- ✅ Message center allows sending alerts
- ✅ Recent messages appear after sending
- ✅ Admin stats show numbers (even if small)
- ✅ All constellation features are clickable
- ✅ Photo approval system shows both community photos and profile pictures
- ✅ User profile pictures can be approved or rejected

## 🔧 Profile Picture Upload Testing

To test the profile picture approval workflow:

1. Log in as a regular user
2. Upload a profile picture on the Profile settings page
3. Log out and log in as admin
4. Go to the Photo Management panel in the admin dashboard
5. You should see the pending profile picture in the approval queue
6. Approve or reject the photo to test the complete workflow
7. Log back in as the regular user to see the updated status

## 🔧 If Issues Occur

### Tables Already Exist Error

- This is fine! Skip the CREATE TABLE statements
- Run only the functions (get_admin_dashboard_stats and send_admin_message)

### Permission Errors

- Make sure you're using the Supabase SQL Editor
- Don't run from command line unless you have service role setup

### Admin Dashboard Not Loading

- Clear browser cache and refresh
- Check browser console for errors
- Verify you're logged in as admin

---

**Ready to test! Try the admin login and message center now! 🚀**
