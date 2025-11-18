-- Remove the old users table that conflicts with profiles
-- Run this in Supabase SQL Editor

-- Drop the old users table (we use profiles now which is linked to auth.users)
DROP TABLE IF EXISTS public.users CASCADE;

-- Verify profiles table exists and is properly linked
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if any profiles exist
SELECT COUNT(*) as profile_count FROM public.profiles;
