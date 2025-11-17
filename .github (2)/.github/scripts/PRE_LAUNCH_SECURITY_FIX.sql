-- PRE-LAUNCH SECURITY FIX
-- Run this BEFORE the main migration to fix the 15 issues flagged by Supabase
-- Estimated time: 30 seconds

-- ============================================
-- ISSUE 1: Fix update_updated_at_column Security
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY INVOKER  -- Use SECURITY INVOKER instead of DEFINER to prevent privilege escalation
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column on row updates';

-- ============================================
-- ISSUE 2: Add RLS Policies to users table
-- ============================================

-- The users table has RLS enabled but 0 policies, which blocks all access
-- Add proper policies for auth users

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PERFORMANCE: Add missing indexes
-- ============================================

-- Index for user lookups by email (speeds up login)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Index for subscription lookups by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);

-- Index for watchlist coin lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_coin_id ON public.user_watchlists(coin_id);

-- Index for portfolio coin lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_coin_id ON public.user_portfolios(coin_id);

-- Index for alert lookups by condition
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON public.price_alerts(is_triggered, created_at);

-- ============================================
-- GRANT PROPER PERMISSIONS
-- ============================================

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these after the migration to verify:
-- SELECT count(*) FROM pg_policies WHERE tablename = 'users';  -- Should return 3
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('users', 'user_subscriptions', 'user_watchlists', 'user_portfolios', 'price_alerts');
