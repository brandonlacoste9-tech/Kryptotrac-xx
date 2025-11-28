# Troubleshooting Guide

Common issues and their solutions for KryptoTrac.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Build Issues](#build-issues)
- [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Cannot install dependencies

**Error**: `npm install` hangs or fails

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete lock file and try again:
   ```bash
   rm package-lock.json
   npm install
   ```

3. Try using a different package manager:
   ```bash
   # Install pnpm
   npm install -g pnpm
   
   # Install dependencies
   pnpm install
   ```

4. Check Node.js version (requires v18+):
   ```bash
   node --version
   ```

### Module not found errors

**Error**: `Cannot find module 'X'`

**Solutions**:
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check if the module is in `package.json`
3. Install the specific missing module:
   ```bash
   npm install <module-name>
   ```

---

## Authentication Issues

### "Email not confirmed" when trying to log in

**Cause**: Supabase has email confirmation enabled by default

**Solutions**:

**Option 1: Disable email confirmation (Development)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers** → **Email**
4. Toggle OFF "Confirm email"
5. Click **Save**

**Option 2: Confirm the email**
1. Check your email inbox (and spam folder)
2. Click the confirmation link
3. Try logging in again

**Option 3: Manually confirm user**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user
3. Click "..." → "Confirm email"

### "Auth user not found" or "User does not exist"

**Cause**: User exists in auth.users but not in profiles table

**Solution**:
1. Run the database migrations (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
2. Manually create profile:
   ```sql
   INSERT INTO profiles (id, email, full_name, tier)
   SELECT id, email, raw_user_meta_data->>'full_name', 'free'
   FROM auth.users
   WHERE id = 'your-user-id';
   ```

### "Invalid redirect URL"

**Cause**: Redirect URL not in Supabase allowlist

**Solution**:
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these URLs:
   - `http://localhost:3000/**`
   - `https://your-domain.com/**`
3. Click **Save**

### Session expires immediately

**Cause**: Cookie configuration or environment variable issues

**Solutions**:
1. Check `.env.local` has correct Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

2. Clear browser cookies and try again
3. Restart the dev server after changing `.env.local`

---

## Database Issues

### Tables don't exist

**Cause**: Migration scripts not run

**Solution**: Follow [DATABASE_SETUP.md](./DATABASE_SETUP.md) and run all 5 migration scripts in order.

### "Permission denied for table X"

**Cause**: Row Level Security (RLS) policies not configured

**Solution**:
1. Run `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
2. Verify RLS policies in Supabase:
   - Go to **Table Editor** → select table → **Policies** tab
   - Should see policies like "Users can view their own data"

### Data not saving to database

**Cause**: RLS policy blocking the operation

**Solutions**:
1. Check if user is authenticated
2. Verify RLS policies allow the operation
3. Check browser console for specific error
4. Test with service role key (temporarily) to bypass RLS:
   ```typescript
   // Only for debugging!
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // Has full access
   )
   ```

---

## API Issues

### CoinGecko rate limit errors

**Error**: "Rate limit exceeded" or 429 errors in console

**Cause**: CoinGecko free tier has low limits (10-30 calls/minute)

**Solutions**:
1. **Normal behavior** - The app includes fallback data, so users won't see errors
2. The error logs are expected on free tier
3. To eliminate errors:
   - Upgrade to [CoinGecko Pro](https://www.coingecko.com/en/api/pricing) ($129/mo)
   - Or implement aggressive caching (5+ minute cache)

### Stripe webhook not working

**Error**: Payments succeed but subscription doesn't activate

**Solutions**:
1. Check Stripe webhook configuration:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Verify endpoint URL is correct
   - Check "Signing secret" matches `.env.local`

2. Test webhook locally:
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # In another terminal
   stripe trigger checkout.session.completed
   ```

3. Check webhook logs in Stripe Dashboard for errors

### API route returns 404

**Cause**: Route file not in correct location or syntax error

**Solutions**:
1. API routes must be in `app/api/[route-name]/route.ts`
2. Must export named functions: `GET`, `POST`, etc.
3. Check for TypeScript errors: `npm run build`

---

## Build Issues

### Type errors during build

**Error**: TypeScript compilation errors

**Solutions**:
1. Run type checking:
   ```bash
   npm run build
   ```

2. Fix reported errors or add type assertions:
   ```typescript
   const value = data as SomeType;
   ```

3. If blocked, temporarily skip type checking (NOT recommended):
   ```javascript
   // next.config.mjs
   const nextConfig = {
     typescript: {
       ignoreBuildErrors: true // Only for debugging!
     }
   }
   ```

### "Module not found" during build

**Solutions**:
1. Ensure all imports have correct paths
2. Check for case-sensitive file names
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

### Build succeeds but app crashes at runtime

**Cause**: Environment variables not set in production

**Solutions**:
1. Verify all required env vars are set in deployment platform
2. Check for `NEXT_PUBLIC_` prefix on client-side variables
3. Restart deployment after adding env vars

---

## Deployment Issues

### App works locally but not in production

**Causes & Solutions**:

1. **Environment variables**
   - Verify all env vars are set in Vercel/deployment platform
   - Check for typos in variable names
   - Ensure no trailing spaces in values

2. **Database connection**
   - Verify Supabase project is in production mode
   - Check RLS policies work with production URL
   - Ensure redirect URLs include production domain

3. **Build errors**
   - Check deployment logs for errors
   - Try building locally: `npm run build && npm start`
   - Fix any warnings that appear

### Vercel deployment fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify Node.js version in `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. Clear Vercel cache:
   - Go to Vercel Dashboard → Settings → General
   - Scroll to "Build & Development Settings"
   - Clear cache and redeploy

### Images not loading in production

**Cause**: Image optimization or external domain not configured

**Solution**: Add domains to `next.config.mjs`:
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com'
      }
    ]
  }
}
```

---

## Performance Issues

### App is slow on mobile

**Solutions**:
1. Check network tab for large assets
2. Optimize images (use WebP format)
3. Implement lazy loading for heavy components
4. Enable compression in `next.config.mjs`

### Database queries are slow

**Solutions**:
1. Add indexes to frequently queried columns
2. Use Supabase caching
3. Implement React Query or SWR for client-side caching
4. Paginate large result sets

---

## Development Issues

### Hot reload not working

**Solutions**:
1. Restart dev server: `npm run dev`
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. Check file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### ESLint errors

**Error**: `eslint .` command fails or shows errors

**Solutions**:
1. Install ESLint dependencies:
   ```bash
   npm install --save-dev eslint eslint-config-next
   ```

2. Ensure `.eslintrc.json` exists (should be in repo)

3. Fix auto-fixable issues:
   ```bash
   npm run lint -- --fix
   ```

---

## Still Stuck?

If none of these solutions work:

1. **Check the logs**: Look in browser console and terminal for specific errors
2. **Search issues**: Check [GitHub Issues](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues) for similar problems
3. **Ask for help**: Open a new issue with:
   - What you were trying to do
   - Error messages (full text)
   - Your environment (OS, Node version, etc.)
   - Steps to reproduce

## Useful Commands

```bash
# Check Node/npm versions
node --version
npm --version

# Clear all caches and reinstall
rm -rf node_modules .next package-lock.json
npm install

# Check for outdated packages
npm outdated

# Run diagnostics
npm run build
npm run lint
npm run test

# View environment variables (be careful not to leak secrets!)
env | grep NEXT_PUBLIC
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Project README](./README.md)
- [Getting Started Guide](./GETTING_STARTED.md)
