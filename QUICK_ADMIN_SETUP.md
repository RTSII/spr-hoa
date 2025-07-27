# Quick Admin Setup Guide

## Step 1: Run the Admin SQL Script

1. Go to your **Supabase SQL Editor**
2. Copy and paste the entire contents of `admin-setup-simple.sql`
3. Click **Run** to execute all commands

## Step 2: Find Your User ID

1. **Register/login** to your portal first (create an account)
2. In Supabase SQL Editor, run:
   ```sql
   SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1;
   ```
3. Copy the **user_id** from the results

## Step 3: Make Yourself Admin

Replace `your-actual-user-id` with the ID from Step 2:

```sql
INSERT INTO admin_users (user_id, role) VALUES ('your-actual-user-id', 'admin');
```

## Step 4: Test the System

1. **Upload a profile picture** - should show "pending approval"
2. **Upload a gallery photo** - should show "pending approval"
3. **Check admin panel** - should show pending items

## Step 5: Quick Verification

Run these queries to verify everything is working:

```sql
-- Check if you're admin
SELECT * FROM admin_users WHERE user_id = 'your-actual-user-id';

-- Check pending reviews
SELECT * FROM admin_review_queue;

-- Check approved photos
SELECT * FROM approved_photos;
```

## Common Issues & Solutions

### Error: "relation does not exist"
- Make sure you ran the admin-setup-simple.sql script first
- Check that all tables were created successfully

### Can't see admin panel
- Verify you're in the admin_users table
- Check that your user_id matches exactly

### Photos not uploading
- Ensure the 'photos' storage bucket exists and is public
- Check storage policies in Supabase dashboard

## Ready-to-Use Commands

### Make yourself admin (copy/paste ready):
```sql
-- First, find your user ID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then make yourself admin (replace the ID):
INSERT INTO admin_users (user_id, role) VALUES ('paste-your-id-here', 'admin');
```

### Test the approval system:
```sql
-- See all pending items
SELECT * FROM admin_review_queue;

-- See admin users
SELECT au.*, u.email FROM admin_users au JOIN auth.users u ON au.user_id = u.id;
```

## Next Steps

1. **Upload test content** as a regular user
2. **Log in as admin** to approve/reject
3. **Add additional moderators** using the same INSERT command
4. **Customize rejection messages** in the admin interface

The system is now ready for production use!