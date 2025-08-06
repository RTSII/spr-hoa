-- SQL script to add profile picture approval fields to owner_profiles table
-- Run this in Supabase SQL Editor

-- Add new columns to owner_profiles for profile picture approval workflow
ALTER TABLE owner_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_status VARCHAR(20) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS profile_picture_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_picture_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_admin_notes TEXT;

-- Create storage bucket for photos if it doesn't exist
-- (You'll need to do this through the Supabase UI if you don't have storage access)

-- Create RLS policies for the owner_profiles table to allow profile picture updates
CREATE POLICY "Users can update their own profile pictures" ON owner_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        (
            -- Only these fields can be updated by the user
            profile_picture_url IS NOT NULL OR
            profile_picture_status IS NOT NULL OR
            profile_picture_submitted_at IS NOT NULL
        )
    );

-- Create RLS policies for admins to approve/reject profile pictures
CREATE POLICY "Admins can update profile picture status" ON owner_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Only these fields can be updated by admins
        profile_picture_status IS NOT NULL OR
        profile_picture_reviewed_at IS NOT NULL OR
        profile_picture_rejection_reason IS NOT NULL OR
        profile_picture_admin_notes IS NOT NULL
    );

-- Add storage policies for profile pictures
-- Note: You'll need to create these through the Supabase UI if you don't have storage API access

-- Create trigger function to log profile picture submissions for admin review
CREATE OR REPLACE FUNCTION log_profile_picture_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a record in admin notifications about new profile picture
    IF NEW.profile_picture_status = 'pending' AND
       (OLD.profile_picture_status IS NULL OR OLD.profile_picture_status <> 'pending') THEN

        -- If you have an admin_notifications table, you could insert here
        -- INSERT INTO admin_notifications (
        --    user_id,
        --    notification_type,
        --    content,
        --    related_id
        -- ) VALUES (
        --    NEW.user_id,
        --    'profile_picture',
        --    'New profile picture submission',
        --    NEW.id
        -- );

        -- For now, we'll just update the submission timestamp
        NEW.profile_picture_submitted_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log profile picture submissions
CREATE TRIGGER profile_picture_submission_trigger
    BEFORE UPDATE ON owner_profiles
    FOR EACH ROW
    WHEN (NEW.profile_picture_status = 'pending' AND
          (OLD.profile_picture_status IS NULL OR OLD.profile_picture_status <> 'pending'))
    EXECUTE FUNCTION log_profile_picture_submission();

-- Create function for admins to approve/reject profile pictures
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
