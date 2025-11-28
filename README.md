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
