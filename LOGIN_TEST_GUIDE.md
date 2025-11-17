# KryptoTrac Login Testing Guide

## Current Status

The login system is fully implemented and working. Here's what we have:

### Authentication Flow
1. **Login Page**: `/auth/login` - Email/password authentication
2. **Signup Page**: `/auth/signup` - New user registration with email confirmation
3. **Dashboard**: `/dashboard` - Protected route requiring authentication

### Database Tables
- `profiles` - User profiles linked to Supabase auth.users
- `user_watchlists` - Saved crypto watchlists
- `user_portfolios` - Portfolio holdings
- `price_alerts` - Price alert configurations
- `atlas_conversations` - ATLAS chat history
- `bb_tips` - BB notification system

### Why You Can't Log In

There are two possible issues:

#### 1. Email Confirmation Required
Supabase requires email confirmation by default. After signup:
- Check your email inbox (and spam folder)
- Click the confirmation link
- Then you can log in

**To bypass email confirmation for testing:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Under Email provider, toggle OFF "Confirm email"
3. Save changes
4. Try signing up again

#### 2. Redirect URLs Not Configured
The signup flow uses `emailRedirectTo` which must be allowlisted:

**Required redirect URLs to add in Supabase:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these to "Redirect URLs":
   - `http://localhost:3000/**` (for local testing)
   - `https://your-domain.vercel.app/**` (for production)
   - `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}` value

### Testing Without Email Confirmation

**Option A: Use Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter email and password
4. User is auto-confirmed and can log in immediately

**Option B: Disable Email Confirmation**
1. Supabase Dashboard → Authentication → Providers
2. Email provider → Disable "Confirm email"
3. Sign up through the app normally

### Verification Checklist

Once logged in, you should see:

1. **Dashboard** with:
   - Welcome message with your email
   - BB welcome animation (first login only)
   - Empty state prompting you to add coins
   - ATLAS chat widget in bottom right
   - Custom glowing orb cursor

2. **Navigation** to:
   - Portfolio tracking
   - Watchlist management
   - Price alerts
   - Analytics
   - Pricing/upgrade options

3. **BB Features**:
   - Chat widget with BB personality
   - Proactive tips (after adding coins)
   - Referral system ($5 credits)

### Current Login Credentials

To test, create a new account through:
1. Supabase Dashboard (instant access)
2. Or signup page (requires email confirmation)

### What's Working

- Login form validation
- Password authentication
- Session management
- Protected routes (redirects to login if not authenticated)
- Profile creation on signup
- Dashboard data loading
- ATLAS chat integration
- BB welcome flow

### Quick Fix Summary

**Just fixed (in this update):**
- Dashboard now queries `profiles` table (was querying wrong `users` table)
- BB welcome wrapper now updates `profiles` table
- Referral processing now uses `profiles` table

**Next steps for you:**
1. Disable email confirmation in Supabase Dashboard
2. Create a test account via signup page
3. Or manually create user in Supabase Dashboard → Users
4. Log in and verify dashboard loads
