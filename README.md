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

### Installation

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
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run end-to-end tests

# Code Quality
pnpm lint             # Run ESLint
\`\`\`

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
