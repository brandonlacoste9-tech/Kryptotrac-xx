# Supabase Email Configuration Setup

## Issue
Users cannot sign up - confirmation emails are not being sent or the redirect URLs are being blocked.

## Root Causes
1. Redirect URLs not allowlisted in Supabase
2. Email confirmation settings may need adjustment
3. Email template configuration

## Required Actions in Supabase Dashboard

### Step 1: Add Redirect URLs
Go to: **Authentication → URL Configuration**

Add these URLs to the "Redirect URLs" allowlist:

**For Development:**
\`\`\`
http://localhost:3000/dashboard
http://localhost:3000
https://preview-welcome-to-vercel-*.vercel.app/dashboard
https://preview-welcome-to-vercel-*.vercel.app
\`\`\`

**For Production:**
\`\`\`
https://kryptotrac.vercel.app/dashboard
https://kryptotrac.vercel.app
https://kryptotrac.com/dashboard
https://kryptotrac.com
\`\`\`

You can use wildcards:
\`\`\`
https://*.vercel.app/**
\`\`\`

### Step 2: Configure Site URL
Go to: **Authentication → URL Configuration**

Set the Site URL to:
- Development: `http://localhost:3000`
- Production: `https://kryptotrac.vercel.app` or your custom domain

### Step 3: Email Templates (Optional but Recommended)
Go to: **Authentication → Email Templates**

Customize the "Confirm signup" template:

**Subject:** Welcome to KryptoTrac - Confirm Your Email

**Body:**
\`\`\`html
<h2>Welcome to KryptoTrac!</h2>
<p>Thanks for signing up. Click the link below to confirm your email and activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
<p>Happy tracking!<br>The KryptoTrac Team</p>
\`\`\`

### Step 4: Verify Email Settings
Go to: **Settings → Auth**

Check:
- ✅ Enable email confirmations (should be ON)
- ✅ Enable email change confirmations (should be ON)
- ⚙️ Confirm email: "If the user has signed up with an email"

### Step 5: SMTP Configuration (If emails not sending)
Go to: **Settings → Auth → SMTP Settings**

If using custom SMTP:
- Configure your SMTP provider (SendGrid, Mailgun, etc.)
- Test the connection

If using Supabase default:
- Should work out of the box for most cases
- May have rate limits on free tier

## Environment Variables Check

Verify these are set in Vercel:
\`\`\`
SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

## Testing the Fix

1. Go to your signup page: `/auth/signup`
2. Enter email and password
3. Check for success message: "Check your email"
4. Check your email inbox (and spam folder)
5. Click the confirmation link
6. Should redirect to `/dashboard` and be logged in

## Troubleshooting

### "Email not being sent"
- Check Supabase Auth logs: **Authentication → Logs**
- Verify SMTP settings
- Check spam folder
- Try with a different email provider

### "Invalid redirect URL"
- Verify URL is in the allowlist
- Check for typos in the URL
- Ensure protocol matches (http vs https)

### "Confirmation link doesn't work"
- Check if Site URL is set correctly
- Verify redirect URLs include the destination
- Ensure middleware is refreshing the session

### "User created but can't login"
- Email confirmation is required by default
- Check if user confirmed email in Supabase dashboard: **Authentication → Users**
- Look for "email_confirmed_at" timestamp

## Quick Fix: Disable Email Confirmation (Not Recommended for Production)

If you need to test quickly:

1. Go to **Settings → Auth**
2. Find "Enable email confirmations"
3. Toggle OFF
4. Users can login immediately without confirming email

⚠️ **Warning**: This reduces security. Only use for development/testing.

## Current Code Status

The signup code is correctly implemented with:
- ✅ Proper `emailRedirectTo` configuration
- ✅ Referral tracking
- ✅ Welcome email sending
- ✅ Error handling
- ✅ Success confirmation screen

The issue is purely Supabase dashboard configuration.
