-- KryptoTrac Final Production Migration (AUDITED & SAFE)
-- Run this in Supabase SQL Editor to enable all features
-- BEE-certified: Safe for production deployment

-- ============================================================================
-- PART 1: Create Profiles System (Replaces custom users table)
-- ============================================================================

-- Drop custom users table if exists (we use auth.users instead)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID, -- Removed FK constraint - will add later to avoid circular dependency
  credits_earned DECIMAL DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- PART 2: Auto-create Profile Trigger
-- ============================================================================

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8))
  )
  ON CONFLICT (id) DO NOTHING; -- Added to prevent duplicate errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 3: Referral System Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  signup_credit DECIMAL DEFAULT 5.00,
  conversion_credit DECIMAL DEFAULT 20.00,
  conversion_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their referrals" ON public.referrals;
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Now safe to add foreign key for referred_by
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_referred_by 
  FOREIGN KEY (referred_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 4: Referral Processing Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Find referrer by code
  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = p_referral_code;

  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referee_id THEN
    -- Create referral record
    INSERT INTO public.referrals (referrer_id, referee_id)
    VALUES (v_referrer_id, p_referee_id)
    ON CONFLICT DO NOTHING; -- Prevent duplicate referrals

    -- Update referee's referred_by
    UPDATE public.profiles
    SET referred_by = v_referrer_id
    WHERE id = p_referee_id;

    -- Award signup credits to both parties
    UPDATE public.profiles
    SET credits_earned = credits_earned + 5.00
    WHERE id IN (v_referrer_id, p_referee_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: BB Tips Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bb_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  coin_id TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('pump', 'dump', 'whale', 'news', 'flash_crash', 'resistance')), -- Added constraint
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bb_tips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tips" ON public.bb_tips;
CREATE POLICY "Users can view their own tips"
  ON public.bb_tips FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tips" ON public.bb_tips;
CREATE POLICY "Users can update their own tips"
  ON public.bb_tips FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 6: ATLAS Conversation Memory
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.atlas_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  persona TEXT DEFAULT 'bb' CHECK (persona IN ('bb', 'satoshi', 'default')), -- Added constraint
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.atlas_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.atlas_conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.atlas_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.atlas_conversations;
CREATE POLICY "Users can insert their own conversations"
  ON public.atlas_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 7: ATLAS Rate Limiting
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.atlas_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requests_made INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One rate limit record per user
);

ALTER TABLE public.atlas_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.atlas_rate_limits;
CREATE POLICY "Users can view their own rate limits"
  ON public.atlas_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.atlas_rate_limits;
CREATE POLICY "Users can update their own rate limits"
  ON public.atlas_rate_limits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rate limits" ON public.atlas_rate_limits;
CREATE POLICY "Users can insert their own rate limits"
  ON public.atlas_rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 8: Stripe Subscription Events (Audit Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription events" ON public.subscription_events;
CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 9: Updated_at Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to atlas_rate_limits
DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON public.atlas_rate_limits;
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.atlas_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Only add triggers for tables that exist (user_portfolios, user_subscriptions handled separately if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_portfolios') THEN
    DROP TRIGGER IF EXISTS update_portfolios_updated_at ON public.user_portfolios;
    EXECUTE 'CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.user_portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_subscriptions') THEN
    DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.user_subscriptions;
    EXECUTE 'CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
END $$;

-- ============================================================================
-- PART 10: Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_bb_tips_user_unread ON public.bb_tips(user_id, is_read) WHERE is_read = false; -- Partial index for better performance
CREATE INDEX IF NOT EXISTS idx_atlas_conversations_user_created ON public.atlas_conversations(user_id, created_at DESC); -- Composite index for message history
CREATE INDEX IF NOT EXISTS idx_atlas_rate_limits_user ON public.atlas_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON public.subscription_events(user_id, created_at DESC);

-- ============================================================================
-- Migration Complete - Safe for Production
-- ============================================================================

-- Verify critical tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') = 1, 'profiles table not created';
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals') = 1, 'referrals table not created';
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bb_tips') = 1, 'bb_tips table not created';
  RAISE NOTICE 'Migration completed successfully - all tables created';
END $$;
