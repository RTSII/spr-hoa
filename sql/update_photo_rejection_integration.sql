-- Update photo review functions to integrate with new messaging system
-- Run this after executing complete_messaging_system.sql

-- Update the photo review function to use new messaging system
CREATE OR REPLACE FUNCTION admin_review_photo(
  p_submission_id UUID,
  p_status VARCHAR,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  user_email TEXT;
  user_name TEXT;
  photo_title TEXT;
  review_result BOOLEAN;
  message_id UUID;
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user details for notification
  SELECT
    ps.user_id,
    au.email,
    op.first_name || ' ' || op.last_name,
    ps.title
  INTO user_id, user_email, user_name, photo_title
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

  -- Send notifications if photo was rejected
  IF review_result AND p_status = 'rejected' AND user_id IS NOT NULL THEN
    -- Send site inbox notification
    message_id := send_site_message(
      p_recipient_user_id := user_id,
      p_sender_user_id := auth.uid(),
      p_sender_name := 'SPR-HOA Admin',
      p_sender_email := 'rob@ursllc.com',
      p_sender_type := 'admin',
      p_message_type := 'photo_rejection',
      p_subject := 'Photo Submission Not Approved',
      p_content := 'Your community photo submission "' || COALESCE(photo_title, 'Your photo') || '" was not approved.

Reason: ' || COALESCE(p_rejection_reason, 'Photo does not meet community guidelines') || '

You may submit a new photo that meets our community guidelines. If you have questions about the guidelines, please contact the HOA office.',
      p_priority := 'medium',
      p_related_photo_id := NULL,
      p_related_submission_id := p_submission_id,
      p_metadata := jsonb_build_object(
        'photo_title', COALESCE(photo_title, 'Your photo'),
        'photo_type', 'community photo',
        'rejection_reason', COALESCE(p_rejection_reason, 'Photo does not meet community guidelines'),
        'submission_id', p_submission_id
      )
    );

    -- Also send email notification if email service is available
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

-- Update the profile picture review function
CREATE OR REPLACE FUNCTION admin_review_profile_picture(
  p_profile_id UUID,
  p_status VARCHAR,
  p_rejection_reason TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  user_email TEXT;
  user_name TEXT;
  review_result BOOLEAN;
  message_id UUID;
BEGIN
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user details for notification
  SELECT
    op.user_id,
    au.email,
    op.first_name || ' ' || op.last_name
  INTO user_id, user_email, user_name
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

  -- Send notifications if profile picture was rejected
  IF review_result AND p_status = 'rejected' AND user_id IS NOT NULL THEN
    -- Send site inbox notification
    message_id := send_site_message(
      p_recipient_user_id := user_id,
      p_sender_user_id := auth.uid(),
      p_sender_name := 'SPR-HOA Admin',
      p_sender_email := 'rob@ursllc.com',
      p_sender_type := 'admin',
      p_message_type := 'photo_rejection',
      p_subject := 'Profile Picture Not Approved',
      p_content := 'Your profile picture submission was not approved.

Reason: ' || COALESCE(p_rejection_reason, 'Profile picture does not meet community guidelines') || '

You may upload a new profile picture that meets our community guidelines. Profile pictures should clearly show your face and contain appropriate content.',
      p_priority := 'medium',
      p_related_photo_id := NULL,
      p_related_submission_id := NULL,
      p_metadata := jsonb_build_object(
        'photo_title', 'Profile Picture',
        'photo_type', 'profile picture',
        'rejection_reason', COALESCE(p_rejection_reason, 'Profile picture does not meet community guidelines'),
        'profile_id', p_profile_id
      )
    );

    -- Also send email notification if email service is available
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

-- Function to test the messaging system
CREATE OR REPLACE FUNCTION test_messaging_system()
RETURNS TEXT AS $$
DECLARE
  test_user_id UUID;
  message_id UUID;
  result_text TEXT := '';
BEGIN
  -- Find a test user (first user in owner_profiles)
  SELECT user_id INTO test_user_id
  FROM owner_profiles
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RETURN 'No users found for testing';
  END IF;

  -- Send a test message
  message_id := send_site_message(
    p_recipient_user_id := test_user_id,
    p_sender_name := 'System Test',
    p_sender_email := 'test@system.com',
    p_subject := 'Messaging System Test',
    p_content := 'This is a test message to verify the messaging system is working correctly. Sent at: ' || NOW()::text,
    p_priority := 'low'
  );

  IF message_id IS NOT NULL THEN
    result_text := 'Success! Test message sent with ID: ' || message_id::text;
  ELSE
    result_text := 'Failed to send test message';
  END IF;

  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default notification preferences for all existing users
INSERT INTO user_notification_preferences (user_id)
SELECT au.id
FROM auth.users au
LEFT JOIN user_notification_preferences unp ON au.id = unp.user_id
WHERE unp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Log the update
INSERT INTO admin_logs (log_type, message, metadata)
VALUES (
  'system_update',
  'Photo rejection integration updated to use new messaging system',
  jsonb_build_object(
    'timestamp', NOW(),
    'tables_updated', ARRAY['photo_submissions', 'owner_profiles'],
    'functions_updated', ARRAY['admin_review_photo', 'admin_review_profile_picture']
  )
);
