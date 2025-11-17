# KryptoTrac Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database Migration (CRITICAL - DO THIS FIRST)
\`\`\`bash
# Open Supabase SQL Editor
# Copy and paste contents of scripts/FINAL_PRODUCTION_MIGRATION.sql
# Click "Run" button
# Verify all tables created successfully
\`\`\`

**Expected Result:**
- `profiles` table created with auto-trigger on auth.users insert
- `referrals`, `referral_codes` tables created
- `atlas_conversations`, `atlas_rate_limits`, `bb_tips` tables created
- All RLS policies applied
- All indexes created for performance

### 2. Environment Variables Verification
All required variables are already set in your Vercel project:
- ✅ Supabase (URL, Keys, Postgres connection strings)
- ✅ Stripe (Secret, Publishable keys)
- ✅ NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (for email redirects)

### 3. Build Configuration
Your `next.config.mjs` is production-ready:
- ✅ React strict mode enabled
- ✅ Image optimization configured
- ✅ No blocking build issues

## Deployment Steps

### Option 1: Vercel GitHub Integration (Recommended)
\`\`\`bash
# 1. Commit all changes
git add .
git commit -m "feat: Launch-ready KryptoTrac with auth, BB persona, portfolio tracking"
git push origin main

# 2. Vercel will auto-deploy
# Monitor at: https://vercel.com/[your-project]/deployments
\`\`\`

### Option 2: Vercel CLI
\`\`\`bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to production
vercel --prod

# 3. Follow prompts
\`\`\`

## Post-Deployment Verification

### Test Critical Flows (5 minutes)
1. **Auth Flow**
   - Visit `/auth/signup`
   - Create test account
   - Check email for confirmation link
   - Click confirmation link
   - Should redirect to `/dashboard`
   - BB welcome animation should appear

2. **Watchlist**
   - Search for "Bitcoin"
   - Add to watchlist
   - Verify it appears in watchlist grid
   - Verify 30-second price refresh works

3. **Portfolio**
   - Click "Add Holding"
   - Search for "Ethereum"
   - Enter quantity: 1, Price: 2000
   - Save
   - Verify holding appears with current price and P/L

4. **Alerts**
   - Go to `/alerts`
   - Create alert: Bitcoin above $100,000
   - Verify alert appears in list
   - Free users should be limited to 5 alerts

5. **Pricing/Upgrade**
   - Visit `/pricing`
   - Click "Go Pro" on Pro tier
   - Should redirect to Stripe checkout
   - Test card: 4242 4242 4242 4242
   - Complete checkout
   - Should redirect back to dashboard with Pro status

6. **BB Persona**
   - Click floating hexagon hive button (bottom-right)
   - Send message: "BB you there bro?"
   - Should respond in BB's friendly tone ending with "I got you"
   - Verify bee cursor appears on hover
   - Verify honeycomb background in chat

## Monitoring & Support

### Performance Monitoring
- Vercel Analytics: Automatic (already integrated)
- Speed Insights: Automatic (already integrated)
- Check dashboard: https://vercel.com/[your-project]/analytics

### Error Monitoring
- Check Vercel logs for server errors
- Monitor Supabase logs for database issues
- Watch for CoinGecko rate limit 429 errors (should be cached/handled)

### Database Monitoring
- Supabase dashboard: https://supabase.com/dashboard/project/[your-project]
- Check RLS policies are working (no unauthorized access)
- Monitor query performance

## Rollback Plan

If critical issues arise:
\`\`\`bash
# Revert to previous deployment
vercel rollback

# Or via Vercel dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "..." menu
# 4. Click "Promote to Production"
\`\`\`

## Known Issues & Workarounds

### CoinGecko Rate Limits
- **Issue**: Free API has strict rate limits (10-30 requests/min)
- **Mitigation**: 1-minute caching implemented
- **Fallback**: Static data for top 6 coins when rate limited
- **Long-term**: Upgrade to CoinGecko Pro ($129/mo for 500 calls/min)

### Email Confirmation Required
- **Issue**: Supabase requires email confirmation before login
- **Mitigation**: Clear messaging on signup success page
- **Workaround**: For testing, disable email confirmation in Supabase dashboard

### Middleware Edge Runtime
- **Issue**: Environment variables need NEXT_PUBLIC prefix in Edge Runtime
- **Mitigation**: Fallback logic already implemented in `lib/supabase/middleware.ts`

## Success Metrics

Day 1 Targets:
- ✅ Zero critical errors in Vercel logs
- ✅ Auth flow completion rate > 80%
- ✅ Average page load time < 2 seconds
- ✅ CoinGecko API success rate > 95%

Week 1 Targets:
- 🎯 100+ signups
- 🎯 10+ Pro subscriptions ($9/mo)
- 🎯 50+ active daily users
- 🎯 5+ referral conversions

## Launch Announcement

Post to:
- Twitter: Use content from `launch/social-media.md`
- Product Hunt: Use content from `launch/product-hunt.md`
- Reddit: r/CryptoCurrency, r/Bitcoin (use `launch/community-outreach.md`)
- Indie Hackers: Post in "Show IH"
- Discord/Telegram: Crypto communities

## Support Channels

- Email: support@kryptotrac.app (set up forwarding)
- Twitter: @kryptotrac (monitor mentions)
- In-app: Feedback button (bottom-right, next to BB hive)

---

🚀 **You're ready to launch!** Run the database migration, push to GitHub, and watch it deploy.
