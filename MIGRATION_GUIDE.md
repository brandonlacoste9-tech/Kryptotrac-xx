# Database Migration Guide

This guide provides a quick reference for running database migrations in order.

## Required Migrations (Run in Order)

Execute these SQL scripts in your Supabase SQL Editor in this exact sequence:

### 1. Security Fixes
**File**: `scripts/PRE_LAUNCH_SECURITY_FIX.sql`

**Purpose**: Fixes security warnings and sets up proper RLS policies

**What it does**:
- Fixes 15+ security issues
- Enables RLS on all tables
- Sets up proper policy configurations

### 2. Core Schema
**File**: `scripts/LAUNCH_READY_MIGRATION.sql`

**Purpose**: Creates all core tables and relationships

**Tables created**:
- `profiles` - User profiles
- `user_portfolios` - Crypto holdings
- `user_watchlists` - Tracked coins
- `price_alerts` - Price notifications
- `atlas_conversations` - BB chat history
- `atlas_rate_limits` - Query limits
- `referrals` - Referral tracking
- `user_subscriptions` - Stripe subscriptions
- `subscription_events` - Billing events

### 3. BB Tips System
**File**: `scripts/013_add_bb_tips_table.sql`

**Purpose**: Adds proactive notification system

**What it does**:
- Creates `bb_tips` table
- Sets up triggers for tip generation
- Configures RLS policies

### 4. Onboarding & Credits
**File**: `scripts/014_add_onboarding_and_credits.sql`

**Purpose**: Adds welcome flow and referral credits

**What it does**:
- Adds onboarding tracking columns to profiles
- Implements credit system
- Sets up welcome flow logic

### 5. Referral Functions
**File**: `scripts/015_add_referral_rpc.sql`

**Purpose**: Creates PostgreSQL functions for referrals

**What it does**:
- Creates `award_referral_bonus()` function
- Creates `get_referral_stats()` function
- Sets up referral chain tracking

## How to Run Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Open the first migration file in your code editor
6. Copy the entire contents
7. Paste into Supabase SQL Editor
8. Click **"Run"**
9. Verify "Success" message
10. Repeat for each migration file in order

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push

# Or run individual files
supabase db execute scripts/PRE_LAUNCH_SECURITY_FIX.sql
supabase db execute scripts/LAUNCH_READY_MIGRATION.sql
supabase db execute scripts/013_add_bb_tips_table.sql
supabase db execute scripts/014_add_onboarding_and_credits.sql
supabase db execute scripts/015_add_referral_rpc.sql
```

## Verification

After running all migrations, verify:

### Check Tables Exist

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

### Check RLS Policies

1. Click on any table
2. Go to **Policies** tab
3. Should see policies like:
   - "Users can view their own data"
   - "Users can insert their own data"
   - "Users can update their own data"
   - "Users can delete their own data"

### Test with a Query

Run this in SQL Editor to verify everything works:

```sql
-- Should return true for all tables
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_exists,
EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_watchlists'
) as watchlists_exists,
EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'bb_tips'
) as bb_tips_exists;
```

## Troubleshooting

### "Relation already exists"

**Cause**: Migration already run or partial migration

**Solution**: 
- Skip to next migration
- Or drop and recreate (⚠️ data loss!)

### "Permission denied"

**Cause**: Insufficient permissions

**Solution**:
- Ensure you're the project owner
- Run migrations as service role
- Check Supabase project permissions

### Migration fails midway

**Cause**: Syntax error or dependency issue

**Solutions**:
1. Read error message carefully
2. Fix the specific line mentioned
3. Re-run from beginning or from failed script
4. Check for missing dependencies

### "Table not found" after migration

**Cause**: Migration didn't complete or wrong schema

**Solution**:
1. Check SQL Editor history for errors
2. Verify you're in correct project
3. Re-run the specific migration
4. Check **public** schema (not auth or storage)

## Rolling Back

⚠️ **Warning**: Rolling back can cause data loss!

To undo a migration:

1. Create a backup first:
   ```sql
   -- Export data
   COPY table_name TO '/tmp/backup.csv' CSV HEADER;
   ```

2. Drop the created objects:
   ```sql
   DROP TABLE IF EXISTS table_name CASCADE;
   DROP FUNCTION IF EXISTS function_name CASCADE;
   ```

3. Restore from backup if needed

## Alternative Migration Files

The `scripts/` folder contains other migration files:

- `000_MASTER_SETUP.sql` - Legacy comprehensive setup
- `FINAL_PRODUCTION_MIGRATION.sql` - Alternative all-in-one migration
- `FINAL_PRODUCTION_MIGRATION_SAFE.sql` - Safer version with checks

**Recommendation**: Use the numbered sequence (PRE_LAUNCH → LAUNCH_READY → 013 → 014 → 015) as it's the most tested and reliable.

## After Migration

Once migrations are complete:

1. **Test Authentication**:
   - Sign up a test user
   - Check if profile is auto-created
   - Verify login works

2. **Test Database Access**:
   - Add coin to watchlist
   - Check if it appears in `user_watchlists` table
   - Verify you can only see your own data

3. **Configure Email**:
   - Set up email templates
   - Test signup confirmation flow
   - Verify password reset works

4. **Set Up Stripe** (if using payments):
   - Configure webhooks
   - Test subscription flow
   - Verify `user_subscriptions` table updates

## Need Help?

- 📖 [Database Setup Guide](./DATABASE_SETUP.md) - Detailed setup
- 🐛 [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- 💬 [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues) - Get support

---

**Quick Command Reference**:

```bash
# Check Supabase status
supabase status

# View migration history
supabase migration list

# Create new migration
supabase migration new your_migration_name

# Reset database (⚠️ destroys all data)
supabase db reset
```
