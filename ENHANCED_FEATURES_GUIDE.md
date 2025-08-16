# SPR-HOA Enhanced Features Guide

This guide covers the new enhanced features implemented in the SPR-HOA portal:

1. **Email Notifications for Rejected Photos**
2. **Circular Gallery for Photo Categories**
3. **Profile Picture Thumbnails in Resident Directory**

## 🔥 Feature 1: Email Notifications for Rejected Photos

### Overview

Automatic email notifications are sent to users when their uploaded photos (profile pictures or community gallery photos) are rejected by administrators.

### Implementation Status

✅ **SQL Functions Created**: Database functions ready for email sending
⚠️ **Email Service**: Requires external email service setup (instructions below)

### How It Works

1. When admin rejects a photo, the review function automatically triggers
2. User email and photo details are retrieved from the database
3. A rejection email is composed with the reason
4. Email is sent via external service (Supabase Edge Function recommended)

### Email Service Setup Options

#### Option 1: Supabase Edge Functions (Recommended)

```bash
# 1. Create Edge Function for email sending
supabase functions new send-email

# 2. Deploy with email service (SendGrid, Resend, etc.)
supabase functions deploy send-email

# 3. Update the SQL function to call your Edge Function
```

#### Option 2: Webhook Integration

```sql
-- Update the SQL function to call a webhook endpoint
PERFORM net.http_post(
  url := 'https://your-webhook-service.com/send-email',
  headers := jsonb_build_object('Content-Type', 'application/json'),
  body := jsonb_build_object(
    'to', user_email,
    'subject', email_subject,
    'html', email_body
  )
);
```

#### Option 3: Third-Party Services

- **SendGrid**: Add SendGrid API integration
- **Mailgun**: Use Mailgun API for transactional emails
- **Resend**: Modern email API service
- **Amazon SES**: AWS email service

### Email Template

```html
Subject: SPR-HOA: Your [photo type] submission was not approved Dear [User Name], We regret to
inform you that your [photo type] submission "[Photo Title]" was not approved for the following
reason: [Rejection Reason] You are welcome to submit a new photo that meets our community
guidelines. If you have any questions about our photo guidelines, please contact the HOA office.
Thank you for your understanding. Best regards, Sandpiper Run HOA Management
```

### Testing

1. Upload a photo as a regular user
2. Log in as admin and reject the photo with a reason
3. Check that email notification is logged in `admin_logs` table
4. Verify email is sent (once email service is configured)

---

## 🎨 Feature 2: Circular Gallery for Photo Categories

### Overview

A stunning 3D circular gallery interface inspired by reactbits.dev that organizes community photos by categories. Users can scroll to rotate the gallery and click categories to view photos in a masonry layout with lightbox functionality.

### Key Features

- **3D Circular Layout**: Categories arranged in a rotating circle
- **Scroll to Rotate**: Mouse wheel controls gallery rotation
- **Category Thumbnails**: Each category shows a representative image
- **Masonry Grid**: Photos displayed in an elegant masonry layout
- **Lightbox View**: Full-screen photo viewing with navigation
- **Smooth Animations**: Framer Motion powered transitions

### User Experience

1. **Category Selection**: View all photo categories in circular arrangement
2. **Interactive Rotation**: Scroll to rotate and explore categories
3. **Category Details**: See photo count and category name
4. **Photo Browsing**: Click category to view all photos in masonry layout
5. **Lightbox**: Click any photo for full-screen viewing with navigation

### Technical Implementation

```typescript
// Categories are automatically generated from uploaded photos
const categories = useMemo(() => {
  const categoryMap = new Map()
  items.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, [])
    }
    categoryMap.get(item.category).push(item)
  })
  return Array.from(categoryMap.entries())
}, [items])
```

### Customization Options

- **Bend Amount**: Controls the 3D curvature of the gallery
- **Scroll Speed**: Adjusts rotation sensitivity
- **Border Radius**: Rounded corner styling
- **Text Color**: Category label colors
- **Animation Easing**: Smooth transition controls

### Adding Photos to Categories

Photos are automatically categorized when users upload them:

- **Beach**: Ocean, sunset, sunrise photos
- **Events**: Community gatherings, celebrations
- **Amenities**: Pool, fitness center, common areas
- **Nature**: Wildlife, landscaping, gardens
- **Community**: General community life photos

### Testing the Circular Gallery

1. Navigate to the Photos page
2. Scroll in the Community Gallery section to rotate categories
3. Click any category to view photos in masonry layout
4. Click photos to open lightbox with navigation
5. Use "Back to Categories" to return to circular view

---

## 👤 Feature 3: Profile Picture Thumbnails in Directory

### Overview

The Resident Directory now displays profile picture thumbnails for users who have uploaded and approved profile pictures, creating a more personal and engaging directory experience.

### Features

- **64x64 Profile Thumbnails**: Circular profile pictures next to contact info
- **Fallback Avatars**: Generated avatars with user initials for users without photos
- **Approval Status Indicators**: Visual indicators showing photo verification status
- **Responsive Design**: Works on all screen sizes
- **Privacy Respected**: Only shows photos for users who opted into the directory

### Visual Design

```tsx
// Profile thumbnail with status indicator
<div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white/30">
  <img src={getResidentPhoto(resident)} alt={resident.name} />
</div>
```

### Photo Status Indicators

- **✅ Photo Verified**: Green indicator for approved profile pictures
- **⚪ Default Avatar**: Gray indicator for generated avatars

### Fallback System

1. **Primary**: User's approved profile picture
2. **Fallback**: Generated avatar with initials using UI Avatars service
3. **Error Handling**: Graceful fallback if image fails to load

### Privacy Integration

- Only users who opted into the directory are shown
- Profile pictures only displayed if user has uploaded and admin approved
- Respects all existing privacy settings (email, phone, unit visibility)

### Testing Directory Thumbnails

1. Upload a profile picture as a user
2. Log in as admin and approve the profile picture
3. Ensure user has opted into the directory
4. Navigate to Resident Directory
5. Verify profile thumbnail appears next to user info
6. Test with users who haven't uploaded photos (should show initials avatar)

---

## 🚀 Complete Testing Workflow

### 1. Database Setup

```sql
-- Run the photo management setup
-- Execute: PHOTO_MANAGEMENT_SETUP.sql
-- Execute: send_rejection_email.sql
```

### 2. Test Photo Upload Workflow

```bash
# As Regular User:
1. Register new account with profile picture
2. Upload community photos to gallery
3. Check "My Photos" section for status

# As Admin:
1. Login with admin credentials
2. Go to Photo Management in admin dashboard
3. Review and approve/reject photos
4. Test bulk operations
```

### 3. Test Circular Gallery

```bash
1. Navigate to Photos page
2. View Community Gallery section
3. Scroll to rotate categories
4. Click categories to view masonry layout
5. Test lightbox functionality
```

### 4. Test Directory Thumbnails

```bash
1. Ensure users have approved profile pictures
2. Navigate to Resident Directory
3. Verify thumbnails display correctly
4. Test privacy settings respect
```

## 📧 Setting Up Email Notifications

### Quick Setup with Resend (Recommended)

1. Sign up for [Resend](https://resend.com)
2. Get your API key
3. Create Supabase Edge Function:

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const resendApiKey = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: [to],
        subject,
        html,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

4. Deploy the function:

```bash
supabase functions deploy send-email --project-ref your-project-ref
```

5. Update the SQL function URL to point to your deployed Edge Function

## 🎯 Success Metrics

Your enhanced features are working correctly when:

### Email Notifications ✅

- Admin rejections trigger email composition
- Email details are logged in admin_logs table
- Users receive rejection emails (once email service configured)
- Email content includes photo title and rejection reason

### Circular Gallery ✅

- Categories display in circular arrangement
- Scroll controls rotation smoothly
- Category clicks reveal masonry photo layout
- Lightbox navigation works between photos
- Back navigation returns to category view

### Directory Thumbnails ✅

- Approved profile pictures show as 64px thumbnails
- Users without photos show generated initials avatars
- Status indicators correctly show verification state
- Privacy settings are respected
- Responsive design works on all devices

---

## 🛠️ Troubleshooting

### Circular Gallery Issues

- **No Categories**: Ensure photos have been uploaded and approved
- **Rotation Not Working**: Check that scroll events are being captured
- **Images Not Loading**: Verify photo URLs are accessible

### Directory Thumbnails Issues

- **No Thumbnails**: Confirm users have approved profile pictures
- **Default Avatars Only**: Check profile_picture_status in database
- **Permission Errors**: Verify directory_opt_in is true for users

### Email Notification Issues

- **No Emails Sent**: Set up external email service integration
- **Logs Not Created**: Check admin_logs table permissions
- **Function Errors**: Review SQL function execution permissions

For additional support with any of these features, please refer to the individual component documentation or contact the development team.

## 🎉 Congratulations!

You now have a fully enhanced SPR-HOA portal with:

- Professional photo management with email notifications
- Stunning 3D circular gallery interface
- Personalized directory with profile thumbnails

These features elevate the community portal to a premium level befitting a luxury oceanfront community! 🏖️✨
