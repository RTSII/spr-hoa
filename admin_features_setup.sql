-- Admin Features Database Setup for SPR-HOA Portal
-- Run this in Supabase SQL Editor after main setup

-- Messages/Announcements table
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) CHECK (message_type IN ('emergency', 'general', 'maintenance', 'event')) DEFAULT 'general',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    recipients_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photo submissions for admin approval
CREATE TABLE IF NOT EXISTS photo_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(50) DEFAULT 'community',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News posts management
CREATE TABLE IF NOT EXISTS news_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    featured_image_url TEXT,
    tags TEXT[],
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity tracking for analytics
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    page_visited VARCHAR(100),
    action_taken VARCHAR(100),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System settings for admin configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_messages
CREATE POLICY "Admins can manage all messages" ON admin_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view published messages" ON admin_messages
    FOR SELECT USING (sent_at IS NOT NULL);

-- RLS Policies for photo_submissions
CREATE POLICY "Users can manage own submissions" ON photo_submissions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all submissions" ON photo_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view approved photos" ON photo_submissions
    FOR SELECT USING (status = 'approved');

-- RLS Policies for news_posts
CREATE POLICY "Admins can manage all news" ON news_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view published news" ON news_posts
    FOR SELECT USING (status = 'published');

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view own activity" ON user_activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON user_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "All users can insert activity" ON user_activity_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public settings" ON system_settings
    FOR SELECT USING (is_public = true);

-- Functions for admin operations
CREATE OR REPLACE FUNCTION send_admin_message(
    p_message_type VARCHAR,
    p_title TEXT,
    p_content TEXT,
    p_priority VARCHAR DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    recipient_count INTEGER;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Count potential recipients
    SELECT COUNT(*) INTO recipient_count
    FROM owner_profiles
    WHERE created_at IS NOT NULL;

    -- Insert message
    INSERT INTO admin_messages (
        admin_user_id,
        message_type,
        title,
        content,
        priority,
        recipients_count,
        sent_at
    ) VALUES (
        auth.uid(),
        p_message_type,
        p_title,
        p_content,
        p_priority,
        recipient_count,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO message_id;

    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve/reject photo submissions
CREATE OR REPLACE FUNCTION review_photo_submission(
    p_submission_id UUID,
    p_status VARCHAR,
    p_admin_notes TEXT DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update submission
    UPDATE photo_submissions SET
        status = p_status,
        admin_notes = p_admin_notes,
        rejection_reason = p_rejection_reason,
        reviewed_by = auth.uid(),
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_submission_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    SELECT json_build_object(
        'active_users', (
            SELECT COUNT(*) FROM owner_profiles
            WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
        ),
        'total_users', (
            SELECT COUNT(*) FROM owner_profiles
        ),
        'pending_photos', (
            SELECT COUNT(*) FROM photo_submissions WHERE status = 'pending'
        ),
        'published_news', (
            SELECT COUNT(*) FROM news_posts WHERE status = 'published'
        ),
        'messages_sent', (
            SELECT COUNT(*) FROM admin_messages
            WHERE sent_at > CURRENT_DATE - INTERVAL '30 days'
        ),
        'recent_activity', (
            SELECT COUNT(*) FROM user_activity_logs
            WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('portal_name', 'Sandpiper Run HOA Portal', 'The display name of the portal', true),
    ('contact_email', 'admin@sandpiperrun.com', 'Main contact email', true),
    ('maintenance_mode', 'false', 'Whether the portal is in maintenance mode', false),
    ('session_timeout_minutes', '30', 'Session timeout in minutes', false),
    ('max_photo_upload_size_mb', '10', 'Maximum photo upload size in MB', false),
    ('auto_approve_trusted_users', 'false', 'Auto-approve content from trusted users', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_admin_messages_updated_at
    BEFORE UPDATE ON admin_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_submissions_updated_at
    BEFORE UPDATE ON photo_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at
    BEFORE UPDATE ON news_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
