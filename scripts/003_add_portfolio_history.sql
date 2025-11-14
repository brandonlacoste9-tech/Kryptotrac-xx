-- Create portfolio_snapshots table to track daily portfolio values
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value DECIMAL(20, 2) NOT NULL,
  total_cost DECIMAL(20, 2) NOT NULL,
  total_pnl DECIMAL(20, 2) NOT NULL,
  pnl_percentage DECIMAL(10, 4) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Create holding_snapshots table to track individual positions over time
CREATE TABLE IF NOT EXISTS holding_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_snapshot_id UUID NOT NULL REFERENCES portfolio_snapshots(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  value DECIMAL(20, 2) NOT NULL,
  cost_basis DECIMAL(20, 2) NOT NULL,
  pnl DECIMAL(20, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holding_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_snapshots
CREATE POLICY "Users can view their own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for holding_snapshots  
CREATE POLICY "Users can view their own holding snapshots"
  ON holding_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots
      WHERE portfolio_snapshots.id = holding_snapshots.portfolio_snapshot_id
      AND portfolio_snapshots.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_holding_snapshots_portfolio ON holding_snapshots(portfolio_snapshot_id);
