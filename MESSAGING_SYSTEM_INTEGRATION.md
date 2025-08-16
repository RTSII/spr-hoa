# 📨 SPR-HOA Messaging System - Complete Integration Guide

This guide provides step-by-step instructions for setting up and testing the complete messaging system that allows admin-to-resident communication and photo rejection notifications.

## 🎯 System Overview

The messaging system provides:

### **For Residents:**

- **Site Inbox**: View messages in a beautiful interface
- **Photo Rejection Notifications**: Automatic notifications when photos are rejected
- **Email Notifications**: Optional email delivery for important messages
- **Message Management**: Mark as read, archive, filter by status
- **Priority System**: Important messages highlighted

### **For Admin (Rob):**

- **Send to All Residents**: Broadcast messages to all opted-in residents
- **Send by Building**: Target specific buildings (A, B, C, D)
- **Send to Individuals**: Search and select specific residents
- **Email Integration**: Messages sent from rob@ursllc.com
- **Message Templates**: Pre-built templates for common communications
- **Photo Rejection Auto-Messages**: Automatic site inbox notifications

## 🚀 Quick Setup Steps

### Step 1: Database Setup

Execute the messaging system SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- sql/complete_messaging_system.sql
```

### Step 2: Email Service Setup (Optional but Recommended)

```bash
# Set up email notifications via Resend
./deploy-email-service.sh
```

### Step 3: Test the System

1. Use the MessagingTestComponent in admin dashboard
2. Send test messages between admin and residents
3. Test photo rejection workflow

## 📁 File Structure

```
spr-hoa/
├── sql/
│   └── complete_messaging_system.sql    # Database setup
├── src/components/
│   ├── AdminMessaging.tsx               # Admin message composition
│   ├── OwnerInbox.tsx                   # Resident inbox interface
│   ├── SiteInbox.tsx                    # Alternative inbox component
│   └── MessagingTestComponent.tsx       # Testing interface
└── MESSAGING_SYSTEM_INTEGRATION.md     # This guide
```

## 🗄️ Database Tables Created

### `site_messages`

Stores all messages sent through the system:

```sql
- id (UUID, primary key)
- recipient_user_id (UUID, references auth.users)
- sender_user_id (UUID, references auth.users)
- sender_name (TEXT, default 'SPR-HOA Admin')
- sender_email (TEXT, default 'rob@ursllc.com')
- sender_type ('system' | 'admin' | 'user')
- message_type ('notification' | 'photo_rejection' | 'admin_message', etc.)
- subject (TEXT)
- content (TEXT)
- is_read (BOOLEAN, default false)
- priority ('low' | 'medium' | 'high' | 'urgent')
- metadata (JSONB)
- created_at (TIMESTAMP)
```

### `user_notification_preferences`

User preferences for notifications:

```sql
- user_id (UUID, references auth.users)
- email_notifications (BOOLEAN, default true)
- site_inbox_notifications (BOOLEAN, default true)
- primary_contact_method ('email' | 'site_inbox')
```

### `admin_message_templates`

Pre-built message templates for admin:

```sql
- template_name (TEXT)
- subject_template (TEXT)
- content_template (TEXT)
- is_default (BOOLEAN)
```

## 🔧 SQL Functions Available

### For Admin Messaging:

- `send_site_message()` - Send single message
- `send_bulk_site_messages()` - Send to multiple recipients
- `get_building_recipients()` - Get users by building
- `get_all_recipients()` - Get all opted-in users
- `search_residents()` - Search by name/unit

### For User Experience:

- `mark_message_as_read()` - Mark message as read
- `get_unread_message_count()` - Get unread count
- `get_user_notification_preferences()` - Get user prefs

### For Photo Rejections:

- `send_photo_rejection_notification()` - Auto-send rejection messages

## 🧪 Testing Procedures

### 1. Database Verification

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('site_messages', 'user_notification_preferences');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%message%';
```

### 2. Admin Messaging Test

1. Navigate to Admin Dashboard
2. Open AdminMessaging component
3. Try each recipient selection mode:
   - **All Residents**: Select all opted-in users
   - **By Building**: Choose Building A, B, C, or D
   - **Individual**: Search for specific residents
4. Compose and send test messages
5. Verify delivery in site inbox and email (if configured)

### 3. Photo Rejection Test

1. Upload a photo as a regular user
2. Log in as admin and reject the photo with a reason
3. Check user's site inbox for rejection notification
4. Verify email notification (if email service is configured)

### 4. User Experience Test

1. Log in as a regular user
2. Check Profile page → My Messages section
3. Verify messages display correctly
4. Test read/unread functionality
5. Test message archiving

## 🎨 Integration Points

### Admin Dashboard Integration

Add to your admin dashboard:

```tsx
import AdminMessaging from '@/components/AdminMessaging';
import MessagingTestComponent from '@/components/MessagingTestComponent';

// In your admin dashboard
<AdminMessaging />
<MessagingTestComponent />
```

### User Profile Integration

Already integrated in Profile.tsx:

```tsx
// Messages section in Profile page
{
  profile?.user_id && <OwnerInbox user_id={profile.user_id} />
}
```

### Photo Rejection Integration

Photo rejection automatically sends site inbox messages when users have `site_inbox_notifications: true`.

## 🔒 Security Features

### Row Level Security (RLS)

- Users can only see their own messages
- Admins can manage all messages
- Proper authentication checks on all operations

### Data Privacy

- Respects user notification preferences
- Only shows opted-in residents for messaging
- Secure message content handling

## 📧 Email Integration

### Setup Requirements

1. **Resend Account**: Sign up at resend.com
2. **API Key**: Get your Resend API key
3. **Edge Function**: Deploy send-email function
4. **Environment Variables**: Set RESEND_API_KEY

### Email Templates

Messages sent via email include:

- Professional SPR-HOA branding
- HTML formatting with gradients and styling
- Sender information (Rob Stevens, rob@ursllc.com)
- Mobile-responsive design

## 🚨 Troubleshooting

### Common Issues

#### 1. "site_messages table does not exist"

**Solution**: Execute the complete_messaging_system.sql script

#### 2. "Function get_unread_message_count does not exist"

**Solution**: Ensure all SQL functions are deployed correctly

#### 3. "Messages not appearing in inbox"

**Checks**:

- Verify user is recipient of the message
- Check `is_archived` is false
- Confirm RLS policies are correctly set

#### 4. "Email notifications not working"

**Solutions**:

- Deploy email Edge Function: `./deploy-email-service.sh`
- Set RESEND_API_KEY environment variable
- Check admin_logs table for email errors

#### 5. "Search not finding residents"

**Checks**:

- Verify residents have `directory_opt_in: true`
- Check search function is deployed
- Ensure owner_profiles table has data

### Debug Commands

```sql
-- Check user's messages
SELECT * FROM site_messages
WHERE recipient_user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;

-- Check unread count
SELECT get_unread_message_count('USER_ID_HERE');

-- Check notification preferences
SELECT * FROM user_notification_preferences
WHERE user_id = 'USER_ID_HERE';

-- Check recent admin logs
SELECT * FROM admin_logs
WHERE log_type LIKE '%email%'
ORDER BY created_at DESC
LIMIT 10;
```

## 📈 Usage Analytics

Track messaging effectiveness:

```sql
-- Message delivery stats
SELECT
  message_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE is_read = true) as read_count,
  ROUND(COUNT(*) FILTER (WHERE is_read = true) * 100.0 / COUNT(*), 2) as read_percentage
FROM site_messages
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY message_type;

-- Popular buildings for messaging
SELECT
  metadata->>'building' as building,
  COUNT(*) as message_count
FROM site_messages
WHERE metadata->>'building' IS NOT NULL
GROUP BY metadata->>'building'
ORDER BY message_count DESC;
```

## 🎉 Success Indicators

Your messaging system is working correctly when:

✅ **Database**: All tables and functions created successfully
✅ **Admin Messaging**: Can send to all/building/individual recipients
✅ **User Inbox**: Messages appear in resident inboxes
✅ **Photo Rejections**: Automatic notifications on photo rejection
✅ **Email Integration**: Optional email delivery working
✅ **Read Status**: Messages can be marked as read/archived
✅ **Search Function**: Can find residents by name/unit
✅ **Templates**: Message templates available for admin

## 🔄 Maintenance

### Regular Tasks

1. **Monitor admin_logs** for email delivery issues
2. **Clean old messages** (optional, based on retention policy)
3. **Update templates** as community needs change
4. **Review messaging analytics** for engagement insights

### Backup Considerations

- site_messages table contains all message history
- user_notification_preferences table contains user settings
- admin_message_templates table contains templates

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Use MessagingTestComponent to diagnose problems
3. Review admin_logs table for detailed error information
4. Test each component separately to isolate issues

---

**Your SPR-HOA messaging system is now ready for production use!** 🏖️📨

This comprehensive system allows you to communicate effectively with your Sandpiper Run residents while respecting their privacy preferences and providing a professional experience.
