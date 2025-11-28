# Getting Started with KryptoTrac

Welcome! This guide will help you set up and run KryptoTrac on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm** (recommended)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/brandonlacoste9-tech/Kryptotrac-xx.git
cd Kryptotrac-xx
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm (recommended):
```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Stripe Configuration (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Optional
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

**Where to get these keys:**
- **Supabase**: Sign up at [supabase.com](https://supabase.com) and create a project
- **Stripe**: Sign up at [stripe.com](https://stripe.com) and get test keys from the dashboard

### 4. Run the Development Server

```bash
npm run dev
```

Or with pnpm:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

## Next Steps

### Set Up the Database

KryptoTrac requires database tables to be set up in Supabase. See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

**Quick version:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run the migration scripts in this order:
   - `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
   - `scripts/LAUNCH_READY_MIGRATION.sql`
   - `scripts/013_add_bb_tips_table.sql`
   - `scripts/014_add_onboarding_and_credits.sql`
   - `scripts/015_add_referral_rpc.sql`

### Configure Authentication

By default, Supabase requires email confirmation. For development:

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Toggle OFF "Confirm email" for easier testing
3. Remember to turn it back ON before going to production!

### Test the Application

1. **Sign up**: Go to `/auth/signup` and create an account
2. **Log in**: Use your credentials at `/auth/login`
3. **Dashboard**: You should be redirected to `/dashboard`
4. **BB Assistant**: Click the hexagon button (bottom-right) to chat with BB

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Common Issues

### "Auth user not found"
**Solution**: Run the database migration scripts (see Database Setup above)

### "Cannot find module"
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```

### Login doesn't work
**Solution**: Check if email confirmation is enabled in Supabase. For development, disable it (see Configure Authentication above).

### API Rate Limits
**Solution**: The app includes fallback data for CoinGecko API. Rate limit errors are expected on the free tier.

## Need More Help?

- 📖 [Full Documentation](./README.md)
- 🐛 [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 💬 [Open an Issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)

## What's Next?

Once you have the app running:

1. Explore the dashboard and add some cryptocurrencies to your watchlist
2. Try chatting with BB, the AI assistant
3. Check out the pricing page to see subscription tiers
4. Read the [Project Handoff Summary](./PROJECT_HANDOFF_SUMMARY.md) to understand the full feature set

Happy tracking! 🚀
