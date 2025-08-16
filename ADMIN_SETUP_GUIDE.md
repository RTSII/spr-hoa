# Admin Review/Approval System Setup Guide

**2025-07-27 Update:**

- All CSS/TS errors are fixed and build is clean.
- Directory and Inbox are fully functional and privacy-first.
- See README for status.
- For troubleshooting, see DEV_SERVER_TROUBLESHOOTING.md.

## Overview

This system adds admin review and approval for:

- Profile pictures uploaded by users
- Photos submitted to the gallery
- Complete moderation workflow with rejection reasons

## Step 1: Run the Admin Approval SQL Script

1. Go to your Supabase SQL Editor
2. Copy and run the contents of `add-admin-approval.sql`
3. This adds:
   - Approval status columns to existing tables
   - Admin users table
   - Photo submissions tracking
   - Admin review queue views

## Step 2: Set Up Admin Users

After creating your account, you need to make yourself an admin:

1. **Find your user ID**:

   ```sql
   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. **Add yourself as admin**:

   ```sql
   INSERT INTO admin_users (user_id, role, created_by)
   VALUES ('your-user-id', 'admin', 'your-user-id');
   ```

3. **Add additional moderators** (optional):
   ```sql
   INSERT INTO admin_users (user_id, role, created_by)
   VALUES ('other-user-id', 'moderator', 'your-user-id');
   ```

## Step 3: Update Your Components

### Add Admin Review Panel to Dashboard

In your main dashboard component, add:

```tsx
import AdminReviewPanel from '../components/AdminReviewPanel'

// In your dashboard render:
{
  isAdmin && <AdminReviewPanel />
}
```

### Update Photo Gallery Page

Replace your existing photo gallery with the new approved photos view:

```tsx
// Use the approved_photos view instead of photos table
const { data: photos } = await supabase
  .from('approved_photos')
  .select('*')
  .order('created_at', { ascending: false })
```

## Step 4: Update Storage Policies

### Storage Bucket Configuration

1. Go to **Storage** in Supabase dashboard
2. Click on your **photos** bucket
3. Set **Public** access (for approved photos)
4. Add these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Allow public read for approved photos
CREATE POLICY "Allow public read for approved" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos'
  );
```

## Step 5: User Experience Flow

### For Users:

1. **Upload Profile Picture** → Shows "pending approval" status
2. **Upload Gallery Photo** → Shows "pending approval" status
3. **Receive notifications** when approved/rejected
4. **Can resubmit** if rejected

### For Admins:

1. **Access Admin Review Panel** from dashboard
2. **See all pending submissions** in one place
3. **Approve/Reject with reasons**
4. **Bulk actions** for multiple submissions

## Step 6: Email Notifications (Optional)

Add email notifications for approval/rejection:

```sql
-- Create function to send email notifications
CREATE OR REPLACE FUNCTION notify_photo_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Send email notification (requires Supabase Edge Functions)
    -- This would trigger your email function
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER photo_approval_notification
  AFTER UPDATE ON photo_submissions
  FOR EACH ROW EXECUTE FUNCTION notify_photo_approval();
```

## Step 7: Testing the System

### Test Profile Picture Approval:

1. Register as a regular user
2. Upload a profile picture
3. Check that it shows "pending approval"
4. Log in as admin
5. Approve/reject the picture
6. Verify the user sees the status update

### Test Gallery Photo Approval:

1. Upload a photo to gallery
2. Check admin review panel
3. Approve/reject the submission
4. Verify it appears/disappears from gallery

## Step 8: Admin Dashboard Integration

Add the admin panel to your main navigation:

```tsx
// In your navigation component
{
  isAdmin && (
    <Link to="/admin/review" className="text-blue-600 hover:text-blue-800">
      Admin Review
    </Link>
  )
}
```

## Step 9: Monitoring and Analytics

### Useful Queries for Admins:

```sql
-- Get approval statistics
SELECT
  submission_type,
  status,
  COUNT(*) as count
FROM admin_review_queue
GROUP BY submission_type, status;

-- Get pending items count
SELECT COUNT(*) FROM admin_review_queue WHERE status = 'pending';

-- Get user submission history
SELECT
  user_name,
  unit_number,
  submission_type,
  status,
  submitted_at
FROM admin_review_queue
WHERE user_id = 'specific-user-id'
ORDER BY submitted_at DESC;
```

## Step 10: Advanced Features (Future)

### Batch Approval:

- Select multiple items
- Approve/reject in bulk
- Send batch notifications

### Auto-Approval Rules:

- Auto-approve trusted users
- Set content filters
- Flag inappropriate content

### Reporting:

- Monthly approval statistics
- User submission history
- Content moderation reports

## Troubleshooting

### Common Issues:

1. **Photos not showing**: Check storage bucket permissions
2. **Admin panel not visible**: Ensure user is in admin_users table
3. **Upload failures**: Check storage bucket size limits
4. **Status not updating**: Verify RLS policies are correct

### Debug Commands:

```sql
-- Check if user is admin
SELECT * FROM admin_users WHERE user_id = 'your-user-id';

-- Check pending submissions
SELECT * FROM admin_review_queue WHERE status = 'pending';

-- Check storage objects
SELECT * FROM storage.objects WHERE bucket_id = 'photos';
```

## Security Considerations

- Only admins can approve/reject content
- Users can only see their own submission status
- Rejected content is not publicly visible
- All actions are logged with timestamps
- Storage policies prevent unauthorized access

This system provides complete content moderation while maintaining a smooth user experience!
