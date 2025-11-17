# KryptoTrac Database Schema

Complete database schema for Phase 1: Infrastructure Lockdown

## Tables Overview

### Core Tables
1. **profiles** - User profile metadata and preferences
2. **user_watchlists** - User's saved coins for quick monitoring
3. **user_portfolios** - User's holdings with cost basis
4. **price_alerts** - Price threshold notifications
5. **subscriptions** (user_subscriptions) - Stripe subscription data

### Analytics & History Tables
6. **portfolio_snapshots** - Daily portfolio value snapshots
7. **insights_history** - AI-generated portfolio insights
8. **export_history** - User export tracking
9. **digest_preferences** - Email notification preferences

## Running Migrations

\`\`\`bash
# Run the complete schema migration
psql $DATABASE_URL -f scripts/006_complete_schema_migration.sql
\`\`\`

Or use the Supabase SQL editor to run the migration.

## RLS Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only access their own data
- System operations (cron jobs) can insert data as needed
- No cross-user data leakage

## Next Steps

After running this migration, you're ready for:
1. Watchlist persistence (Phase 1, Step 2)
2. Portfolio CRUD operations (Phase 1, Step 3)
3. Price alert engine (Phase 1, Step 4)
