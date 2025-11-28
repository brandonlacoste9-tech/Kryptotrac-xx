# Fix Login Issue - Simple Steps

## Problem
Users cannot log in because Supabase requires email confirmation by default, but the confirmation emails may not be working properly.

## Solution (Choose ONE)

### Option 1: Disable Email Confirmation (Fastest - 2 minutes)

This is the **recommended quick fix** to get login working immediately:

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **Kryptotrac**
3. In the left sidebar, click **Authentication** → **Providers**
4. Scroll down to **Email** section
5. Find the toggle for **"Confirm email"**
6. **Turn it OFF** (disable it)
7. Click **Save**

**Result:** New signups and existing users can now log in immediately without needing to confirm their email.

**Important:** This reduces security slightly. Re-enable it later once you fix email delivery.

---

### Option 2: Use Magic Link (No Password Needed)

A magic-link login page has been added to your app:

**URL:** `https://your-domain.com/auth/magic-link`

**How it works:**
- User enters their email
- They receive a one-click login link via email
- Click the link → instant sign-in (no password needed)

**To use:**
- Go to the login page
- Click **"Sign in with Magic Link"**
- Enter your email
- Check your inbox for the login link

---

## Testing After Fix

After disabling email confirmation (Option 1):

1. Go to your signup page: `https://your-domain.com/auth/signup`
2. Create a new account with your email
3. You should be able to log in immediately without checking email

If magic link (Option 2):

1. Go to: `https://your-domain.com/auth/magic-link`
2. Enter your email: `brandonlacoste9@gmail.com`
3. Check your email for the magic link
4. Click the link to sign in

---

## Current Status

✅ Database migration complete (profiles table exists)
✅ Magic-link Edge Function deployed and working
✅ Your existing account ready: `brandonlacoste9@gmail.com`
⚠️ Email confirmation currently blocking login

**Next Step:** Choose Option 1 or Option 2 above and follow the steps.

---

## If You Still Can't Log In

If after disabling email confirmation you still see errors:

1. Check the browser console for error messages (F12 → Console tab)
2. Try the magic-link option instead
3. Verify your Supabase project URL is correct in environment variables
4. Contact me with the exact error message you see
