-- Add onboarding tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add referral credits columns if they don't exist
ALTER TABLE user_referrals ADD COLUMN IF NOT EXISTS credits_earned DECIMAL(10,2) DEFAULT 0;
ALTER TABLE user_referrals ADD COLUMN IF NOT EXISTS credits_pending DECIMAL(10,2) DEFAULT 0;

-- Add referral code to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create referral_events table for tracking
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'conversion')),
  credit_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on referral_events
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_events
CREATE POLICY "Users can view their own referral events"
  ON referral_events
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred ON referral_events(referred_user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON users;
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Update existing users to have referral codes
UPDATE users SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
