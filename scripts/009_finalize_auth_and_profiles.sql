-- PHASE 1: Fix Auth Completely
-- Drop custom users table and use Supabase auth.users instead
-- Create profiles table linked to auth.uid()

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Toronto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Subscription tracking
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  trial_ends_at TIMESTAMPTZ,
  
  -- Referral tracking
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  referral_credits NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code (6 chars)
  new_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6));
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, new_referral_code);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing foreign keys to use auth.users
-- This assumes you want to migrate data from custom users table
-- If users table has data, you'll need to manually migrate it to auth.users first

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
