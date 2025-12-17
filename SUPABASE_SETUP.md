# Supabase Setup Guide - KryptoTrac

## 🔗 Your Project Details

**Project ID**: `hiuemmkhwiaarpdyncgj`  
**Project URL**: `https://hiuemmkhwiaarpdyncgj.supabase.co`  
**Dashboard**: https://supabase.com/dashboard/project/hiuemmkhwiaarpdyncgj

---

## 📋 Quick Setup Checklist

### 1. Get Your API Keys

Visit your project settings:
https://supabase.com/dashboard/project/hiuemmkhwiaarpdyncgj/settings/api

You need **two keys**:

1. **`anon` (public)** - Safe for client-side code
2. **`service_role` (secret)** - Server-side only, NEVER expose!

### 2. Create `.env.local` File

In your project root (`c:\Users\north\Kryptotrac-xx-1`), create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hiuemmkhwiaarpdyncgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here

# CoinGecko API (already configured)
COINGECKO_API_KEY=CG-3SvnagJo5kkEe7DAMPwPsc1U

# Other required keys...
# (Add Stripe, etc. as needed)
```

### 3. Verify Connection

Run the database inspector:

```bash
node scripts/inspect-supabase.js
```

This will show you all tables and verify the connection works.

---

## 🗄️ Expected Database Tables

Your KryptoTrac app should have these tables:

### Core Tables
- **`profiles`** - User profile data
- **`user_subscriptions`** - Stripe subscription tracking
- **`api_credits`** - BB AI credit management

### Portfolio Tables
- **`user_portfolios`** - User's crypto holdings
- **`user_watchlists`** - Watched coins
- **`portfolio_snapshots`** - Historical portfolio values

### DeFi Tables
- **`user_wallets`** - Ethereum wallet addresses ✅ (just added)
- **`defi_positions`** - DeFi protocol positions

### Features Tables
- **`price_alerts`** - Price alert configurations
- **`bb_tips`** - AI assistant tips
- **`digest_preferences`** - Email digest settings
- **`referrals`** - Referral tracking

### Analytics Tables
- **`insights`** - Generated portfolio insights

---

## 🔒 Security: Row Level Security (RLS)

Every table **MUST** have RLS enabled. Check with:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Common RLS Policies

```sql
-- Example: users can only see their own data
CREATE POLICY "Users can view own portfolio"
  ON user_portfolios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON user_portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔄 Database Migrations

Check if migrations are up to date:

```bash
# View your migration files
ls supabase/migrations/

# Apply migrations (if using Supabase CLI)
supabase db push
```

---

## 🧪 Test Database Connection

Quick test in Node.js console:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hiuemmkhwiaarpdyncgj.supabase.co',
  'your-anon-key-here'
)

// Test query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Connection test:', { data, error })
```

---

## 🚨 Common Issues

### Issue: "Invalid API key"
- Double-check you copied the correct keys
- Ensure no extra spaces or line breaks
- Try regenerating the keys in Supabase dashboard

### Issue: "relation does not exist"
- Table hasn't been created yet
- Run migrations: `supabase db push`
- Or manually create tables in SQL Editor

### Issue: "permission denied for table"
- RLS is blocking the query (this is good!)
- Make sure RLS policies are correctly set up
- Use service_role key for admin operations

### Issue: "JWT expired"
- User session has expired
- Call `supabase.auth.refreshSession()`
- Or redirect user to login

---

## 📊 Monitor Your Database

**Database Dashboard**:
https://supabase.com/dashboard/project/hiuemmkhwiaarpdyncgj/database/tables

**Real-time Logs**:
https://supabase.com/dashboard/project/hiuemmkhwiaarpdyncgj/logs/explorer

**Database Health**:
https://supabase.com/dashboard/project/hiuemmkhwiaarpdyncgj/reports/database

---

## 🔧 Useful SQL Queries

### Check table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View all RLS policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### Check user count
```sql
SELECT COUNT(*) FROM auth.users;
```

---

## Next Steps

1. ✅ Add your API keys to `.env.local`
2. ✅ Run `node scripts/inspect-supabase.js`
3. ✅ Verify all tables exist
4. ✅ Start your dev server: `pnpm dev`
5. ✅ Test signup/login flow
6. ✅ Check that data is saving correctly

**Your Supabase project is ready to go!** 🚀
