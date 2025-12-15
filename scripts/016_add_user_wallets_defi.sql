-- ============================================================================
-- Migration 016: Add User Wallets for DeFi Tracking
-- ============================================================================
-- This migration adds the user_wallets table to store Ethereum/crypto wallet
-- addresses for tracking DeFi positions across protocols like Aave, Uniswap,
-- Compound, Lido, and Curve.
-- ============================================================================

-- User wallet addresses for DeFi tracking
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address VARCHAR(42) NOT NULL,
  chain VARCHAR(20) NOT NULL DEFAULT 'ethereum',
  label VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address, chain)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_user_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_wallets_updated_at();

-- Enable Row Level Security
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own wallets" ON user_wallets;
DROP POLICY IF EXISTS "Users can add own wallets" ON user_wallets;
DROP POLICY IF EXISTS "Users can update own wallets" ON user_wallets;
DROP POLICY IF EXISTS "Users can delete own wallets" ON user_wallets;

-- RLS Policies
CREATE POLICY "Users can view own wallets"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own wallets"
  ON user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
  ON user_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_wallets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_wallets IS 'Stores user crypto wallet addresses for DeFi position tracking';
COMMENT ON COLUMN user_wallets.address IS 'Wallet address (e.g., Ethereum address starting with 0x)';
COMMENT ON COLUMN user_wallets.chain IS 'Blockchain network (ethereum, polygon, arbitrum, etc.)';
COMMENT ON COLUMN user_wallets.label IS 'User-defined label for the wallet (e.g., "Main Wallet", "Trading Wallet")';
