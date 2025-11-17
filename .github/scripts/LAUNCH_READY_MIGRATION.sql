-- KryptoTrac Launch-Ready Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- This fixes auth, adds profiles, referrals, and ATLAS features

-- =============================================================================
-- STEP 1: Create profiles table (links to auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  referral_credits NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- STEP 2: Auto-create profile when user signs up
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique 6-character referral code
  new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, display_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    new_referral_code
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 3: Referral system tables
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  signup_credit NUMERIC DEFAULT 5.00,
  conversion_credit NUMERIC DEFAULT 20.00,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- =============================================================================
-- STEP 4: ATLAS memory and rate limiting
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.atlas_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  persona TEXT DEFAULT 'bb',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.atlas_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.atlas_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.atlas_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_queries INTEGER DEFAULT 0,
  last_reset TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.atlas_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atlas_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atlas_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for ATLAS tables
CREATE POLICY "Users can manage their conversations"
  ON public.atlas_conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their conversations"
  ON public.atlas_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.atlas_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.atlas_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.atlas_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their rate limits"
  ON public.atlas_rate_limits FOR ALL
  USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 5: Drop old users table if it exists (we use auth.users instead)
-- =============================================================================
DROP TABLE IF EXISTS public.users CASCADE;

-- =============================================================================
-- STEP 6: Update existing table references
-- =============================================================================

-- Update user_subscriptions to reference auth.users
ALTER TABLE public.user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

ALTER TABLE public.user_subscriptions 
  ADD CONSTRAINT user_subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================================================
-- STEP 7: Create referral tracking function
-- =============================================================================
CREATE OR REPLACE FUNCTION public.track_referral(
  p_referrer_code TEXT,
  p_referred_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Find referrer by code
  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = p_referrer_code;
  
  IF v_referrer_id IS NOT NULL THEN
    -- Create referral record
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (v_referrer_id, p_referred_id);
    
    -- Credit both users
    UPDATE public.profiles
    SET referral_credits = referral_credits + 5.00
    WHERE id = v_referrer_id OR id = p_referred_id;
    
    -- Update referred_by
    UPDATE public.profiles
    SET referred_by = v_referrer_id
    WHERE id = p_referred_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 8: Stripe webhook events table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage subscription events"
  ON public.subscription_events FOR ALL
  USING (true);

-- =============================================================================
-- DONE! Auth is now ready 🚀
-- =============================================================================
