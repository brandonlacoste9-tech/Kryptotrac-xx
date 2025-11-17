-- KryptoTrac Final Production Migration
-- Run this in Supabase SQL Editor to enable all features
-- This consolidates all pending migrations into one script

-- ============================================================================
-- PART 1: Fix Users Table & Create Profiles System
-- ============================================================================

-- Drop the custom users table since Supabase auth.users is the source of truth
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  credits_earned DECIMAL DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 2: Referral System
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

CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Function to process referral on signup
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
    VALUES (v_referrer_id, p_referee_id);

    -- Award credits to both parties
    UPDATE public.profiles
    SET credits_earned = credits_earned + 5.00
    WHERE id IN (v_referrer_id, p_referee_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: BB Tips & ATLAS Memory
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bb_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  coin_id TEXT,
  trigger_type TEXT, -- 'pump', 'dump', 'whale', 'news', 'flash_crash', 'resistance'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bb_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tips"
  ON public.bb_tips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tips"
  ON public.bb_tips FOR UPDATE
  USING (auth.uid() = user_id);

-- ATLAS conversation memory
CREATE TABLE IF NOT EXISTS public.atlas_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  persona TEXT DEFAULT 'bb',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.atlas_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.atlas_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- ATLAS rate limiting
CREATE TABLE IF NOT EXISTS public.atlas_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requests_made INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.atlas_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
  ON public.atlas_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 4: Stripe Subscription Events (Audit Log)
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

CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 5: Updated_at Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON public.user_portfolios;
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.user_portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 6: Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_bb_tips_user_unread ON public.bb_tips(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_atlas_conversations_user ON public.atlas_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_atlas_rate_limits_user ON public.atlas_rate_limits(user_id);

-- ============================================================================
-- Migration Complete
-- ============================================================================
