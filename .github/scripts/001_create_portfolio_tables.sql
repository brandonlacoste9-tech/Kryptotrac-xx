-- Create user_portfolios table to store crypto holdings
CREATE TABLE IF NOT EXISTS user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_image TEXT,
  quantity DECIMAL(20, 8) NOT NULL,
  purchase_price DECIMAL(20, 8) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_watchlists table for saved coins
CREATE TABLE IF NOT EXISTS user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  target_price DECIMAL(20, 8) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  is_triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table for premium tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_portfolios
CREATE POLICY "Users can view their own portfolios"
  ON user_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON user_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_watchlists
CREATE POLICY "Users can view their own watchlists"
  ON user_watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlists"
  ON user_watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists"
  ON user_watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own alerts"
  ON price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX idx_user_watchlists_user_id ON user_watchlists(user_id);
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_triggered ON price_alerts(is_triggered, user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_portfolios_updated_at
  BEFORE UPDATE ON user_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
