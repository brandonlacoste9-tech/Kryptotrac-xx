# KryptoTrac 🚀

> The only crypto assistant that speaks YOUR language

KryptoTrac is a modern, AI-powered cryptocurrency portfolio tracker that helps investors worldwide manage their crypto assets with ease. With support for 100+ languages and real-time tracking of 20,000+ cryptocurrencies, KryptoTrac makes crypto investing accessible to everyone.

## ✨ Key Features

### Core Functionality
- **Real-time Tracking** - Monitor 20,000+ cryptocurrencies with live price updates
- **Portfolio Management** - Track your holdings, gains, and losses in one place
- **Price Alerts** - Get notified when your coins hit target prices
- **Multi-Currency Support** - View prices in USD, EUR, CAD, GBP, and more
- **Easy Authentication** - Sign in with Google, email/password, or magic link

### BB - Your AI Crypto Assistant
- **100+ Languages** - Chat with BB in your native language
- **Multiple Personas** - Choose from BB, Satoshi mode, and more
- **Proactive Tips** - BB watches your watchlist and alerts you to opportunities
- **Council Mode** (Pro) - Get perspectives from 3 different AI advisors

### Premium Features
- **Advanced Analytics** - Portfolio performance charts and insights
- **Referral System** - Earn up to $200/month by sharing KryptoTrac
- **Tax Export** - Export transaction history for tax reporting
- **Privacy First** - Your data stays yours, never sold to third parties

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom components
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **Authentication:** Supabase Auth
- **Payments:** [Stripe](https://stripe.com/)
- **AI:** Google Gemini API
- **Data:** CoinGecko API for crypto prices
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Supabase](https://supabase.com/) account
- [Stripe](https://stripe.com/) account (for payments)
# KryptoTrac 🐝

**The crypto portfolio tracker that speaks YOUR language** — featuring BB, the world's first multilingual AI crypto assistant with emotional intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ Features

### 🔥 Core Features
- **Real-Time Tracking**: Monitor 20,000+ cryptocurrencies with live prices from CoinGecko
- **Smart Portfolio Management**: Track your holdings, transactions, and performance
- **Custom Watchlists**: Save your favorite coins with live updates
- **Price Alerts**: Get notified when crypto hits your target prices
- **Multi-Currency Support**: USD, EUR, GBP, CAD, and more

### 🤖 BB - Your AI Crypto Assistant
- **100+ Languages**: Chat with BB in any language
- **Emotional Intelligence**: BB understands market fear, greed, and your anxiety
- **Multiple Personas**: Switch between BB, Satoshi, and Expert modes
- **Proactive Tips**: BB watches your watchlist and alerts you to opportunities
- **Council Mode**: Get perspectives from 3 different AI advisors (Pro/Elite)

### 🎨 Unique Bee-Themed UX
- **Honeycomb Design**: Beautiful hexagonal patterns throughout
- **Bee Cursor**: Custom animated cursor (desktop only)
- **Hive Chat**: Floating hexagon button for BB assistant
- **Haptic Feedback**: Mobile vibration patterns for engagement

### 💎 Premium Tiers
- **Free**: 5 BB queries/day, 3 watchlist coins
- **Pro ($9/mo)**: 50 queries/day, unlimited watchlist, Council Mode
- **Elite ($19/mo)**: Unlimited everything, advanced analytics, API access

### 🎁 Referral System
- Earn $5 credit for every friend who signs up
- Your friend also gets $5 credit
- Credits can be used for premium subscriptions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **pnpm** package manager
- **Supabase** account (free tier works)
- **Stripe** account (optional, for payments)

### Installation (5 minutes)

```bash
# Clone the repository
git clone https://github.com/brandonlacoste9-tech/Kryptotrac-xx.git
cd Kryptotrac-xx

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app! 🎉

**📖 For detailed setup instructions, see [GETTING_STARTED.md](./GETTING_STARTED.md)**

## 📚 Documentation

### Getting Started
- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete setup walkthrough
- **[Quick Reference](./QUICK_REFERENCE.md)** - Essential commands and tips
- **[FAQ](./FAQ.md)** - Frequently asked questions

### Configuration
- **[Database Setup](./DATABASE_SETUP.md)** - Supabase configuration and migrations
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Database migration reference
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms

### Security
- **[RSC Security](./docs/RSC_SECURITY.md)** - React Server Components security and data tainting
- **[Chart Security](./components/ui/CHART_SECURITY.md)** - ChartStyle component security documentation

### Help & Support
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project

### Additional Resources
- **[Legacy Documentation](./docs/legacy/)** - Historical development docs
- **[Project Handoff](./docs/legacy/PROJECT_HANDOFF_SUMMARY.md)** - Technical deep dive

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) with App Router |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | Supabase Auth with Row Level Security |
| **Payments** | [Stripe](https://stripe.com/) Checkout & Subscriptions |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) |
| **API** | [CoinGecko](https://www.coingecko.com/en/api) Crypto Data |
| **Deployment** | [Vercel](https://vercel.com/) (recommended) |

## 📁 Project Structure

```
Kryptotrac-xx/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── atlas/            # BB AI assistant endpoints
│   │   └── webhooks/         # Stripe webhooks
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main app dashboard
│   ├── atlas/                # BB chat interface
│   └── pricing/              # Subscription plans
├── components/               # React components
│   ├── atlas/                # BB-related components
│   ├── watchlist/            # Portfolio tracking UI
│   └── ui/                   # Reusable UI components
├── lib/                      # Utility functions
│   ├── supabase/             # Database clients
│   ├── coingecko.ts          # Crypto API wrapper
│   └── bb-tips.ts            # Proactive notifications
├── scripts/                  # Database migrations
└── config/                   # App configuration
```

## 🧪 Available Scripts

1. Clone the repository:
\`\`\`bash
git clone https://github.com/brandonlacoste9-tech/Kryptotrac-xx.git
cd Kryptotrac-xx
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your credentials (see [Environment Variables](#environment-variables) below)

4. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Required environment variables (see `.env.example` for full list):

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Application
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Note: Google OAuth credentials are configured directly in Supabase Dashboard
# No additional environment variables needed for Google authentication
\`\`\`

### Database Setup

1. Run the database migration scripts in order in your Supabase SQL Editor:
   - `scripts/PRE_LAUNCH_SECURITY_FIX.sql`
   - `scripts/LAUNCH_READY_MIGRATION.sql`
   - `scripts/013_add_bb_tips_table.sql`
   - `scripts/014_add_onboarding_and_credits.sql`
   - `scripts/015_add_referral_rpc.sql`

2. Verify all tables and RLS policies are created correctly

### Google OAuth Setup (Optional but Recommended)

To enable "Sign in with Google":

1. Follow the detailed guide: [Google OAuth Setup](./docs/GOOGLE_AUTH_SETUP.md)
2. Configure OAuth credentials in Google Cloud Console
3. Add credentials to Supabase Authentication → Providers → Google
4. Test the authentication flow

Google OAuth provides a better user experience with one-click authentication.

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── pricing/           # Pricing page
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── hero/             # Landing page hero
│   └── ...
├── lib/                   # Utility functions and libraries
│   ├── supabase/         # Supabase clients
│   ├── stripe.ts         # Stripe configuration
│   └── ...
├── scripts/              # Database migration scripts
├── public/               # Static assets
├── docs/                 # Documentation
│   └── development/      # Development guides
└── tests/                # Test files
\`\`\`

## 🧪 Available Scripts

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run Jest unit/integration tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run Jest E2E tests
npm run test:playwright  # Run Playwright E2E browser tests
npm run test:playwright:ui # Run Playwright tests in UI mode
npm run test:playwright:headed # Run Playwright tests with browser visible

# Code Quality
npm run lint             # Run ESLint
\`\`\`

## 🧪 Testing

KryptoTrac uses a comprehensive testing strategy:

### Unit & Integration Tests (Jest)
- **Location**: `tests/unit/` and `tests/integration/`
- **Run**: `npm test`
- **Coverage**: `npm run test:all`

### E2E Browser Tests (Playwright)
- **Location**: `tests/playwright/`
- **Run**: `npm run test:playwright`
- **Browsers**: Chromium, Firefox, WebKit
- **Features**:
  - Cross-browser testing
  - Mobile device emulation
  - Visual regression testing
  - Automatic screenshots/videos on failure

**First time setup**:
```bash
npx playwright install
```

For more details, see [tests/playwright/README.md](./tests/playwright/README.md)

## 💰 Pricing Tiers

- **Free**: 5 BB queries/day, 3 watchlist coins, basic alerts
- **Pro ($9/mo)**: 50 queries/day, unlimited watchlist, council mode
- **Elite ($19/mo)**: Unlimited everything, advanced analytics, API access

All plans include 2 months free on yearly billing.

## 🔒 Security

- All API keys and secrets use environment variables
- Row Level Security (RLS) enabled on all database tables
- Stripe webhook signature verification
- Authentication required on protected routes
- No sensitive data exposed to client-side

See [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) for detailed security audit.

## 📚 Documentation

- [Development Guides](./docs/development/) - Internal development documentation
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md) - Security audit findings
- [Environment Setup](./.env.example) - Environment variables template

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

© 2025 KryptoTrac. All rights reserved.

## 🆘 Support

For support, please open an issue or contact the development team.

---

Built with ❤️ using [v0](https://v0.dev)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## ⚙️ Environment Variables

Required environment variables (see `.env.example` for full list):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe (optional, for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 🐛 Known Issues

### CoinGecko Rate Limits
The free tier has low rate limits (10-30 calls/minute). The app includes fallback data, so users won't experience errors, but you may see rate limit warnings in logs.

**Solutions:**
- Upgrade to CoinGecko Pro ($129/mo) for 500 calls/min
- The free tier works fine for development and small deployments

### Email Confirmation
Supabase requires email confirmation by default. For development:
1. Go to Supabase Dashboard → Authentication → Providers → Email
2. Disable "Confirm email"
3. Re-enable before production launch

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more common issues.

## 🚀 Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brandonlacoste9-tech/Kryptotrac-xx)

Or follow the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please:

1. Read our [Code of Conduct](./CODE_OF_CONDUCT.md)
2. Check [Contributing Guidelines](./CONTRIBUTING.md)
3. Fork the repository
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: See docs linked above
- 🐛 **Bug Reports**: [Open an issue](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
- 💬 **Questions**: [Discussions](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions)

## 🙏 Acknowledgments

- Built with [v0](https://v0.dev) by Vercel
- Crypto data powered by [CoinGecko](https://www.coingecko.com/)
- Payments by [Stripe](https://stripe.com/)
- Database by [Supabase](https://supabase.com/)

---

**Made with 🐝 by [brandonlacoste9-tech](https://github.com/brandonlacoste9-tech)**

© 2025 KryptoTrac. All rights reserved.
