# KryptoTrac Launch Migration Guide

## Critical: Run This Before Monday Launch

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your KryptoTrac project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Run the Migration

1. Open the file `scripts/LAUNCH_READY_MIGRATION.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)

**Expected output:** "Success. No rows returned"

### Step 3: Verify the Migration

Run this query to verify everything was created:

\`\`\`sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
\`\`\`

You should see:
- atlas_conversations
- atlas_messages
- atlas_rate_limits
- price_alerts
- profiles
- referrals
- subscription_events
- user_portfolios
- user_subscriptions
- user_watchlists

### Step 4: Test Auth Flow

1. Go to your app signup page
2. Create a test account
3. Check Supabase Authentication > Users - you should see the new user
4. Check Database > profiles table - a profile should auto-create
5. Try logging in - should work!

### What This Migration Does

1. **Fixes Auth** - Creates profiles table linked to Supabase auth.users
2. **Auto-creates profiles** - Trigger creates profile when user signs up
3. **Adds referral system** - Full referral tracking with credits
4. **Enables ATLAS** - Conversation memory and rate limiting
5. **Fixes Stripe** - Proper subscription event tracking
6. **Removes custom users table** - Uses Supabase auth.users instead

### Troubleshooting

**Error: "relation auth.users does not exist"**
- Your Supabase project might not have auth schema enabled
- Contact Supabase support

**Error: "permission denied"**
- Make sure you're running as the postgres user (default in SQL Editor)
- Check you're in the right project

**Profiles not auto-creating:**
\`\`\`sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
\`\`\`

### After Migration

Your auth flow will work like this:
1. User signs up → Supabase creates auth.users record
2. Trigger fires → Creates profiles record automatically
3. User can log in → RLS policies grant access to their data
4. Referral tracking → Works if they used a referral link

## Ready for Launch! 🚀
