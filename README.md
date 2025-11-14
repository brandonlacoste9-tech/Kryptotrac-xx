# KryptoTrac

A professional crypto portfolio tracker with real-time prices, P&L analytics, and email alerts.

## Features

### Core Features
- **Portfolio Tracking**: Track unlimited crypto holdings with real-time prices from CoinGecko
- **Profit & Loss**: Automatic P&L calculations showing realized and unrealized gains
- **Watchlist**: Monitor favorite cryptocurrencies without adding to portfolio
- **Price Alerts**: Set email notifications when prices cross thresholds
- **Market Overview**: View top cryptocurrencies with 24h price changes and sparkline charts
- **PWA Support**: Installable as a progressive web app on mobile and desktop

### Pro Features
- **Unlimited Alerts**: Free tier limited to 5 alerts, Pro gets unlimited
- **Advanced Analytics**: Portfolio allocation charts, performance tracking, and trends
- **Ad-Free Experience**: No affiliate banners or sponsored content
- **Priority Support**: Direct email support for Pro members

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Auth**: Supabase Auth with email/password
- **Payments**: Stripe Checkout & Subscriptions
- **Email**: Resend API for transactional emails
- **Crypto Data**: CoinGecko API (free tier)
- **Scheduling**: Upstash QStash for cron jobs

## Getting Started

### Prerequisites

- Node.js 18+
- Vercel account (for deployment)
- Supabase project
- Stripe account
- Resend account (for emails)

### Environment Variables

Create a `.env.local` file:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Installation

1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd kryptotrac
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Run database migrations
- Execute the SQL scripts in the `scripts/` folder in your Supabase SQL editor
- Start with `001_create_portfolio_tables.sql`

4. Start development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Setup Stripe Webhooks

1. Get your webhook signing secret from Stripe dashboard
2. Add to environment variables as `STRIPE_WEBHOOK_SECRET`
3. Configure webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Setup QStash Cron

1. Go to [Upstash Console](https://console.upstash.com/qstash)
2. Create scheduled job:
   - URL: `https://your-domain.vercel.app/api/cron/check-alerts`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Method: GET
   - Add Authorization header

## Architecture

### Database Schema

- `users` - User accounts (managed by Supabase Auth)
- `portfolios` - User portfolio holdings
- `watchlists` - Coins on user watchlist
- `alerts` - Price alert configurations
- `subscriptions` - Stripe subscription status

### API Routes

- `/api/cron/check-alerts` - Scheduled job to check and send price alerts
- `/api/webhooks/stripe` - Stripe webhook handler for subscriptions
- `/api/auth/welcome` - Send welcome email to new users
- `/api/test-email` - Test email delivery
- `/api/crypto/*` - Proxy routes for CoinGecko API

### Email Templates

- **Price Alert Email**: Sent when price thresholds are crossed
- **Welcome Email**: Sent on signup
- Dark theme with red/black branding

## Development

### Project Structure

\`\`\`
app/
├── (auth)/ - Authentication pages
├── api/ - API routes
├── portfolio/ - Portfolio page
├── market/ - Market overview page
├── alerts/ - Alerts management
├── pricing/ - Pricing page
├── settings/ - User settings
└── upgrade/ - Pro upgrade flow

components/
├── portfolio/ - Portfolio components
├── market/ - Market components
├── alerts/ - Alert components
├── layout/ - Header, footer
├── ui/ - Reusable UI components
└── settings/ - Settings components

lib/
├── supabase/ - Supabase client/server
├── coingecko.ts - CoinGecko API wrapper
├── email.ts - Email sending functions
├── stripe.ts - Stripe utilities
└── products.ts - Product/pricing config

scripts/
└── *.sql - Database migrations
\`\`\`

### Adding New Features

1. Read existing code patterns
2. Follow the component structure
3. Use TypeScript for type safety
4. Keep API calls server-side when possible
5. Test email flows with the test endpoint

## Support

For issues or questions, contact support or open an issue on GitHub.

## License

Proprietary - All rights reserved
\`\`\`
