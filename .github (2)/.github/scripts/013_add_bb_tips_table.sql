-- BB Tips tracking table
CREATE TABLE IF NOT EXISTS bb_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  coin TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE bb_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tips"
  ON bb_tips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert tips"
  ON bb_tips FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tips"
  ON bb_tips FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bb_tips_user_id ON bb_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_bb_tips_created_at ON bb_tips(created_at);
CREATE INDEX IF NOT EXISTS idx_bb_tips_read ON bb_tips(read);

-- Weekly tip count function
CREATE OR REPLACE FUNCTION get_weekly_tip_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tip_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO tip_count
  FROM bb_tips
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '7 days';
  
  RETURN tip_count;
END;
$$;
