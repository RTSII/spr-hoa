# 🚀 SPR-HOA Messaging System - Step-by-Step Setup

Follow these exact steps to activate your complete messaging system.

## Step 1: Database Setup (5 minutes)

### 1.1 Access Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/projects
2. Select your SPR-HOA project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 1.2 Execute the Database Script
1. **Copy the entire contents** of `sql/complete_messaging_system.sql`
2. **Paste into the SQL Editor**
3. **Click "Run"** (▶️ button)

**Expected Result:** You should see "Success. No rows returned" or similar success message.

### 1.3 Verify Database Setup
Run this verification query in SQL Editor:
```sql
-- Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('site_messages', 'user_notification_preferences', 'admin_message_templates');

-- Should return 3 rows showing the table names
```

---

## Step 2: Email Service Setup (10 minutes)

### 2.1 Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to "API Keys"
4. Create new API key named "SPR-HOA-Notifications"
5. **Copy the API key** (starts with `re_`)

### 2.2 Install Supabase CLI (if not already installed)
```bash
# Install Supabase CLI
npm install -g supabase
```

### 2.3 Run Email Service Deployment
```bash
# Navigate to your project directory
cd spr-hoa

# Make script executable
chmod +x deploy-email-service.sh

# Run the deployment script
./deploy-email-service.sh
```

**When prompted, provide:**
- Your Supabase project reference ID
- Your Resend API key (from step 2.1)

### 2.4 Alternative Manual Setup (if script doesn't work)
```bash
# Login to Supabase
supabase login

# Link your project (replace YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# Set environment variable
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Deploy the Edge Function
supabase functions deploy send-email
```

---

## Step 3: Add Admin Components to Dashboard

### 3.1 Update Your Admin Dashboard File
Find your admin dashboard file (likely `src/pages/AdminDashboard.tsx` or similar) and add these imports:

```tsx
import AdminMessaging from '@/components/AdminMessaging';
import MessagingTestComponent from '@/components/MessagingTestComponent';
```

### 3.2 Add Messaging Components
Add these components to your admin dashboard layout:

```tsx
{/* Add this section to your admin dashboard */}
<div className="space-y-8">
  {/* Messaging Test Component */}
  <div className="glass-card p-6">
    <h2 className="text-2xl font-bold text-white mb-6">System Testing</h2>
    <MessagingTestComponent />
  </div>

  {/* Admin Messaging Component */}
  <div className="glass-card p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Send Message to Residents</h2>
    <AdminMessaging />
  </div>
</div>
```

---

## Step 4: Testing the System

### 4.1 Test Database Functions
1. **Access the MessagingTestComponent** in your admin dashboard
2. **Click "Run Full Test"**
3. **Verify all tests pass:**
   - ✅ Database Tables
   - ✅ Notification Preferences
   - ✅ SQL Functions
   - ✅ User Messages
   - ✅ Resident Search
   - ✅ Email Integration

### 4.2 Test Admin Messaging
1. **Navigate to the AdminMessaging component** in your admin dashboard
2. **Try each recipient mode:**
   - Select "All Residents"
   - Select "By Building" → Choose Building A
   - Select "Individual" → Search for a resident
3. **Compose a test message:**
   - Subject: "Welcome to the new messaging system!"
   - Content: "This is a test message to verify our communication system is working."
4. **Send the message**

### 4.3 Test Resident Inbox
1. **Log in as a regular user**
2. **Go to Profile page**
3. **Check the "My Messages" section**
4. **Verify the test message appears**
5. **Test message functionality:**
   - Click to read the message
   - Verify it marks as read
   - Test archiving

### 4.4 Test Photo Rejection Workflow
1. **Upload a photo as a user**
2. **Log in as admin and reject it with a reason**
3. **Check user's inbox for rejection notification**
4. **Verify email was sent (check email inbox)**

---

## Step 5: Verification Checklist

Mark each item as you verify it works:

### Database Setup ✓
- [ ] All 3 tables created successfully
- [ ] SQL functions work (tested via MessagingTestComponent)
- [ ] User notification preferences created
- [ ] Message templates populated

### Email Service ✓
- [ ] Resend API key configured
- [ ] Edge Function deployed
- [ ] Test email sent successfully
- [ ] Email logs show no errors

### Admin Messaging ✓
- [ ] Can send to all residents
- [ ] Can send to specific building
- [ ] Can search and select individuals
- [ ] Message templates work
- [ ] Both email and site inbox delivery work

### Resident Experience ✓
- [ ] Messages appear in Profile → My Messages
- [ ] Can read and mark messages as read
- [ ] Can archive messages
- [ ] Photo rejection notifications work
- [ ] Email notifications received

---

## 🚨 Troubleshooting

### Database Issues
If tables don't create:
1. Check for syntax errors in SQL Editor
2. Ensure you have proper permissions
3. Try running smaller sections of the SQL script

### Email Service Issues
If email deployment fails:
1. Verify Supabase CLI is installed and logged in
2. Check your project reference ID is correct
3. Ensure Resend API key is valid

### Component Issues
If components don't appear:
1. Check import paths are correct
2. Verify components are properly exported
3. Check browser console for errors

---

## 📞 Quick Support Commands

### Check Function Status
```sql
-- In Supabase SQL Editor
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%message%';
```

### Check Recent Messages
```sql
-- In Supabase SQL Editor
SELECT sender_name, subject, created_at, is_read
FROM site_messages
ORDER BY created_at DESC
LIMIT 10;
```

### Check Email Logs
```sql
-- In Supabase SQL Editor
SELECT * FROM admin_logs
WHERE log_type LIKE '%email%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎉 Success!

Once all steps are complete, you'll have:
- ✅ Complete messaging system database
- ✅ Email notifications from rob@ursllc.com
- ✅ Admin interface for sending messages
- ✅ Beautiful resident inbox experience
- ✅ Automatic photo rejection notifications

**Your SPR-HOA messaging system is now fully operational!** 🏖️📨
