# Supabase Setup Guide

**2025-07-27 Update:**
- All code is verified to build and run cleanly with Supabase backend.
- Directory and Inbox features are fully functional and privacy-first.
- See README for recent changes.
- For troubleshooting, see DEV_SERVER_TROUBLESHOOTING.md.

## Step 1: Access Your Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ukortnwfrzxlslbhlmro
2. Sign in with your credentials

## Step 2: Run the Unified Database Setup Script
1. In the left sidebar, click on **SQL Editor**
2. Click on **New query** (+ button)
3. Copy the ENTIRE contents of `spr_hoa_unified_setup.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this is normal!

### Admin Setup
After registering with your admin email, get your user UUID:
```sql
SELECT id, email FROM auth.users WHERE email = 'rtsii10@gmail.com';
```
Then insert yourself as admin:
```sql
INSERT INTO admin_users (user_id, email, role) VALUES ('YOUR-USER-UUID', 'rtsii10@gmail.com', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', email = 'rtsii10@gmail.com';
```

### Onboarding Validation
- Owners register with their unit number and last 4 digits of their HOA account number.
- Registration is validated by the `validate_owner_onboarding` function, which checks for correct unit/account mapping and ensures account numbers start with '7'.

### Clean Project Practice
- All old SQL files have been removed; only use `spr_hoa_unified_setup.sql` for setup and migrations.

## Step 3: Verify the Setup
1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `owners_master` (should have 165 rows)
   - `owner_profiles` (empty until users register)
   - `events`
   - `community_posts`
   - `news_articles`
   - `photos`
   - `forms_submissions`

## Step 4: Configure Authentication
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (should show a green toggle)
3. Optional: Configure email templates:
   - Click on **Email Templates**
   - Customize the confirmation, reset password, and other emails

## Step 5: Configure Storage (Optional)
If you want to allow photo uploads:
1. Go to **Storage**
2. Click **New bucket**
3. Name it `photos`
4. Set it to **Public** if you want photos accessible without authentication
5. Click **Create bucket**

## Step 6: Test Your Setup
1. Open your terminal in the sandpiper-portal directory
2. Make sure your `.env` file has the correct credentials
3. Try running: `npm run dev`
4. Visit http://localhost:5173
5. Try registering with:
   - Unit: A1A
   - Account: 3298 (last 4 digits)

## Troubleshooting

### If tables weren't created:
- Make sure you copied the ENTIRE SQL script
- Check for any error messages in the SQL editor
- Try running the script in smaller chunks

### If registration fails:
- Check that the `owners_master` table has data
- Verify your Supabase URL and anon key in `.env`
- Check browser console for errors

### If you see "RLS policy" errors:
- The Row Level Security policies are already configured
- Make sure you're using the anon key, not the service key

## What's Set Up:

✅ **Database Tables**: All tables created with proper relationships
✅ **Unit/Account Data**: All 165 units imported from index.html
✅ **Row Level Security**: Configured to protect user data
✅ **Indexes**: Added for optimal performance
✅ **Triggers**: Automatic timestamp updates
✅ **Directory Privacy**: Granular control over what info to share

## Next Steps:
1. Start the development server
2. Register a test account
3. Explore the portal features
4. Customize the content and styling as needed