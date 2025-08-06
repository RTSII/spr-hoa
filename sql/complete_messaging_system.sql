-- Complete SPR-HOA Messaging System Setup
-- Site inbox messaging for photo rejections and admin-to-resident communications

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
  sender_name TEXT DEFAULT 'SPR-HOA Admin',
  sender_email TEXT DEFAULT 'rob@ursllc.com',
  sender_type VARCHAR(20) DEFAULT 'system' CHECK (sender_type IN ('system', 'admin', 'user')),
  message_type VARCHAR(50) DEFAULT 'notification' CHECK (message_type IN ('notification', 'photo_rejection', 'photo_approval', 'alert', 'general', 'admin_message')),
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

-- Create admin message templates table
CREATE TABLE IF NOT EXISTS admin_message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_message_templates ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for admin_message_templates
CREATE POLICY "Admins can manage their own templates" ON admin_message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Function to send site inbox message
CREATE OR REPLACE FUNCTION send_site_message(
  p_recipient_user_id UUID,
  p_sender_user_id UUID DEFAULT NULL,
  p_sender_name TEXT DEFAULT 'SPR-HOA Admin',
  p_sender_email TEXT DEFAULT 'rob@ursllc.com',
  p_sender_type VARCHAR DEFAULT 'admin',
  p_message_type VARCHAR DEFAULT 'admin_message',
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
    sender_name,
    sender_email,
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
    p_sender_name,
    p_sender_email,
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

-- Function to send bulk messages to multiple recipients
CREATE OR REPLACE FUNCTION send_bulk_site_messages(
  p_recipient_user_ids UUID[],
  p_sender_user_id UUID DEFAULT NULL,
  p_sender_name TEXT DEFAULT 'SPR-HOA Admin',
  p_sender_email TEXT DEFAULT 'rob@ursllc.com',
  p_subject TEXT DEFAULT '',
  p_content TEXT DEFAULT '',
  p_priority VARCHAR DEFAULT 'medium',
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  recipient_id UUID;
  message_count INTEGER := 0;
BEGIN
  FOREACH recipient_id IN ARRAY p_recipient_user_ids
  LOOP
    PERFORM send_site_message(
      recipient_id,
      p_sender_user_id,
      p_sender_name,
      p_sender_email,
      'admin',
      'admin_message',
      p_subject,
      p_content,
      p_priority,
      NULL,
      NULL,
      p_metadata
    );
    message_count := message_count + 1;
  END LOOP;

  RETURN message_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recipients by building
CREATE OR REPLACE FUNCTION get_building_recipients(p_building VARCHAR)
RETURNS UUID[] AS $$
DECLARE
  recipient_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(user_id)
  INTO recipient_ids
  FROM owner_profiles
  WHERE UPPER(LEFT(unit_number, 1)) = UPPER(p_building)
    AND directory_opt_in = true;

  RETURN COALESCE(recipient_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all opted-in recipients
CREATE OR REPLACE FUNCTION get_all_recipients()
RETURNS UUID[] AS $$
DECLARE
  recipient_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(user_id)
  INTO recipient_ids
  FROM owner_profiles
  WHERE directory_opt_in = true;

  RETURN COALESCE(recipient_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search residents by name or unit
CREATE OR REPLACE FUNCTION search_residents(p_search_term TEXT)
RETURNS TABLE(
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  unit_number TEXT,
  email TEXT,
  directory_opt_in BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    op.user_id,
    op.first_name,
    op.last_name,
    op.unit_number,
    op.email,
    op.directory_opt_in
  FROM owner_profiles op
  WHERE (
    LOWER(op.first_name || ' ' || op.last_name) LIKE LOWER('%' || p_search_term || '%')
    OR LOWER(op.unit_number) LIKE LOWER('%' || p_search_term || '%')
    OR LOWER(op.email) LIKE LOWER('%' || p_search_term || '%')
  )
  ORDER BY op.unit_number;
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
  notification_content := 'Your ' || p_photo_type || ' submission "' || p_photo_title || '" was not approved.

Reason: ' || p_rejection_reason || '

You may submit a new photo that meets our community guidelines. If you have questions about the guidelines, please contact the HOA office.';

  -- Send site inbox message if enabled
  IF user_prefs.site_inbox_notifications THEN
    message_id := send_site_message(
      p_recipient_user_id := p_user_id,
      p_sender_user_id := NULL,
      p_sender_name := 'SPR-HOA Admin',
      p_sender_email := 'rob@ursllc.com',
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_message_templates_updated_at
  BEFORE UPDATE ON admin_message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_messages_recipient_user_id ON site_messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_site_messages_is_read ON site_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_site_messages_created_at ON site_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_messages_message_type ON site_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_unit_search ON owner_profiles(unit_number, first_name, last_name);

-- Insert default notification preferences for existing users
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_notification_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Insert default message templates for admin
INSERT INTO admin_message_templates (template_name, subject_template, content_template, is_default)
VALUES
  ('Welcome Message', 'Welcome to Sandpiper Run!', 'Dear {{resident_name}},

Welcome to the Sandpiper Run community! We''re excited to have you as part of our oceanfront family.

Please feel free to reach out if you have any questions about community amenities, policies, or upcoming events.

Best regards,
SPR-HOA Management', true),

  ('Community Update', 'Important Community Update', 'Dear Residents,

We wanted to keep you informed about important updates in our community:

{{update_content}}

If you have any questions, please don''t hesitate to contact the HOA office.

Thank you,
SPR-HOA Management', true),

  ('Maintenance Notice', 'Scheduled Maintenance Notice', 'Dear {{resident_name}},

This is to inform you of scheduled maintenance in your area:

Date: {{maintenance_date}}
Time: {{maintenance_time}}
Description: {{maintenance_description}}

Please plan accordingly and contact us if you have any concerns.

Best regards,
SPR-HOA Management', true)
ON CONFLICT DO NOTHING;
