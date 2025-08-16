# SPR-HOA Photo Management System

This document provides a complete guide to the SPR-HOA photo management system, including profile pictures and community gallery photos.

## Overview

The SPR-HOA portal includes two types of photo uploads:

1. **Profile Pictures**: Personal photos uploaded during registration or from the Profile page
2. **Community Gallery Photos**: Photos shared to the community gallery from the Photos page

Both types of uploads require admin approval before they become visible to other users.

## Profile Picture Workflow

### For Users

1. **Upload During Registration**:
   - When registering for an account, you can upload a profile picture in the designated section
   - Your profile picture will be marked as "pending" until approved by an administrator

2. **Upload/Update from Profile**:
   - Navigate to your Profile page
   - Click the edit icon on your profile card
   - Upload a new photo using the drag-and-drop interface or file browser
   - Your new profile picture will be marked as "pending" until approved

3. **Profile Picture Status**:
   - **Pending**: Your photo is awaiting admin review
   - **Approved**: Your photo has been approved and is visible to other users
   - **Rejected**: Your photo was rejected (reason provided) and you need to upload a new one

### For Admins

1. **Review Profile Pictures**:
   - Navigate to the Admin Dashboard
   - Click on the "Photo Management" feature
   - Use the filter to view "Profile" type photos
   - Review each pending photo and click Approve or Reject
   - If rejecting, provide a reason for the rejection

2. **Bulk Actions**:
   - Select multiple profile pictures by checking their boxes
   - Click "Bulk Approve" or "Bulk Reject" to process multiple photos at once

## Community Gallery Workflow

### For Users

1. **Submit Photos to Gallery**:
   - Navigate to the Photos page
   - Click "Upload Photo" button in the "My Photos" section
   - Fill in the title and optional description
   - Select a photo to upload
   - Submit for approval

2. **View Your Submissions**:
   - In the "My Photos" section, you can see all your submitted photos
   - Each photo shows its current status: Pending, Approved, or Rejected
   - If rejected, you'll see the reason for rejection

3. **View Community Gallery**:
   - In the "Community Gallery" section, you can browse all approved photos
   - Use the category filters to find specific types of photos

### For Admins

1. **Review Gallery Submissions**:
   - Navigate to the Admin Dashboard
   - Click on the "Photo Management" feature
   - Use the filter to view "Community" type photos
   - Review each pending photo and click Approve or Reject
   - Add notes or rejection reasons as needed

2. **Bulk Actions**:
   - Select multiple photos by checking their boxes
   - Use bulk approve/reject actions to process multiple photos at once

## Photo Guidelines

To ensure your photos are approved:

1. **Profile Pictures**:
   - Should clearly show your face
   - No inappropriate content
   - No group photos (must be just you)
   - Good lighting and clear image quality

2. **Community Gallery Photos**:
   - Only submit photos of the community or community events
   - No photos of people without their consent
   - No inappropriate content
   - Provide descriptive titles
   - Choose appropriate categories

## Technical Setup (For Administrators)

If you're setting up the system for the first time:

1. **Database Setup**:
   - Run the `PHOTO_MANAGEMENT_SETUP.sql` script in your Supabase SQL Editor
   - This creates all necessary tables and functions

2. **Storage Setup**:
   - Create a "photos" storage bucket in Supabase
   - Configure storage policies as described in the SQL file
   - Ensure proper access controls are in place

3. **Testing the System**:
   - Create a test user account and upload a profile picture
   - Log in as admin and verify you can see and approve/reject the submission
   - Test the community gallery upload process

## Troubleshooting

### Photo Upload Failures

- Ensure the file is under the size limit (10MB)
- Check that the file type is supported (JPG, PNG, GIF)
- Verify your internet connection

### Missing Admin Controls

- Confirm the admin user is properly set up in the admin_users table
- Check that all SQL functions and policies are correctly installed

### Photos Not Appearing After Approval

- Verify the storage bucket permissions are correctly configured
- Ensure the photo URL is properly stored in the database
- Check browser cache or try refreshing the page

For any additional issues, please contact the system administrator.

## Privacy and Security

- All photos are stored securely in the Supabase storage system
- Photos are only visible to users with proper permissions
- Profile pictures are only shown based on user privacy settings
- Rejected photos remain in the database but are not publicly visible
