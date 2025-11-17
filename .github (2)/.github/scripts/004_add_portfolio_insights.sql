-- Portfolio Insights Table
CREATE TABLE IF NOT EXISTS portfolio_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  metrics JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_portfolio_insights_user_id ON portfolio_insights(user_id);
CREATE INDEX idx_portfolio_insights_generated_at ON portfolio_insights(generated_at DESC);

-- Enable RLS
ALTER TABLE portfolio_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own insights"
  ON portfolio_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON portfolio_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-delete old insights (keep last 30)
CREATE OR REPLACE FUNCTION cleanup_old_insights()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM portfolio_insights
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id
    FROM portfolio_insights
    WHERE user_id = NEW.user_id
    ORDER BY generated_at DESC
    LIMIT 30
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_insights
AFTER INSERT ON portfolio_insights
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_insights();
