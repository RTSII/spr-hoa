-- Ensure admin_messages has updated_at and trigger exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add updated_at if missing
ALTER TABLE IF EXISTS admin_messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Generic trigger function (idempotent with same name elsewhere)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_admin_messages_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_messages_updated_at
      BEFORE UPDATE ON admin_messages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
