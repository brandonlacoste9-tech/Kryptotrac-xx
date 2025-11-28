# Google OAuth Setup Guide for KryptoTrac

This guide walks you through setting up Google OAuth authentication for KryptoTrac.

## Why Google OAuth?

Google OAuth provides:
- **Faster signup/login** - Users can authenticate with one click
- **Better security** - No password to remember or manage
- **Higher conversion** - Reduces friction in the signup process
- **Trusted authentication** - Users trust Google's authentication

## Prerequisites

- Supabase project (already set up)
- Google Cloud Console access
- Admin access to your Supabase dashboard

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "KryptoTrac" or similar
   - Click "Create"

3. Enable Google+ API:
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"

2. Choose User Type:
   - Select "External" (for public access)
   - Click "Create"

3. Fill in App Information:
   ```
   App name: KryptoTrac
   User support email: [your-support-email@domain.com]
   App logo: [upload your logo - optional]
   Application home page: https://your-domain.com
   Application privacy policy: https://your-domain.com/privacy
   Application terms of service: https://your-domain.com/terms
   ```

4. Authorized domains:
   ```
   your-domain.com
   vercel.app (if using Vercel preview URLs)
   ```

5. Developer contact information:
   - Add your email address

6. Click "Save and Continue"

7. Scopes (Step 2):
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Update" then "Save and Continue"

8. Test Users (Step 3):
   - Add your email for testing (if app is in testing mode)
   - Click "Save and Continue"

9. Summary (Step 4):
   - Review and click "Back to Dashboard"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"

2. Click "Create Credentials" → "OAuth client ID"

3. Configure OAuth Client:
   - Application type: **Web application**
   - Name: `KryptoTrac Web Client`

4. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-domain.com
   https://your-preview-url.vercel.app
   ```

5. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   https://your-preview-url.vercel.app/auth/callback
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   ```

6. Click "Create"

7. **Save your credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Keep these secure!

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)

2. Select your KryptoTrac project

3. Navigate to "Authentication" → "Providers"

4. Find "Google" in the provider list

5. Enable Google Provider:
   - Toggle "Enable Sign in with Google" to ON
   - Paste your **Client ID** from Step 3
   - Paste your **Client Secret** from Step 3

6. Configure Site URL:
   - Go to "Authentication" → "URL Configuration"
   - Set Site URL: `https://your-domain.com`

7. Add Redirect URLs:
   - Add these to the allowed redirect URLs:
     ```
     http://localhost:3000/**
     https://your-domain.com/**
     https://*.vercel.app/**
     ```

8. Click "Save"

## Step 5: Test Google OAuth

### Local Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000/auth/login

3. Click "Continue with Google"

4. You should see Google's OAuth consent screen

5. Select your Google account

6. Grant permissions

7. You should be redirected to `/dashboard`

### Production Testing

1. Deploy to your production environment (Vercel)

2. Visit https://your-domain.com/auth/login

3. Test Google OAuth flow

4. Verify user is created in Supabase → Authentication → Users

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution:**
1. Check the error message for the actual redirect URI being used
2. Add that exact URI to "Authorized redirect URIs" in Google Cloud Console
3. Remember to include the Supabase callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured.

**Solution:**
1. Go back to OAuth consent screen in Google Cloud Console
2. Ensure all required fields are filled
3. Verify authorized domains are correct
4. If in testing mode, ensure your email is added as a test user

### Error: "Invalid OAuth client"

**Problem:** Client ID or Client Secret is incorrect.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Copy the Client ID and Secret again
4. Update them in Supabase Authentication → Providers → Google
5. Click Save

### Users not being created in database

**Problem:** Profile trigger might not be working.

**Solution:**
1. Check that the `on_auth_user_created` trigger exists in Supabase
2. Run this SQL in Supabase SQL Editor:
   ```sql
   SELECT * FROM profiles WHERE id = 'USER_ID_FROM_AUTH_USERS';
   ```
3. If no profile exists, manually run the profile creation migration

### OAuth works but user can't access dashboard

**Problem:** Row Level Security (RLS) policies might not allow OAuth users.

**Solution:**
1. Check RLS policies in Supabase
2. Verify policies use `auth.uid()` not just email-based checks
3. Test with this SQL:
   ```sql
   SELECT * FROM profiles WHERE id = auth.uid();
   ```

## Security Best Practices

1. **Never commit credentials** - Client ID and Secret should only be in Supabase dashboard
2. **Use environment-specific credentials** - Different credentials for dev/staging/production
3. **Regularly rotate secrets** - Update Client Secret periodically
4. **Monitor OAuth logs** - Check Supabase auth logs for suspicious activity
5. **Limit scopes** - Only request email and profile information
6. **HTTPS only in production** - Never use OAuth over HTTP in production

## Moving to Production

When ready to publish your app:

1. **Verify OAuth consent screen:**
   - Go to Google Cloud Console → OAuth consent screen
   - Click "Publish App"
   - Submit for verification if needed (required for >100 users)

2. **Update all URLs:**
   - Remove localhost URLs from Google Cloud Console
   - Update Supabase redirect URLs to production only
   - Verify all environment variables in Vercel

3. **Test thoroughly:**
   - Test signup flow
   - Test login flow
   - Verify profile creation
   - Check referral code handling (if applicable)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Support

If you encounter issues not covered here:
1. Check Supabase auth logs: Dashboard → Authentication → Logs
2. Check browser console for errors
3. Check Network tab for failed API calls
4. Review Google Cloud Console audit logs

---

**Last Updated:** 2025-11-28  
**Maintained by:** KryptoTrac Development Team
