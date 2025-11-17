-- KryptoTrac Master Setup Script
-- Run this ONCE in your Supabase SQL Editor to set up the entire database
-- This consolidates all schema migrations into one script

-- ============================================
-- 1. PROFILES TABLE (User metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Toronto',
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. WATCHLIST TABLE (Already exists, ensure RLS)
-- ============================================
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own watchlist" ON user_watchlists;
CREATE POLICY "Users can view own watchlist"
  ON user_watchlists FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watchlist" ON user_watchlists;
CREATE POLICY "Users can insert own watchlist"
  ON user_watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own watchlist" ON user_watchlists;
CREATE POLICY "Users can update own watchlist"
  ON user_watchlists FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watchlist" ON user_watchlists;
CREATE POLICY "Users can delete own watchlist"
  ON user_watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PORTFOLIO TABLE (Already exists, ensure RLS)
-- ============================================
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own portfolio" ON user_portfolios;
CREATE POLICY "Users can view own portfolio"
  ON user_portfolios FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own portfolio" ON user_portfolios;
CREATE POLICY "Users can insert own portfolio"
  ON user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own portfolio" ON user_portfolios;
CREATE POLICY "Users can update own portfolio"
  ON user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own portfolio" ON user_portfolios;
CREATE POLICY "Users can delete own portfolio"
  ON user_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. ALERTS TABLE (Already exists, ensure RLS)
-- ============================================
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON price_alerts;
CREATE POLICY "Users can view own alerts"
  ON price_alerts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON price_alerts;
CREATE POLICY "Users can insert own alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON price_alerts;
CREATE POLICY "Users can update own alerts"
  ON price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON price_alerts;
CREATE POLICY "Users can delete own alerts"
  ON price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. PORTFOLIO SNAPSHOTS (Historical tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);

-- ============================================
-- 6. INSIGHTS HISTORY (AI insights)
-- ============================================
CREATE TABLE IF NOT EXISTS insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE insights_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON insights_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_insights_user_created ON insights_history(user_id, created_at DESC);

-- ============================================
-- 7. EXPORT HISTORY (Track downloads)
-- ============================================
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL,
  file_format TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON export_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 8. REFERRAL SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  referrer_credit DECIMAL(10, 2) DEFAULT 5.00,
  referee_credit DECIMAL(10, 2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  UNIQUE(referee_id)
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-create referral code on profile creation
CREATE OR REPLACE FUNCTION create_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.id, generate_referral_code());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_referral_code();

-- ============================================
-- 9. SUBSCRIPTIONS TABLE (Ensure RLS)
-- ============================================
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'KryptoTrac database setup complete!';
  RAISE NOTICE 'All tables, policies, and triggers have been created.';
  RAISE NOTICE 'You can now sign up and log in to your app.';
END $$;
