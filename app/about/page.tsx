import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, TrendingUp, Zap, Globe, Lock, DollarSign, Users, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About KryptoTrac - Your Privacy-First Crypto Portfolio Tracker',
  description: 'Learn about KryptoTrac, how we keep your data private, and why we built a crypto tracker for privacy-conscious investors worldwide with BB, the AI that speaks 100+ languages.'
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
            About KryptoTrac
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A privacy-first crypto portfolio tracker with AI assistant BB who speaks 100+ languages. Built for investors worldwide who value transparency and control.
          </p>
        </div>

        {/* Why We Built This */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Why KryptoTrac?</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              We built KryptoTrac because existing crypto trackers either sell your data, bombard you with ads, 
              or make it impossible to understand your actual portfolio performance. We wanted a tool that respects 
              privacy, speaks your language (literally - BB supports 100+ languages!), provides real insights, and 
              helps you make informed decisions without the noise.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <Lock className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                Your portfolio data stays in your account. We never sell, share, or use your data for anything 
                other than providing you the service.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">Accurate Data</h3>
              <p className="text-sm text-muted-foreground">
                Powered by CoinGecko and CoinMarketCap APIs, we provide real-time prices and market data 
                you can trust.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Built with Next.js 16 and hosted on Vercel, KryptoTrac loads instantly and updates prices 
                in real-time.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Multi-currency support (USD, EUR, CAD, GBP) and BB speaks 100+ languages to serve investors worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Is my data safe?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes. Your portfolio data is stored securely in Supabase with row-level security enabled. 
                Only you can access your data. We use industry-standard encryption and never store API keys 
                or private keys from exchanges.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                How do you make money?
              </h3>
              <p className="text-sm text-muted-foreground">
                We earn through affiliate partnerships with trusted exchanges like Kraken and Coinbase. 
                When you sign up using our referral links, we may earn a small commission at no extra cost 
                to you. We also offer a Pro tier with advanced analytics and unlimited alerts. All affiliate 
                relationships are clearly disclosed.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Where does price data come from?
              </h3>
              <p className="text-sm text-muted-foreground">
                We use CoinGecko and CoinMarketCap APIs for real-time cryptocurrency prices and market data. 
                These are trusted, widely-used sources in the crypto industry.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Is this financial advice?
              </h3>
              <p className="text-sm text-muted-foreground">
                No. KryptoTrac is a portfolio tracking tool, not financial advice. We provide data and insights 
                to help you track your investments, but all investment decisions are yours. Always do your own 
                research (DYOR) and consult with a licensed financial advisor for personalized advice.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What's the difference between Free and Pro?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Free tier includes unlimited watchlist, basic portfolio tracking, and 3 price alerts. 
                Pro tier ($9.99/month) unlocks:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Unlimited price alerts</li>
                <li>Advanced analytics (Sharpe ratio, volatility, diversification score)</li>
                <li>AI-powered portfolio insights</li>
                <li>Historical performance tracking</li>
                <li>PDF export with charts</li>
                <li>Daily digest emails</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Open Source & Transparent</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              KryptoTrac is open source. You can review our code, contribute improvements, or even self-host 
              your own instance on GitHub.
            </p>
            <Link 
              href="https://github.com/brandonlacoste9-tech/Kryptotrac-xx" 
              target="_blank"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Track Your Portfolio?</h2>
          <p className="text-muted-foreground mb-6">
            Join investors worldwide tracking their crypto portfolios with KryptoTrac and BB.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Get Started Free
          </Link>
        </section>
      </div>
    </div>
  )
}
