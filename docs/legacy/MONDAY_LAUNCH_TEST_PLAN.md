# KryptoTrac Monday Launch - Final Test Plan

## Pre-Launch Status: 95% Complete ✅

### What's Already Working
- Landing page with live crypto prices
- Hero with fire animation
- Trust signals and testimonials
- Exchange affiliate links
- All UI components built and styled
- BB persona integrated
- ATLAS assistant ready
- Stripe integration configured

---

## CRITICAL PATH (Must Complete Before Monday)

### Step 1: Fix Database Security (10 minutes)

**Run this in Supabase SQL Editor:**

1. Open Supabase Dashboard → SQL Editor
2. Paste `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
3. Click "Run"
4. Verify output shows:
   - ✅ DROP FUNCTION successful
   - ✅ CREATE OR REPLACE FUNCTION successful
   - ✅ ALTER TABLE ENABLE ROW LEVEL SECURITY successful
   - ✅ CREATE POLICY successful (3 policies)
   - ✅ CREATE INDEX successful (multiple indexes)

**Expected Result:** Supabase dashboard issues drop from 15 → near-zero

---

### Step 2: Run Main Migration (5 minutes)

**After security fix completes:**

1. Open Supabase SQL Editor (new tab)
2. Paste `scripts/LAUNCH_READY_MIGRATION.sql`
3. Click "Run"
4. Verify output shows:
   - ✅ CREATE TABLE profiles
   - ✅ CREATE TABLE user_referrals
   - ✅ CREATE TABLE atlas_memory
   - ✅ CREATE TABLE rate_limits
   - ✅ CREATE TABLE subscription_events
   - ✅ CREATE FUNCTION handle_new_user()
   - ✅ CREATE TRIGGER on_auth_user_created

**Expected Result:** Database has 10+ tables with full RLS protection

---

### Step 3: Test Auth Flow (5 minutes)

**Critical Test Sequence:**

1. **Open Landing Page**
   - URL: `https://your-app.vercel.app`
   - ✅ Hero loads with fire animation
   - ✅ Live crypto prices showing
   - ✅ Trust badges visible
   - ✅ Testimonials rendering

2. **Click "Get Started"**
   - Should redirect to `/auth/signup`
   - ✅ Signup form loads
   - ✅ No console errors

3. **Create Test Account**
   - Email: `test@kryptotrac.com`
   - Password: `TestPass123!`
   - Click "Sign Up"
   - ✅ No errors
   - ✅ Redirects to dashboard

4. **Verify Profile Created**
   - Open Supabase Dashboard → Table Editor → profiles
   - ✅ New row exists with correct user_id
   - ✅ tier = 'free'
   - ✅ created_at timestamp present

5. **Sign Out and Sign In**
   - Click user menu → Sign Out
   - Click "Sign In" from landing page
   - Enter: `test@kryptotrac.com` / `TestPass123!`
   - ✅ Successfully logs in
   - ✅ Redirects to dashboard

---

### Step 4: Test Core Features (10 minutes)

**Watchlist:**
- ✅ Click "Add Coin" from dashboard
- ✅ Search for "Bitcoin"
- ✅ Add to watchlist
- ✅ Bitcoin appears in watchlist cards
- ✅ Price updates in real-time (wait 30 seconds)

**BB Persona:**
- ✅ Click floating bee button (bottom-right)
- ✅ ATLAS modal opens
- ✅ Type: "BB you there bro?"
- ✅ BB responds with signature tone
- ✅ Response ends with "I got you"

**Referral System:**
- ✅ Navigate to `/referrals`
- ✅ See your unique referral code
- ✅ Copy referral link works
- ✅ Shows $0 earnings (no referrals yet)

**Pricing Page:**
- ✅ Navigate to `/pricing`
- ✅ All tiers display (Free, Starter, Pro, Elite)
- ✅ Monthly/Yearly toggle works
- ✅ "Get Started" buttons present

---

### Step 5: Test Mobile Experience (5 minutes)

**Chrome DevTools Mobile Simulator:**
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"

**Test:**
- ✅ Landing page is responsive
- ✅ Crypto cards stack vertically
- ✅ CTAs are finger-friendly (48px min)
- ✅ Navigation menu works
- ✅ Sign up form is usable
- ✅ Dashboard layout adapts

---

## NICE-TO-HAVE (Can Test After Launch)

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Edge Cases
- [ ] Invalid email format rejected
- [ ] Weak password rejected
- [ ] Duplicate email shows error
- [ ] Rate limiting works (50 req/hour for free)
- [ ] Stripe test mode checkout works

### Analytics
- [ ] Console logs show `[BB TEST]` tags
- [ ] No console errors on any page
- [ ] Supabase logs show successful auth events

---

## Launch Day Checklist

**Sunday Night:**
- [ ] Run both SQL migration scripts
- [ ] Complete Steps 1-5 above
- [ ] Take screenshots of working features
- [ ] Prepare launch tweets/posts

**Monday Morning:**
1. [ ] Final smoke test (auth + watchlist + BB)
2. [ ] Deploy to production (Vercel)
3. [ ] Post to Product Hunt
4. [ ] Share on Twitter/X with #KryptoTrac
5. [ ] Post in crypto subreddits (r/CryptoCurrency)
6. [ ] Share on LinkedIn
7. [ ] Email personal network
8. [ ] Monitor Supabase logs for errors
9. [ ] Watch Stripe dashboard for signups

---

## Emergency Rollback Plan

**If Critical Bug Found:**
1. Revert deployment in Vercel (instant)
2. Fix bug in v0
3. Re-test locally
4. Re-deploy

**If Database Issues:**
1. Check Supabase logs for error details
2. Verify RLS policies are active
3. Test queries in SQL Editor manually
4. Create hotfix migration if needed

---

## Success Metrics (First Week)

**Target Goals:**
- 100+ signups
- 10+ Pro conversions ($10/mo tier)
- 50+ BB conversations
- 20+ referral link shares
- 0 critical bugs reported

**Stretch Goals:**
- Featured on Product Hunt top 10
- 500+ signups
- $500 MRR (50 Pro users)
- 100+ Twitter mentions with #KryptoTrac

---

## Contact

**If Issues During Testing:**
- Check Supabase logs first
- Check browser console for errors
- Check v0 chat history for migration scripts
- DM developer team on Discord

**You Got This! 🚀**
