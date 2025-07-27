-- Add columns for granular directory privacy controls
ALTER TABLE owner_profiles 
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_unit BOOLEAN DEFAULT true;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for owner_profiles
CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE
    ON owner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();