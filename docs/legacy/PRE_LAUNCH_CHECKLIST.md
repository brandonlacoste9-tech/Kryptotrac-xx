# Pre-Launch Security & Performance Fixes

## Current State (From Supabase Dashboard)
- 5 tables created
- 0 auth requests (login broken)
- 15 issues flagged: 2 security, 13 performance

## Step-by-Step Fix Process

### Step 1: Run Security Fix Script (30 seconds)
1. Open Supabase Dashboard > SQL Editor
2. Paste contents of `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
3. Click "Run"
4. Expected result: "Success. No rows returned"

**What This Fixes:**
- Fixes `update_updated_at_column` security vulnerability (SECURITY INVOKER)
- Adds 3 RLS policies to users table (fixes auth blocking)
- Adds 5 performance indexes (speeds up queries)
- Grants proper permissions

### Step 2: Verify Fixes (15 seconds)
Run these verification queries in SQL Editor:

\`\`\`sql
-- Should return 3 (users table now has 3 policies)
SELECT count(*) FROM pg_policies WHERE tablename = 'users';

-- Should return 5+ indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('users', 'user_subscriptions', 'user_watchlists', 'user_portfolios', 'price_alerts');

-- Should return 1 row showing SECURITY INVOKER
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column';
\`\`\`

### Step 3: Run Main Migration (2 minutes)
After security fixes are verified, run `scripts/LAUNCH_READY_MIGRATION.sql`

This adds:
- profiles table with auto-creation trigger
- referral system tables
- ATLAS memory and rate limiting
- Stripe webhook tracking

### Step 4: Test Auth Flow (5 minutes)
1. Go to your app signup page
2. Create test account: test@kryptotrac.com / password123
3. Check Supabase Dashboard:
   - Auth requests should show 1+
   - Database requests should spike
   - Issues count should drop from 15 to 0-2

### Step 5: Monitor Dashboard
After migration, your Supabase dashboard should show:
- 10 tables total (5 existing + 5 new)
- Auth requests increasing
- 0-2 remaining issues (down from 15)
- Database requests active

## Common Issues

### Issue: "permission denied for table users"
**Fix:** RLS policies weren't applied. Re-run Step 1.

### Issue: "function update_updated_at_column() does not exist"
**Fix:** Function wasn't created. Re-run Step 1.

### Issue: Still 0 auth requests after migration
**Fix:** Check that middleware.ts exists and is calling `supabase.auth.getUser()`

## Success Indicators
- Security issues: 2 → 0
- Performance issues: 13 → 0-2 (some warnings are normal)
- Auth requests: 0 → Active
- Can sign up and log in successfully
- Dashboard shows 10 tables with proper RLS policies
