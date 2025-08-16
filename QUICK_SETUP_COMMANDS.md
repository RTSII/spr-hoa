# 🚀 Quick Setup Commands - SPR-HOA Messaging

## 📋 Copy-Paste Ready Commands

### 1. Database Verification Query

Copy and paste this into Supabase SQL Editor to verify setup:

```sql
-- Check if messaging tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN ('site_messages', 'user_notification_preferences', 'admin_message_templates')
    THEN '✅ Required Table'
    ELSE '❌ Missing Table'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('site_messages', 'user_notification_preferences', 'admin_message_templates')
ORDER BY table_name;

-- Check if SQL functions exist
SELECT
  routine_name,
  '✅ Function Available' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'send_site_message',
  'send_bulk_site_messages',
  'get_building_recipients',
  'search_residents',
  'mark_message_as_read',
  'get_unread_message_count'
)
ORDER BY routine_name;
```

### 2. Email Service Deployment Commands

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Navigate to project
cd spr-hoa

# Login to Supabase
supabase login

# Link your project (replace YOUR_PROJECT_REF with your actual project ID)
supabase link --project-ref YOUR_PROJECT_REF

# Set Resend API key (replace with your actual key)
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Deploy email function
supabase functions deploy send-email

# Test the deployment
supabase functions list
```

### 3. Test Message Send

Copy and paste this into Supabase SQL Editor to send a test message:

```sql
-- Send test message to yourself (replace USER_ID with your actual user ID)
SELECT send_site_message(
  'YOUR_USER_ID_HERE'::uuid,
  'YOUR_USER_ID_HERE'::uuid,
  'Rob - SPR-HOA Admin',
  'rob@ursllc.com',
  'admin',
  'admin_message',
  'Test Message - System Working!',
  'This is a test message to verify the messaging system is working correctly. If you can see this message in your inbox, everything is set up properly!',
  'medium'
);

-- Check if message was created
SELECT * FROM site_messages
WHERE subject = 'Test Message - System Working!'
ORDER BY created_at DESC
LIMIT 1;
```

### 4. Quick System Status Check

```sql
-- Complete system status check
SELECT
  'Database Tables' as component,
  CASE
    WHEN COUNT(*) = 3 THEN '✅ All Required Tables Present'
    ELSE '❌ Missing Tables (' || COUNT(*) || '/3)'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('site_messages', 'user_notification_preferences', 'admin_message_templates')

UNION ALL

SELECT
  'SQL Functions' as component,
  CASE
    WHEN COUNT(*) >= 6 THEN '✅ All Functions Available'
    ELSE '❌ Missing Functions (' || COUNT(*) || '/6+)'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%message%'

UNION ALL

SELECT
  'Total Messages' as component,
  '📊 ' || COALESCE(COUNT(*)::text, '0') || ' messages in system' as status
FROM site_messages

UNION ALL

SELECT
  'User Preferences' as component,
  '📊 ' || COALESCE(COUNT(*)::text, '0') || ' users configured' as status
FROM user_notification_preferences;
```

---

## 🎯 Where to Find Your Project Info

### Supabase Project Reference ID

1. Go to https://supabase.com/dashboard/projects
2. Click on your SPR-HOA project
3. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
4. Your project ref is the part after `/project/`

### Your User ID (for testing)

1. In Supabase dashboard, go to Authentication → Users
2. Find your admin user (rtsii10@gmail.com)
3. Copy the UUID from the "id" column

---

## 🔧 Admin Dashboard Integration

### Add to your Admin Dashboard Component

```tsx
// Add these imports at the top
import AdminMessaging from '@/components/AdminMessaging'
import MessagingTestComponent from '@/components/MessagingTestComponent'

// Add this section to your admin dashboard JSX
;<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  {/* Messaging Test */}
  <div className="glass-card p-6">
    <MessagingTestComponent />
  </div>

  {/* Admin Messaging */}
  <div className="glass-card p-6">
    <AdminMessaging />
  </div>
</div>
```

---

## 📧 Email Testing Commands

### Test Email Function Directly

```bash
# Test the Edge Function (replace with your project info)
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "your-email@example.com",
    "subject": "SPR-HOA Test Email",
    "html": "<h1>Test Successful!</h1><p>Your email system is working correctly.</p>"
  }'
```

### Check Email Logs

```sql
-- Check recent email activity
SELECT
  log_type,
  message,
  error_details,
  created_at
FROM admin_logs
WHERE log_type LIKE '%email%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Quick Fixes

### If Tables Don't Create

```sql
-- Check permissions
SELECT has_table_privilege('site_messages', 'SELECT');

-- If false, contact Supabase support or check project settings
```

### If Functions Don't Work

```sql
-- Check if http extension is enabled
SELECT * FROM pg_extension WHERE extname = 'http';

-- If empty, run:
CREATE EXTENSION IF NOT EXISTS http;
```

### If Email Function Fails

```bash
# Check function logs
supabase functions logs send-email

# Check secrets
supabase secrets list
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. **Database Check Returns**: 3 tables, 6+ functions
2. **Test Message Appears**: In site_messages table
3. **Email Function Responds**: Without errors
4. **Admin Components Load**: Without console errors
5. **Resident Inbox Shows**: Test messages

**Ready to start messaging your residents!** 🏖️📨
