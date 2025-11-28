# KryptoTrac Authentication Setup Guide

## Step 1: Run the Master SQL Script

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `scripts/000_MASTER_SETUP.sql`
5. Paste into the SQL editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. You should see: "KryptoTrac database setup complete!"

## Step 2: Verify Tables Were Created

In the Supabase dashboard, go to "Table Editor" and verify you see:

- ✅ profiles
- ✅ user_watchlists
- ✅ user_portfolios
- ✅ price_alerts
- ✅ portfolio_snapshots
- ✅ insights_history
- ✅ export_history
- ✅ referral_codes
- ✅ referrals
- ✅ user_subscriptions

## Step 3: Test Authentication

1. Go to your KryptoTrac app
2. Click "Sign Up"
3. Enter email and password
4. Check your email for the confirmation link
5. Click the confirmation link
6. You should be redirected to `/dashboard`

## Step 4: Test Referral System

1. Once logged in, go to `/referrals`
2. Copy your referral link (e.g., `https://kryptotrac.com/ref/ABC12345`)
3. Open in incognito/private window
4. Should redirect to signup with referral bonus message
5. After signup, both users get $5 credit

## Troubleshooting

### "Login Failed" Error
- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase Auth logs for details

### Referral Link 404
- Verify the `/app/ref/[code]/page.tsx` file exists
- Check middleware.ts is not blocking the route

### No Profile Created on Signup
- Check if the `on_auth_user_created` trigger exists
- Run this in SQL Editor to test:
  \`\`\`sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  \`\`\`

### RLS Policy Errors
- Make sure you're logged in
- Check browser cookies are enabled
- Verify the middleware is calling `getUser()` to set auth context

## Next Steps

Once auth works:
1. Add tax export feature
2. Implement AI portfolio insights
3. Add wallet import functionality
4. Set up price alert notifications
