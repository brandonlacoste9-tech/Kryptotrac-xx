# KryptoTrac Production Launch Checklist

## Pre-Launch Critical Items

### 1. Supabase Configuration ⚠️ CRITICAL
- [ ] Add all redirect URLs to Supabase allowlist
  - Production domain: `https://kryptotrac.com/**`
  - Vercel preview: `https://*.vercel.app/**`
  - Development: `http://localhost:3000/**`
- [ ] Set Site URL to production domain
- [ ] Verify email templates are configured
- [ ] Test email delivery (check spam folder)
- [ ] Verify SMTP settings if using custom provider
- [ ] Check email confirmation is enabled
- [ ] Test signup flow end-to-end

### 2. Environment Variables
- [ ] All Supabase env vars set in Vercel
- [ ] Stripe keys configured (live keys for production)
- [ ] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL set
- [ ] No hardcoded secrets in code

### 3. Database
- [ ] Production migration script executed
- [ ] RLS policies enabled on all tables
- [ ] Test data cleared from production
- [ ] Backup strategy in place

### 4. Stripe Configuration
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Live mode API keys in production
- [ ] Test mode keys in staging
- [ ] Webhook signing secret configured
- [ ] Test checkout flow with live keys

### 5. UI/UX
- [ ] Custom cursor working on desktop (hidden on mobile)
- [ ] Chat widget opens/closes properly
- [ ] "Built with v0" link clickable and opens to https://v0.dev/chat/ref/BLNPBF
- [ ] All CTAs clickable
- [ ] Mobile responsive
- [ ] Dark mode fully implemented

### 6. Testing
- [ ] Signup → Email → Confirm → Login flow works
- [ ] Referral tracking works (?ref=CODE in URL)
- [ ] Payment flow completes
- [ ] Portfolio CRUD operations work
- [ ] Watchlist CRUD operations work
- [ ] Price alerts trigger properly
- [ ] ATLAS chat responds correctly

### 7. Performance
- [ ] CoinGecko rate limiting handled
- [ ] Loading states on all data fetches
- [ ] Error boundaries in place
- [ ] No console errors in production

### 8. Security
- [ ] RLS enabled on all user tables
- [ ] No sensitive data exposed client-side
- [ ] CORS configured properly
- [ ] CSP headers if needed
- [ ] Rate limiting on API routes

### 9. Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if desired)
- [ ] Uptime monitoring
- [ ] Database connection pool limits

### 10. Documentation
- [ ] README updated with deployment instructions
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide available

## Post-Launch

### Immediate
- [ ] Monitor error logs first 24 hours
- [ ] Watch for email delivery issues
- [ ] Check payment processing
- [ ] Verify CoinGecko API isn't rate limited

### First Week
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Bug fixes as needed
- [ ] Scale database if needed

### Ongoing
- [ ] Regular backups
- [ ] Security updates
- [ ] Feature improvements
- [ ] User support

## Known Issues

1. **Email Confirmation**: Supabase redirect URLs MUST be allowlisted
2. **Custom Cursor**: Only shows on desktop, hidden on touch devices
3. **CoinGecko Rate Limits**: Cached data prevents crashes
4. **Preview Environment**: Module resolution issues in v0 preview (works in production)

## Support Contacts

- Supabase Support: https://supabase.com/support
- Stripe Support: https://support.stripe.com
- v0 Support: https://vercel.com/help

## Deployment Commands

\`\`\`bash
# Push to GitHub (triggers Vercel deployment)
git add .
git commit -m "Production ready"
git push origin main

# Verify deployment
# Check Vercel dashboard for build status
# Test live site at production URL
