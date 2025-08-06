-- Email notification function for rejected photos
-- This function sends an email notification when a photo is rejected

CREATE OR REPLACE FUNCTION send_photo_rejection_email(
  p_user_email TEXT,
  p_user_name TEXT,
  p_photo_title TEXT,
  p_rejection_reason TEXT,
  p_photo_type TEXT DEFAULT 'community photo'
)
RETURNS BOOLEAN AS $$
DECLARE
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Construct email subject
  email_subject := 'SPR-HOA: Your ' || p_photo_type || ' submission was not approved';

  -- Construct email body
  email_body := 'Dear ' || p_user_name || ',

We regret to inform you that your ' || p_photo_type || ' submission "' || p_photo_title || '" was not approved for the following reason:

' || p_rejection_reason || '

You are welcome to submit a new photo that meets our community guidelines. If you have any questions about our photo guidelines, please contact the HOA office.

Thank you for your understanding.

Best regards,
Sandpiper Run HOA Management';

  -- Send email using Supabase Edge Function (you'll need to implement this)
  -- This is a placeholder for the actual email sending implementation
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    ),
    body := jsonb_build_object(
      'to', p_user_email,
      'subject', email_subject,
      'html', replace(email_body, E'\n', '<br>')
    )
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the rejection process
    INSERT INTO admin_logs (log_type, message, error_details)
    VALUES (
      'email_error',
      'Failed to send rejection email to ' || p_user_email,
      SQLERRM
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin logs table for tracking email sending
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update the photo review function to send rejection emails
CREATE OR REPLACE FUNCTION admin_review_photo(
  p_submission_id UUID,
  p_status VARCHAR,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  photo_title TEXT;
  review_result BOOLEAN;
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user details for email notification
  SELECT
    au.email,
    op.first_name || ' ' || op.last_name,
    ps.title
  INTO user_email, user_name, photo_title
  FROM photo_submissions ps
  JOIN auth.users au ON ps.user_id = au.id
  LEFT JOIN owner_profiles op ON ps.user_id = op.user_id
  WHERE ps.id = p_submission_id;

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

  review_result := FOUND;

  -- Send rejection email if photo was rejected
  IF review_result AND p_status = 'rejected' AND user_email IS NOT NULL THEN
    PERFORM send_photo_rejection_email(
      user_email,
      COALESCE(user_name, 'Resident'),
      COALESCE(photo_title, 'Your photo'),
      COALESCE(p_rejection_reason, 'Photo does not meet community guidelines'),
      'community photo'
    );
  END IF;

  RETURN review_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profile picture review function to send rejection emails
CREATE OR REPLACE FUNCTION admin_review_profile_picture(
  p_profile_id UUID,
  p_status VARCHAR,
  p_rejection_reason TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  review_result BOOLEAN;
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user details for email notification
  SELECT
    au.email,
    op.first_name || ' ' || op.last_name
  INTO user_email, user_name
  FROM owner_profiles op
  JOIN auth.users au ON op.user_id = au.id
  WHERE op.id = p_profile_id;

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

  review_result := FOUND;

  -- Send rejection email if profile picture was rejected
  IF review_result AND p_status = 'rejected' AND user_email IS NOT NULL THEN
    PERFORM send_photo_rejection_email(
      user_email,
      COALESCE(user_name, 'Resident'),
      'Profile Picture',
      COALESCE(p_rejection_reason, 'Profile picture does not meet community guidelines'),
      'profile picture'
    );
  END IF;

  RETURN review_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
