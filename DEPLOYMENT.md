# Deployment Guide

This guide covers deploying KryptoTrac to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying to Other Platforms](#deploying-to-other-platforms)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Production Monitoring](#production-monitoring)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### ✅ Database Setup
- [ ] All migration scripts run in Supabase (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
- [ ] RLS policies enabled on all tables
- [ ] Email confirmation enabled in Supabase Auth
- [ ] Production redirect URLs added to Supabase allowlist

### ✅ Environment Variables
- [ ] All required env vars documented in `.env.example`
- [ ] Production Supabase keys ready
- [ ] Production Stripe keys ready (live mode, not test!)
- [ ] Webhook secrets configured

### ✅ Code Quality
- [ ] No ESLint errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] No console.log statements in production code

### ✅ Security
- [ ] No hardcoded secrets in code
- [ ] CORS configured properly
- [ ] Rate limiting on API routes
- [ ] Sensitive data not exposed client-side

### ✅ Testing
- [ ] Auth flow works end-to-end
- [ ] Payment flow completes successfully
- [ ] Database CRUD operations work
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing done

---

## Deploying to Vercel

Vercel is the recommended platform for Next.js apps (made by the same team).

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select **"Kryptotrac-xx"**

### Step 2: Configure Project

1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Node Version**: 18.x or higher

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Stripe (Production - LIVE KEYS!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret

# Optional
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-domain.vercel.app
```

⚠️ **IMPORTANT**: Use **LIVE** Stripe keys for production, not test keys!

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Note your deployment URL: `https://kryptotrac-xx.vercel.app`

### Step 5: Add Custom Domain (Optional)

1. Go to Project Settings → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `kryptotrac.com`
4. Follow DNS configuration instructions
5. Wait for SSL certificate to provision (5-30 minutes)

---

## Deploying to Other Platforms

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

Note: Next.js on Netlify requires the [Next.js Runtime](https://www.netlify.com/with/nextjs/).

### Railway

1. Create new project from GitHub repo
2. Select Node.js environment
3. Add environment variables
4. Deploy automatically on push

### Self-Hosted (VPS/AWS/DigitalOcean)

#### Requirements
- Node.js 18+
- PM2 or similar process manager
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

#### Setup

1. **Clone and build**:
   ```bash
   git clone https://github.com/brandonlacoste9-tech/Kryptotrac-xx.git
   cd Kryptotrac-xx
   npm install
   npm run build
   ```

2. **Set environment variables**:
   ```bash
   nano .env.local
   # Add all production environment variables
   ```

3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "kryptotrac" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name kryptotrac.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL with Certbot**:
   ```bash
   sudo certbot --nginx -d kryptotrac.com
   ```

---

## Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **URL Configuration**
3. Add production URLs:
   - `https://your-domain.com/**`
   - `https://your-domain.vercel.app/**`
4. Set Site URL to: `https://your-domain.com`

### 2. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_new_webhook_secret
   ```
7. Redeploy to apply new env var

### 3. Test Production Environment

#### Test Authentication
1. Go to `https://your-domain.com/auth/signup`
2. Create account with real email
3. Check email and confirm (if enabled)
4. Log in at `/auth/login`
5. Verify redirect to `/dashboard`

#### Test Payment Flow
1. Click "Upgrade to Pro"
2. Use a real test card (Stripe provides test cards):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
3. Complete checkout
4. Verify subscription appears in dashboard
5. Check Stripe Dashboard for payment confirmation

#### Test Webhook
1. Trigger a test webhook from Stripe Dashboard
2. Check Vercel logs for webhook receipt
3. Verify subscription status updates in database

### 4. Enable Email Templates

1. Go to Supabase → **Authentication** → **Email Templates**
2. Customize templates:
   - **Confirm signup**: Welcome message with brand colors
   - **Reset password**: Password reset instructions
   - **Magic link**: Login link for passwordless auth
3. Test each template by signing up with a real email

---

## Production Monitoring

### Vercel Analytics

1. Go to Project → **Analytics**
2. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Performance scores

### Supabase Logs

1. Go to Supabase → **Logs**
2. Monitor:
   - Database queries
   - Auth events
   - API requests
   - Errors

### Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Monitor:
   - Payments
   - Subscriptions
   - Failed charges
   - Webhook deliveries

### Set Up Alerts

#### Vercel
- Set up deployment notifications in Settings
- Configure Slack/Discord webhooks for build failures

#### Supabase
- Enable email alerts for:
  - High database CPU
  - Connection pool exhaustion
  - Failed auth attempts

#### Stripe
- Enable email notifications for:
  - Failed payments
  - Disputed charges
  - Webhook failures

### Error Tracking (Optional)

Consider integrating error tracking:

**Sentry**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**LogRocket**:
```bash
npm install logrocket
# Add to app/layout.tsx
```

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- **Response times** > 1 second
- **Database CPU** > 80%
- **API rate limits** frequently hit
- **User complaints** about slowness

### Supabase Scaling

1. Go to Supabase → **Settings** → **Billing**
2. Upgrade to Pro ($25/mo) for:
   - 8GB database
   - 100K monthly active users
   - Better support

### Database Optimization

1. Add indexes to frequently queried columns:
   ```sql
   CREATE INDEX idx_user_watchlists_user_id ON user_watchlists(user_id);
   CREATE INDEX idx_portfolios_user_id ON user_portfolios(user_id);
   ```

2. Use database connection pooling
3. Implement caching (Redis, Vercel Edge Cache)

### CDN for Static Assets

1. Use Vercel's built-in CDN (automatic)
2. Or use Cloudflare for additional caching
3. Optimize images with next/image

---

## Rollback Procedure

If deployment fails or has critical bugs:

### Vercel Rollback

1. Go to Project → **Deployments**
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

### Database Rollback

⚠️ **Careful!** Database rollbacks can cause data loss.

1. Go to Supabase → **Settings** → **Database**
2. Create a backup before any migration
3. Use Point-in-Time Recovery if needed

### Emergency Maintenance Mode

If you need to take the app offline:

1. Create `app/maintenance/page.tsx`:
   ```typescript
   export default function Maintenance() {
     return <div>Under maintenance. Back soon!</div>
   }
   ```

2. Update `middleware.ts` to redirect all traffic
3. Deploy immediately

---

## Checklist: Go-Live

Before announcing to users:

- [ ] All tests pass
- [ ] Production database migrated
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Email templates customized
- [ ] Stripe webhooks configured and tested
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Custom domain configured (if applicable)
- [ ] Backup strategy in place
- [ ] Monitoring alerts set up
- [ ] Terms of Service and Privacy Policy pages added
- [ ] Support email/contact form working

---

## Next Steps

✅ Deployment complete!

Now:
1. Monitor logs for the first 24 hours
2. Watch for user feedback
3. Fix critical bugs immediately
4. Plan feature rollouts
5. Set up regular backups
6. Review analytics weekly

## Need Help?

- 📖 [Getting Started Guide](./GETTING_STARTED.md)
- 🐛 [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
