# Frequently Asked Questions (FAQ)

Common questions about KryptoTrac setup, usage, and troubleshooting.

## General Questions

### What is KryptoTrac?

KryptoTrac is a cryptocurrency portfolio tracker with BB, an AI assistant that speaks 100+ languages. It helps you track your crypto holdings, get real-time price updates, and receive intelligent insights about your investments.

### Is KryptoTrac free?

Yes! KryptoTrac has a free tier that includes:
- Portfolio and watchlist tracking
- 5 BB AI queries per day
- Real-time price updates
- Basic alerts

Premium tiers (Pro $9/mo, Elite $19/mo) unlock more features like unlimited AI queries, advanced analytics, and Council Mode.

### What makes KryptoTrac different?

1. **BB AI Assistant**: The only crypto assistant that speaks 100+ languages with emotional intelligence
2. **Global Focus**: Built for the 5 billion global crypto users, not just English speakers
3. **Affordable**: Starting at $9/mo vs $29-49 competitors
4. **Bee-Themed UX**: Unique honeycomb design that's memorable and engaging

## Setup & Installation

### How do I get started?

See our [Getting Started Guide](./GETTING_STARTED.md) for a complete walkthrough. Quick version:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (`.env.local`)
4. Run migrations in Supabase
5. Start dev server: `npm run dev`

### What do I need to run KryptoTrac?

**Required:**
- Node.js 18+
- Supabase account (free tier works)

**Optional:**
- Stripe account (only if you want payments)
- CoinGecko Pro API key (improves rate limits)

### Where do I get API keys?

- **Supabase**: [supabase.com](https://supabase.com) → Create project → Settings → API
- **Stripe**: [stripe.com](https://stripe.com) → Dashboard → Developers → API keys
- **CoinGecko**: Free tier needs no key, Pro tier: [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)

### Can I use this in production?

Yes! KryptoTrac is production-ready. Follow our [Deployment Guide](./DEPLOYMENT.md) to deploy to Vercel or another platform.

## Authentication Issues

### Why can't I log in after signing up?

**Most common cause**: Email confirmation is enabled in Supabase.

**Solution**:
1. Check your email (and spam folder) for confirmation link
2. Click the link to verify your email
3. Try logging in again

**For development**: Disable email confirmation in Supabase Dashboard → Authentication → Providers → Email → Toggle OFF "Confirm email"

### I get "Auth user not found" error

**Cause**: Database migrations not run properly.

**Solution**: 
1. Go to [DATABASE_SETUP.md](./DATABASE_SETUP.md)
2. Run all 5 migration scripts in order
3. Verify tables exist in Supabase Table Editor

### "Invalid redirect URL" error

**Cause**: Your domain not in Supabase allowlist.

**Solution**:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add: `http://localhost:3000/**` (dev) and `https://your-domain.com/**` (prod)

### Session expires immediately

**Solutions**:
1. Verify `.env.local` has correct Supabase keys
2. Clear browser cookies
3. Restart dev server after changing env vars

## Database Questions

### Which migration scripts should I run?

Run these 5 scripts in order:
1. `PRE_LAUNCH_SECURITY_FIX.sql`
2. `LAUNCH_READY_MIGRATION.sql`
3. `013_add_bb_tips_table.sql`
4. `014_add_onboarding_and_credits.sql`
5. `015_add_referral_rpc.sql`

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

### Can I skip migration scripts?

No, run them all in order. Each depends on the previous ones.

### How do I verify migrations worked?

Go to Supabase → Table Editor. You should see these tables:
- profiles
- user_portfolios
- user_watchlists
- price_alerts
- atlas_conversations
- atlas_rate_limits
- bb_tips
- referrals
- user_subscriptions
- subscription_events

### What if migration fails?

1. Read the error message in SQL Editor
2. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Fix the issue and re-run
4. Or skip to next migration if it's safe

## Features & Usage

### How do I chat with BB?

1. Log in to your account
2. Click the hexagon button (bottom-right corner)
3. Type your question in any language
4. BB will respond with "I got you 👀"

### What can BB do?

BB can:
- Explain crypto concepts in simple terms
- Analyze market sentiment
- Provide trading insights (Alpha Mode)
- Give technical analysis
- Translate crypto news
- Watch your portfolio for opportunities

### How do I switch BB personas?

In the chat interface:
1. Click the persona selector
2. Choose:
   - **BB**: Friendly, casual style
   - **Satoshi**: Technical, visionary insights
   - **Expert**: Professional analysis
   - **Council Mode**: Get 3 perspectives (Pro/Elite only)

### How many questions can I ask BB?

Depends on your tier:
- **Free**: 5 queries per day
- **Pro**: 50 queries per day
- **Elite**: Unlimited queries

### How do I add coins to my watchlist?

1. Go to Dashboard
2. Click "Add to Watchlist"
3. Search for cryptocurrency
4. Click "Add"

### Can I track multiple portfolios?

Yes! Create separate portfolios for:
- Different exchanges
- Different strategies
- Personal vs. business holdings

### How do price alerts work?

1. Add coin to watchlist
2. Click "Set Alert"
3. Choose:
   - Price above X
   - Price below X
   - Percentage change
4. Get notified when triggered

## API & Rate Limits

### Why am I seeing CoinGecko errors?

**Cause**: Free tier has low limits (10-30 calls/minute).

**Impact**: None for users - app has fallback data. You'll just see errors in logs.

**Solutions**:
- Use it as is (recommended for development)
- Upgrade to CoinGecko Pro ($129/mo)
- Implement aggressive caching

### Do I need a CoinGecko API key?

**No** - Free tier works without a key. You'll hit rate limits faster, but the app handles it gracefully with fallback data.

### How do I upgrade CoinGecko API?

1. Visit [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
2. Subscribe to Pro ($129/mo)
3. Copy API key
4. Add to `.env.local`: `COINGECKO_API_KEY=xxx`
5. No code changes needed

## Payments & Subscriptions

### How do I enable payments?

1. Create Stripe account
2. Get API keys (use test keys for dev)
3. Add to `.env.local`
4. Configure webhook endpoint
5. Test with Stripe test cards

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

### What are Stripe test cards?

For testing payments:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Auth required**: `4000 0025 0000 3155`

Use any future date and any 3-digit CVC.

### How does the referral system work?

1. Generate your referral code in Dashboard
2. Share link: `https://your-app.com?ref=YOUR_CODE`
3. Friend signs up using your link
4. You both get $5 credit
5. Credits can be used for subscriptions

### Can users pay with crypto?

Not yet, but it's on the roadmap! Currently Stripe supports:
- Credit/debit cards
- Apple Pay
- Google Pay
- Bank transfers (select countries)

## Development

### Which package manager should I use?

**Recommended**: npm (comes with Node.js)

**Also works**: pnpm (mentioned in docs, faster)

**Not tested**: yarn

### Can I use TypeScript?

Yes! The entire project is built with TypeScript. All files use `.ts` or `.tsx` extensions.

### How do I add a new feature?

1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test: `npm run build && npm run test`
4. Lint: `npm run lint`
5. Open Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### How do I run tests?

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:e2e          # E2E tests only
npm run test:integration  # Integration tests only
```

### Where are the tests?

```
tests/
├── e2e/              # End-to-end tests
└── integration/      # API integration tests
```

## Deployment

### Where can I deploy KryptoTrac?

**Recommended**: [Vercel](https://vercel.com) (easiest, built by Next.js team)

**Also works**:
- Netlify
- Railway
- AWS / DigitalOcean / Any VPS
- Docker containers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific guides.

### How much does hosting cost?

**Vercel**: Free tier includes:
- 100GB bandwidth
- Unlimited requests
- Automatic SSL

**Supabase**: Free tier includes:
- 500MB database
- 50K monthly active users
- 2GB file storage

Enough for development and small deployments!

### Do I need a custom domain?

No, you get free subdomains:
- **Vercel**: `your-app.vercel.app`
- **Netlify**: `your-app.netlify.app`

But custom domains are recommended for production.

### How do I set up SSL?

**Vercel/Netlify**: Automatic, no setup needed!

**Self-hosted**: Use Let's Encrypt (free):
```bash
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Build fails with TypeScript errors

**Solution**:
1. Run: `npm run build`
2. Fix reported type errors
3. Or temporarily skip: Set `ignoreBuildErrors: true` in `next.config.mjs` (not recommended)

### "Cannot find module" errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### App works locally but not in production

**Check**:
1. Environment variables set in deployment platform
2. Database migrations run on production DB
3. Redirect URLs include production domain
4. No build errors in deployment logs

### Hot reload not working

**Solutions**:
1. Restart dev server
2. Clear Next.js cache: `rm -rf .next`
3. Check file watcher limits (Linux)

## Performance

### App is slow

**Check**:
1. Network tab for large assets
2. Optimize images (use WebP)
3. Enable caching
4. Add database indexes
5. Use React Query for client caching

### Database queries are slow

**Solutions**:
1. Add indexes: `CREATE INDEX idx_name ON table(column)`
2. Use Supabase caching
3. Paginate large results
4. Optimize RLS policies

## Security

### Is my data safe?

Yes! KryptoTrac uses:
- Supabase Row Level Security (RLS)
- Encrypted connections (SSL)
- Secure authentication (JWT tokens)
- Server-side API key storage
- Stripe PCI compliance

### Should I use test or live Stripe keys?

**Development**: Test keys (`pk_test_xxx` and `sk_test_xxx`)
**Production**: Live keys (`pk_live_xxx` and `sk_live_xxx`)

**Never** commit keys to git!

### How do I report a security issue?

**Do NOT** open a public issue. Instead:
1. Email: [security contact email]
2. Or use GitHub Security Advisories
3. Include: Description, steps to reproduce, impact

## Still Have Questions?

- 📖 **Read the Docs**: [README.md](./README.md)
- 🚀 **Setup Guide**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- 🐛 **Common Issues**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 💬 **Ask the Community**: [GitHub Discussions](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions)
- 🐞 **Report a Bug**: [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)

---

**Can't find what you're looking for?** [Open a discussion](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions) and we'll add it to this FAQ!
