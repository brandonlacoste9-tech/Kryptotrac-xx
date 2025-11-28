# Database Setup Guide

This guide walks you through setting up the KryptoTrac database in Supabase.

## Overview

KryptoTrac uses Supabase (PostgreSQL) as its database. You'll need to run several SQL migration scripts to create the necessary tables and configure Row Level Security (RLS) policies.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- A Supabase project created
- Access to your project's SQL Editor

## Step-by-Step Setup

### 1. Access the SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **SQL Editor** in the left sidebar

### 2. Run Migration Scripts

Run the following scripts **in this exact order**. Copy the contents of each file and paste into the SQL Editor, then click "Run".

#### Step 1: Security Fixes
```
scripts/PRE_LAUNCH_SECURITY_FIX.sql
```
This script fixes 15+ security warnings related to RLS policies.

#### Step 2: Core Schema
```
scripts/LAUNCH_READY_MIGRATION.sql
```
Creates all core tables:
- `profiles` - User profiles with tier and preferences
- `user_watchlists` - Tracked cryptocurrencies
- `user_portfolios` - Holdings and transactions
- `price_alerts` - Custom price alerts
- `atlas_conversations` - BB chat history
- `atlas_rate_limits` - Query tracking
- `referrals` - Referral system
- `user_subscriptions` - Stripe subscriptions
- `subscription_events` - Billing audit log

#### Step 3: BB Tips Feature
```
scripts/013_add_bb_tips_table.sql
```
Adds the proactive tips system where BB sends notifications about your watchlist.

#### Step 4: Onboarding & Credits
```
scripts/014_add_onboarding_and_credits.sql
```
Adds:
- Welcome flow tracking
- Referral credit system
- Onboarding completion status

#### Step 5: Referral Functions
```
scripts/015_add_referral_rpc.sql
```
Creates PostgreSQL functions for:
- Awarding referral bonuses
- Tracking referral chains

### 3. Verify Installation

After running all scripts, verify the setup:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ profiles
   - ✅ user_portfolios
   - ✅ user_watchlists
   - ✅ price_alerts
   - ✅ atlas_conversations
   - ✅ atlas_rate_limits
   - ✅ bb_tips
   - ✅ referrals
   - ✅ user_subscriptions
   - ✅ subscription_events

3. Click on any table → **Policies** tab
4. Each table should have RLS policies enabled

### 4. Configure Authentication

#### For Development (Quick Testing)

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **OFF** "Confirm email"
3. Click **Save**

This allows immediate login after signup without email confirmation.

⚠️ **Important**: Re-enable email confirmation before production launch!

#### For Production

1. Go to **Authentication** → **URL Configuration**
2. Add your production domain to the allowlist:
   - `https://your-domain.com/**`
   - `http://localhost:3000/**` (for testing)
3. Go to **Authentication** → **Email Templates**
4. Customize the "Confirm signup" email template with your branding
5. Test the signup flow end-to-end

### 5. Set Up Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000/**` (development)
   - `https://your-production-domain.com/**` (production)
   - Any Vercel preview URLs if deploying to Vercel

## Testing Your Setup

### Test 1: Create a User

1. Run your app locally: `npm run dev`
2. Go to `/auth/signup`
3. Create an account
4. Check Supabase → **Authentication** → **Users**
5. You should see your new user

### Test 2: Profile Auto-Creation

1. After signup, check **Table Editor** → **profiles**
2. A profile should be auto-created for your user
3. Default values should be set (tier: 'free', credits: 0)

### Test 3: Login

1. Go to `/auth/login`
2. Enter your credentials
3. You should be redirected to `/dashboard`
4. If you get "Email not confirmed", see Troubleshooting below

### Test 4: Watchlist

1. On the dashboard, add a cryptocurrency
2. Check **Table Editor** → **user_watchlists**
3. Your entry should appear with your user_id

## Troubleshooting

### "Email not confirmed" error

**Cause**: Supabase email confirmation is enabled
**Solution**: 
- Disable it (see "For Development" above), OR
- Check your email and click the confirmation link, OR
- Manually confirm the user:
  1. Go to **Authentication** → **Users**
  2. Click on the user
  3. Click "Confirm email"

### "User not found" or "Profile not found"

**Cause**: Migration scripts not run or auto-trigger failed
**Solution**:
1. Verify all 5 migration scripts ran successfully
2. Check for errors in SQL Editor
3. Manually create a profile:
```sql
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
WHERE id = 'your-user-id';
```

### "Permission denied" errors

**Cause**: RLS policies not set up correctly
**Solution**:
1. Re-run `PRE_LAUNCH_SECURITY_FIX.sql`
2. Check **Table Editor** → click table → **Policies** tab
3. Ensure policies are enabled and not throwing errors

### Tables don't exist

**Cause**: Migration scripts not run
**Solution**:
1. Run `LAUNCH_READY_MIGRATION.sql` first
2. Then run the numbered scripts (013, 014, 015) in order
3. Check SQL Editor for any error messages

## Additional Configuration

### Stripe Webhooks

If you're using payments:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add a webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret and add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### CoinGecko API

The free tier has rate limits (10-30 calls/minute). The app includes fallback data, so rate limit errors are expected and handled gracefully.

To upgrade:
1. Visit [CoinGecko API](https://www.coingecko.com/en/api/pricing)
2. Choose a paid plan ($129/mo for 500 calls/min)
3. No code changes needed - just enjoy higher limits

## Next Steps

✅ Database setup complete!

Now you can:
1. Test the full authentication flow
2. Add cryptocurrencies to your watchlist
3. Chat with BB, the AI assistant
4. Set up Stripe for payments (optional)
5. Deploy to production (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## Need Help?

- 📖 [Getting Started Guide](./GETTING_STARTED.md)
- 🐛 [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
