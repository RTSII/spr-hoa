-- SPR-HOA Messaging System Setup
-- Site inbox messaging for photo rejections and other notifications

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  site_inbox_notifications BOOLEAN DEFAULT true,
  primary_contact_method VARCHAR(20) DEFAULT 'email' CHECK (primary_contact_method IN ('email', 'sms', 'site_inbox')),
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create site messages table
CREATE TABLE IF NOT EXISTS site_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) DEFAULT 'system' CHECK (sender_type IN ('system', 'admin', 'user')),
  message_type VARCHAR(50) DEFAULT 'notification' CHECK (message_type IN ('notification', 'photo_rejection', 'photo_approval', 'alert', 'general')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  related_photo_id UUID,
  related_submission_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on both tables
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification preferences" ON user_notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for site_messages
CREATE POLICY "Users can view their own messages" ON site_messages
  FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can update their own messages" ON site_messages
  FOR UPDATE USING (auth.uid() = recipient_user_id);

CREATE POLICY "Admins can manage all messages" ON site_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create messages" ON site_messages
  FOR INSERT WITH CHECK (true);

-- Function to send site inbox message
CREATE OR REPLACE FUNCTION send_site_message(
  p_recipient_user_id UUID,
  p_sender_user_id UUID DEFAULT NULL,
  p_sender_type VARCHAR DEFAULT 'system',
  p_message_type VARCHAR DEFAULT 'notification',
  p_subject TEXT DEFAULT '',
  p_content TEXT DEFAULT '',
  p_priority VARCHAR DEFAULT 'medium',
  p_related_photo_id UUID DEFAULT NULL,
  p_related_submission_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO site_messages (
    recipient_user_id,
    sender_user_id,
    sender_type,
    message_type,
    subject,
    content,
    priority,
    related_photo_id,
    related_submission_id,
    metadata
  ) VALUES (
    p_recipient_user_id,
    p_sender_user_id,
    p_sender_type,
    p_message_type,
    p_subject,
    p_content,
    p_priority,
    p_related_photo_id,
    p_related_submission_id,
    p_metadata
  ) RETURNING id INTO message_id;

  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID)
RETURNS user_notification_preferences AS $$
DECLARE
  user_prefs user_notification_preferences;
BEGIN
  SELECT * INTO user_prefs
  FROM user_notification_preferences
  WHERE user_id = p_user_id;

  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO user_prefs;
  END IF;

  RETURN user_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced photo rejection notification function
CREATE OR REPLACE FUNCTION send_photo_rejection_notification(
  p_user_id UUID,
  p_user_email TEXT,
  p_user_name TEXT,
  p_photo_title TEXT,
  p_rejection_reason TEXT,
  p_photo_type TEXT DEFAULT 'community photo',
  p_submission_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs user_notification_preferences;
  message_id UUID;
  notification_subject TEXT;
  notification_content TEXT;
BEGIN
  -- Get user notification preferences
  user_prefs := get_user_notification_preferences(p_user_id);

  -- Construct notification content
  notification_subject := 'Photo Submission Not Approved';
  notification_content := 'Your ' || p_photo_type || ' submission "' || p_photo_title || '" was not approved. Reason: ' || p_rejection_reason || '. You may submit a new photo that meets our community guidelines.';

  -- Send site inbox message if enabled
  IF user_prefs.site_inbox_notifications THEN
    message_id := send_site_message(
      p_recipient_user_id := p_user_id,
      p_sender_type := 'admin',
      p_message_type := 'photo_rejection',
      p_subject := notification_subject,
      p_content := notification_content,
      p_priority := 'medium',
      p_related_submission_id := p_submission_id,
      p_metadata := jsonb_build_object(
        'photo_title', p_photo_title,
        'photo_type', p_photo_type,
        'rejection_reason', p_rejection_reason
      )
    );
  END IF;

  -- Send email if enabled and it's primary contact method
  IF user_prefs.email_notifications AND
     (user_prefs.primary_contact_method = 'email' OR user_prefs.primary_contact_method = 'site_inbox') THEN
    PERFORM send_photo_rejection_email(p_user_email, p_user_name, p_photo_title, p_rejection_reason, p_photo_type);
  END IF;

  -- TODO: Add SMS notification logic here if needed
  -- IF user_prefs.sms_notifications AND user_prefs.primary_contact_method = 'sms' THEN
  --   PERFORM send_sms_notification(user_prefs.phone_number, notification_content);
  -- END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the rejection process
    INSERT INTO admin_logs (log_type, message, error_details)
    VALUES (
      'notification_error',
      'Failed to send rejection notification to user ' || p_user_id::text,
      SQLERRM
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update photo review functions to use new notification system
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

  -- Send rejection notification if photo was rejected
  IF review_result AND p_status = 'rejected' AND user_id IS NOT NULL THEN
    PERFORM send_photo_rejection_notification(
      user_id,
      user_email,
      COALESCE(user_name, 'Resident'),
      COALESCE(photo_title, 'Your photo'),
      COALESCE(p_rejection_reason, 'Photo does not meet community guidelines'),
      'community photo',
      p_submission_id
    );
  END IF;

  RETURN review_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profile picture review function
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

  -- Send rejection notification if profile picture was rejected
  IF review_result AND p_status = 'rejected' AND user_id IS NOT NULL THEN
    PERFORM send_photo_rejection_notification(
      user_id,
      user_email,
      COALESCE(user_name, 'Resident'),
      'Profile Picture',
      COALESCE(p_rejection_reason, 'Profile picture does not meet community guidelines'),
      'profile picture',
      NULL
    );
  END IF;

  RETURN review_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(p_message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE site_messages
  SET
    is_read = true,
    read_at = CURRENT_TIMESTAMP
  WHERE id = p_message_id AND recipient_user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM site_messages
  WHERE recipient_user_id = p_user_id
    AND is_read = false
    AND is_archived = false;

  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_messages_recipient_user_id ON site_messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_site_messages_is_read ON site_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_site_messages_created_at ON site_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_messages_message_type ON site_messages(message_type);

-- Insert default notification preferences for existing users
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_notification_preferences)
ON CONFLICT (user_id) DO NOTHING;
