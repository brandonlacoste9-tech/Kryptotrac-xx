-- Add digest preferences to manage email notification settings
CREATE TABLE IF NOT EXISTS digest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  digest_enabled BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'never')),
  timezone TEXT DEFAULT 'America/New_York',
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE digest_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own digest preferences"
  ON digest_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own digest preferences"
  ON digest_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digest preferences"
  ON digest_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_digest_preferences_user_id ON digest_preferences(user_id);
CREATE INDEX idx_digest_preferences_enabled ON digest_preferences(digest_enabled, digest_frequency);

-- Create trigger for updated_at
CREATE TRIGGER update_digest_preferences_updated_at
  BEFORE UPDATE ON digest_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default preferences for existing users
INSERT INTO digest_preferences (user_id, digest_enabled, digest_frequency)
SELECT id, TRUE, 'weekly'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
