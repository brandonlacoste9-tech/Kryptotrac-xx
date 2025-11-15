-- ATLAS Memory and Rate Limiting System
-- Stores user interaction history and enforces tier-based limits

-- Create atlas_user_state table for memory
CREATE TABLE IF NOT EXISTS atlas_user_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_queries JSONB DEFAULT '[]'::jsonb, -- Last 10 queries
  trading_style TEXT, -- "aggressive", "conservative", "balanced"
  risk_profile TEXT, -- "high", "medium", "low"
  emotional_tags TEXT[], -- ["fear", "hype", "revenge-trading"]
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create atlas_query_log for rate limiting
CREATE TABLE IF NOT EXISTS atlas_query_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT,
  mode TEXT NOT NULL, -- "analysis", "sentiment", "alpha", "friend", "council"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE atlas_user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE atlas_query_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own ATLAS state" ON atlas_user_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ATLAS state" ON atlas_user_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ATLAS state" ON atlas_user_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ATLAS queries" ON atlas_query_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ATLAS queries" ON atlas_query_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_atlas_state_user ON atlas_user_state(user_id);
CREATE INDEX idx_atlas_log_user_date ON atlas_query_log(user_id, created_at DESC);

-- Function to get today's query count
CREATE OR REPLACE FUNCTION get_user_atlas_query_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM atlas_query_log
    WHERE user_id = user_uuid
    AND created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
