# KryptoTrac Deployment Checklist

## Critical: Database Setup Required

The app is currently missing database tables. You need to run the SQL scripts in order:

1. Navigate to your Supabase project SQL editor
2. Run scripts in this order:
   - `scripts/001_create_portfolio_tables.sql`
   - `scripts/002_add_export_history.sql`
   - `scripts/003_add_portfolio_history.sql`
   - `scripts/004_add_portfolio_insights.sql`
   - `scripts/005_add_digest_preferences.sql`
   - `scripts/006_complete_schema_migration.sql`
   - `scripts/007_add_referral_system.sql`
   - `scripts/008_add_profile_auto_creation_trigger.sql`

## Why Login/Referrals Don't Work Yet

**Login Issue:**
- Supabase auth is configured correctly
- Middleware is in place
- The issue is likely email confirmation settings in Supabase

**Referral Link Issue:**
- The `/ref/[code]` route exists
- But `user_referrals` table doesn't exist yet (script not run)
- Once you run script 007, referrals will work

## Post-Database Setup

After running all scripts, the following will work:
- User signup and login
- Watchlist persistence
- Portfolio tracking with holdings
- Price alerts
- Referral system with tracking
- AI insights storage
- Email digest preferences
- Export history

## Supabase Auth Configuration

Make sure in your Supabase Dashboard:
1. **Authentication > Settings > Email Auth**
   - Enable "Confirm email" (recommended for production)
   - OR disable it for testing (users can login immediately)

2. **Authentication > URL Configuration**
   - Site URL: Your production domain
   - Redirect URLs: Add your domain + `/auth/callback`

## Environment Variables (Already Set)

All required environment variables are configured:
- SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_URL  
- SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Testing Auth Flow

1. Go to `/auth/signup`
2. Enter email and password
3. Check email for confirmation link
4. Click link to confirm
5. Go to `/auth/login`
6. Login with credentials
7. Should redirect to `/dashboard`

## Phase 5: Deploy Readiness

All requirements for deployment:

- ✅ Supabase environment variables configured
- ✅ Auth middleware in place
- ✅ 404 page created
- ✅ Loading skeletons added
- ✅ Pro monetization tags implemented
- ✅ Profile auto-creation trigger ready (run script 008)

### Final Steps Before Deploy:

1. **Run all SQL scripts** in Supabase SQL Editor (001-008)
2. **Test signup** → creates profile automatically
3. **Test login** → redirects to dashboard
4. **Test Pro features** → show lock icons
5. **Build locally**: `pnpm build` to check for errors
6. **Deploy to Vercel**
