# Supabase Dashboard Settings Checklist

## Authentication Settings to Check

Open your Supabase Dashboard and verify these settings:

### 1. Email Confirmation
**Path:** Authentication → Providers → Email

- [ ] **Confirm email** toggle is **OFF** (disabled)
- [ ] **Save** button clicked after change

### 2. Site URL (Important for redirects)
**Path:** Authentication → URL Configuration

- [ ] **Site URL** is set to your production domain: `https://your-production-url.vercel.app`
- [ ] For local development, add: `http://localhost:3000`

### 3. Redirect URLs (Allow List)
**Path:** Authentication → URL Configuration → Redirect URLs

Add these URLs to the allow list:
- [ ] `https://your-production-url.vercel.app/**`
- [ ] `http://localhost:3000/**`
- [ ] `https://preview-welcome-to-vercel-*.vercel.app/**` (for v0 preview)

### 4. Email Provider (Optional - if magic links not working)
**Path:** Settings → Authentication → SMTP Settings

If magic links aren't being delivered:
- [ ] Check if SMTP is configured (or using Supabase's default)
- [ ] Test email delivery from the Dashboard
- [ ] Check spam folder for confirmation emails

### 5. Database Tables (Already Done)
**Path:** Database → Tables

Verify these tables exist:
- [x] `profiles` (with your user data)
- [x] `auth.users` (Supabase managed)
- [x] `user_portfolios`
- [x] `user_watchlists`
- [x] `price_alerts`

---

## Quick Test

After making changes above:

1. Log out of any existing sessions
2. Go to your app's signup page
3. Create a test account
4. You should be able to sign in immediately

---

## Your Current Setup

**Email:** brandonlacoste9@gmail.com
**User ID:** bbf4db86-2a24-4982-882d-6818e891ef65
**Profile Status:** ✅ Created
**Referral Code:** 14E90B94
**Onboarding:** Not completed (will trigger BB welcome on first dashboard visit)

---

## Need Help?

If you're stuck on any step, let me know which section and I'll provide screenshots or more detailed guidance.
