-- KryptoTrac Complete Database Schema
-- Phase 1: Infrastructure Lockdown

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- User profile metadata and preferences
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PORTFOLIO_SNAPSHOTS TABLE (if not exists)
-- =====================================================
-- Daily snapshots of portfolio value for historical tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value NUMERIC(20, 2) NOT NULL,
  total_cost NUMERIC(20, 2) NOT NULL,
  profit_loss NUMERIC(20, 2) NOT NULL,
  profit_loss_percent NUMERIC(10, 4) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- RLS Policies for portfolio_snapshots
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date 
  ON portfolio_snapshots(user_id, snapshot_date DESC);

-- =====================================================
-- 3. INSIGHTS_HISTORY TABLE (if not exists)
-- =====================================================
-- AI-generated portfolio insights history
CREATE TABLE IF NOT EXISTS insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'portfolio_analysis', 'market_commentary', 'risk_assessment'
  content JSONB NOT NULL, -- {summary, recommendations, metrics, etc}
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- RLS Policies for insights_history
ALTER TABLE insights_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON insights_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON insights_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON insights_history FOR INSERT
  WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_insights_history_user_date 
  ON insights_history(user_id, generated_at DESC);

-- =====================================================
-- 4. EXPORT_HISTORY TABLE (if not exists)
-- =====================================================
-- Track user exports for analytics and rate limiting
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'csv', 'pdf', 'json'
  file_size INTEGER, -- in bytes
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for export_history
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports"
  ON export_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert exports"
  ON export_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_export_history_user_date 
  ON export_history(user_id, exported_at DESC);

-- =====================================================
-- 5. DIGEST_PREFERENCES TABLE (if not exists)
-- =====================================================
-- User preferences for daily/weekly email digests
CREATE TABLE IF NOT EXISTS digest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_digest BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  alert_emails BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  digest_time TIME DEFAULT '08:00:00', -- 8am local time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for digest_preferences
ALTER TABLE digest_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digest preferences"
  ON digest_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own digest preferences"
  ON digest_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own digest preferences"
  ON digest_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. RENAME user_subscriptions to subscriptions
-- =====================================================
-- Note: This will need to be done carefully in production
-- For now, we'll create a view to maintain compatibility
CREATE OR REPLACE VIEW subscriptions AS
SELECT * FROM user_subscriptions;

-- =====================================================
-- 7. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add coin_image to user_watchlists if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlists' AND column_name = 'coin_name'
  ) THEN
    ALTER TABLE user_watchlists ADD COLUMN coin_name TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlists' AND column_name = 'coin_symbol'
  ) THEN
    ALTER TABLE user_watchlists ADD COLUMN coin_symbol TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlists' AND column_name = 'coin_image'
  ) THEN
    ALTER TABLE user_watchlists ADD COLUMN coin_image TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlists' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE user_watchlists ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_watchlists' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_watchlists ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_digest_preferences_updated_at ON digest_preferences;
CREATE TRIGGER update_digest_preferences_updated_at
  BEFORE UPDATE ON digest_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_watchlists_updated_at ON user_watchlists;
CREATE TRIGGER update_user_watchlists_updated_at
  BEFORE UPDATE ON user_watchlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user_id ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_triggered ON price_alerts(is_triggered, email_sent);

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- This migration creates all necessary tables for Phase 1
-- Ready for: watchlist persistence, portfolio CRUD, price alerts, insights
