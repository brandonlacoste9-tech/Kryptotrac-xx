-- Referral System Tables
-- Tracks user referrals and credits earned

-- 1. USER_REFERRALS TABLE
-- Stores unique referral codes per user and tracks earnings
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  total_signups INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_credits DECIMAL(10,2) DEFAULT 0,
  credits_pending DECIMAL(10,2) DEFAULT 0,
  credits_paid DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REFERRAL_EVENTS TABLE
-- Tracks individual referral events (signup, conversion)
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'conversion')),
  credit_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_user_id, event_type)
);

-- 3. RLS POLICIES
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral data
CREATE POLICY "Users can view their own referrals"
ON user_referrals FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own referral data (for tracking)
CREATE POLICY "Users can update their own referrals"
ON user_referrals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view referral events where they are the referrer
CREATE POLICY "Users can view their referral events"
ON referral_events FOR SELECT
USING (auth.uid() = referrer_id);

-- Allow inserting referral events (for signup tracking)
CREATE POLICY "System can insert referral events"
ON referral_events FOR INSERT
WITH CHECK (true);

-- 4. INDEXES
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX idx_referral_events_referrer ON referral_events(referrer_id);
CREATE INDEX idx_referral_events_referred ON referral_events(referred_user_id);

-- 5. TRIGGERS
CREATE TRIGGER update_user_referrals_updated_at
BEFORE UPDATE ON user_referrals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNCTION: Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = code) INTO exists;
    
    -- Return if unique
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Create referral codes for existing users
INSERT INTO user_referrals (user_id, referral_code)
SELECT id, generate_referral_code()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
