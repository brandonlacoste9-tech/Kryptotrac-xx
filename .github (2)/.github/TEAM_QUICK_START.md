# New Team Member Quick Start

## Welcome to KryptoTrac!

You're joining at the final 5% of development. Here's how to get productive in 30 minutes:

### 1. Get Access (5 minutes)
- [ ] GitHub repo access
- [ ] Supabase project access
- [ ] Stripe dashboard access (test mode)
- [ ] Vercel deployment access

### 2. Local Setup (10 minutes)
\`\`\`bash
# Clone repo
git clone [repo-url]
cd kryptotrac

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Supabase and Stripe keys from team
\`\`\`

### 3. Run Database Migrations (10 minutes)
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run these scripts IN ORDER:
   - `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
   - `scripts/LAUNCH_READY_MIGRATION.sql`
   - `scripts/013_add_bb_tips_table.sql`
   - `scripts/014_add_onboarding_and_credits.sql`
   - `scripts/015_add_referral_rpc.sql`

### 4. Test Locally (5 minutes)
\`\`\`bash
npm run dev
# Open http://localhost:3000
# Sign up → log in → click hive button → talk to BB
\`\`\`

### 5. Read These Files
- `PROJECT_HANDOFF_SUMMARY.md` (this file) - Complete overview
- `BB_INTEGRATION_COMPLETE.md` - BB persona details
- `MONDAY_LAUNCH_TEST_PLAN.md` - Testing checklist

## Your First Tasks

### If You're Frontend/Design
- Polish mobile responsiveness
- Test haptic feedback on real devices
- Improve animations and micro-interactions

### If You're Backend/API
- Fix CoinGecko rate limiting issue
- Implement BB Tips scheduler (cron job)
- Set up webhook monitoring

### If You're QA/Testing
- Run through `MONDAY_LAUNCH_TEST_PLAN.md`
- Test on iOS, Android, Chrome, Safari
- Document bugs in GitHub Issues

### If You're Marketing/Growth
- Prepare Product Hunt launch
- Write social media announcement posts
- Create demo video showing BB in action

## Questions?
Check `PROJECT_HANDOFF_SUMMARY.md` for detailed answers.

**Most Important**: Run the database migrations first. Nothing works without them!
