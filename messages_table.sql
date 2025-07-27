-- SPR HOA Owner Messages/Notifications Table
-- Supports emergency alerts, general notices, and info messages
-- For use in Owner Inbox, with future SMS/email notification support

CREATE TABLE IF NOT EXISTS owner_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES owner_profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES admin_users(id),
  type VARCHAR(20) NOT NULL DEFAULT 'info', -- 'emergency', 'notice', 'info'
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  read BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false, -- for future SMS/email triggers
  broadcast BOOLEAN DEFAULT false, -- true = send to all owners
  meta JSONB, -- for future extensibility (e.g. attachments)
  INDEX(owner_id),
  INDEX(type),
  INDEX(sent_at)
);

-- RLS: Owners can read their own messages, admin can send/read all
ALTER TABLE owner_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can read own messages" ON owner_messages
  FOR SELECT USING (owner_id = (SELECT id FROM owner_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin can insert messages" ON owner_messages
  FOR INSERT USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admin can update/delete messages" ON owner_messages
  FOR UPDATE USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
  FOR DELETE USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
