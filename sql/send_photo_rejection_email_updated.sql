-- Updated email notification function that calls the Supabase Edge Function
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
  function_url TEXT;
  email_response TEXT;
  response_status INTEGER;
BEGIN
  -- Construct email subject
  email_subject := 'SPR-HOA: Your ' || p_photo_type || ' submission was not approved';

  -- Construct HTML email body
  email_body := '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>' || email_subject || '</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2953A6, #6bb7e3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .rejection-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
    .logo { width: 60px; height: 60px; background: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .button { display: inline-block; padding: 12px 24px; background: #2953A6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏖️</div>
      <h1>Sandpiper Run HOA</h1>
      <p>Photo Submission Update</p>
    </div>

    <div class="content">
      <h2>Dear ' || p_user_name || ',</h2>

      <p>We regret to inform you that your <strong>' || p_photo_type || '</strong> submission "<strong>' || p_photo_title || '</strong>" was not approved.</p>

      <div class="rejection-box">
        <h3>🚫 Rejection Reason:</h3>
        <p><strong>' || p_rejection_reason || '</strong></p>
      </div>

      <p>You are welcome to submit a new photo that meets our community guidelines. Here are some tips for approval:</p>

      <ul>
        <li><strong>Profile Pictures:</strong> Clear image of yourself, good lighting, appropriate content</li>
        <li><strong>Community Photos:</strong> Showcase our beautiful community, events, or amenities</li>
        <li><strong>Quality:</strong> High resolution, well-lit, and in focus</li>
        <li><strong>Content:</strong> Family-friendly and community-appropriate</li>
      </ul>

      <p>If you have any questions about our photo guidelines, please contact the HOA office.</p>

      <p>Thank you for your understanding and continued participation in our community.</p>

      <p><strong>Best regards,</strong><br>
      Sandpiper Run HOA Management</p>
    </div>

    <div class="footer">
      <p>This is an automated message from the Sandpiper Run HOA Portal.<br>
      Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>';

  -- Get the Edge Function URL (update this with your actual project reference)
  function_url := current_setting('app.supabase_url', true) || '/functions/v1/send-email';

  -- If supabase_url is not set, use a placeholder that can be updated
  IF function_url IS NULL OR function_url = '' THEN
    function_url := 'https://your-project-ref.supabase.co/functions/v1/send-email';
  END IF;

  -- Call the Edge Function to send email
  SELECT content, status_code INTO email_response, response_status
  FROM http_post(
    function_url,
    jsonb_build_object(
      'to', p_user_email,
      'subject', email_subject,
      'html', email_body,
      'from', 'noreply@sandpiperrun.com'
    )::text,
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)),
      http_header('Content-Type', 'application/json')
    ]
  );

  -- Log the email attempt
  INSERT INTO admin_logs (log_type, message, error_details, metadata)
  VALUES (
    'email_sent',
    'Photo rejection email sent to ' || p_user_email,
    CASE
      WHEN response_status BETWEEN 200 AND 299 THEN NULL
      ELSE 'HTTP Status: ' || response_status || ', Response: ' || email_response
    END,
    jsonb_build_object(
      'user_email', p_user_email,
      'photo_title', p_photo_title,
      'photo_type', p_photo_type,
      'rejection_reason', p_rejection_reason,
      'response_status', response_status,
      'function_url', function_url
    )
  );

  -- Return success if HTTP status is 2xx
  RETURN (response_status BETWEEN 200 AND 299);

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the rejection process
    INSERT INTO admin_logs (log_type, message, error_details, metadata)
    VALUES (
      'email_error',
      'Failed to send rejection email to ' || p_user_email,
      SQLERRM,
      jsonb_build_object(
        'user_email', p_user_email,
        'photo_title', p_photo_title,
        'photo_type', p_photo_type,
        'rejection_reason', p_rejection_reason,
        'error_code', SQLSTATE
      )
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the correct Supabase project URL for email function
CREATE OR REPLACE FUNCTION get_email_function_url()
RETURNS TEXT AS $$
DECLARE
  project_url TEXT;
BEGIN
  -- Try to get the project URL from settings
  project_url := current_setting('app.supabase_url', true);

  -- If not set, try to construct from current request
  IF project_url IS NULL OR project_url = '' THEN
    -- This would need to be set during deployment
    project_url := 'https://your-project-ref.supabase.co';
  END IF;

  RETURN project_url || '/functions/v1/send-email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the http extension if it doesn't exist (for calling Edge Functions)
-- Note: This requires superuser privileges, typically done by Supabase automatically
-- If this fails, you may need to enable the http extension in the Supabase dashboard

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS http;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Could not create http extension - it may need to be enabled in the Supabase dashboard';
END $$;

-- Test function to verify email sending works
CREATE OR REPLACE FUNCTION test_email_function(p_test_email TEXT)
RETURNS TEXT AS $$
DECLARE
  result BOOLEAN;
  response TEXT;
BEGIN
  -- Send a test email
  result := send_photo_rejection_email(
    p_test_email,
    'Test User',
    'Test Photo',
    'This is a test rejection for system verification',
    'test photo'
  );

  IF result THEN
    response := 'Test email sent successfully to ' || p_test_email;
  ELSE
    response := 'Test email failed - check admin_logs for details';
  END IF;

  RETURN response;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced admin logs table to track email sending
ALTER TABLE admin_logs
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for faster log queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_log_type ON admin_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
