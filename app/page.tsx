import { HeroWithFire } from "@/components/hero/hero-with-fire"
import { Testimonials } from "@/components/landing/testimonials"
import { Shield, Zap, Globe, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section with Fire Effect */}
      <HeroWithFire />

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose KryptoTrac?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for crypto investors worldwide with powerful features and unbeatable pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100+ Languages</h3>
              <p className="text-gray-400">BB speaks your language. Get crypto insights in over 100 languages with our AI assistant.</p>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-400">Track 20,000+ cryptocurrencies with live price updates and proactive alerts.</p>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-400">Your data stays yours. No selling information to third parties, ever.</p>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-400">Advanced portfolio analytics and insights to help you make better investment decisions.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Teaser Section */}
      <section className="py-20 px-4 border-t border-white/10 bg-gradient-to-b from-black to-red-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg">
              From free forever to unlimited everything. Choose what works for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-gray-400 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>5 BB queries/day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>3 watchlist coins</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Basic price alerts</span>
                </li>
              </ul>
              <a
                href="/auth/signup"
                className="block w-full text-center py-2 px-4 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
              >
                Get Started
              </a>
            </Card>

            <Card className="p-6 bg-gradient-to-b from-red-600/20 to-orange-600/20 backdrop-blur-xl border-2 border-red-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>50 BB queries/day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Unlimited watchlist</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Council mode (3 AI advisors)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Priority BB tips</span>
                </li>
              </ul>
              <a
                href="/pricing"
                className="block w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all font-semibold"
              >
                Upgrade to Pro
              </a>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-2xl font-bold mb-2">Elite</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-gray-400 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited BB queries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All Pro features</span>
                </li>
              </ul>
              <a
                href="/pricing"
                className="block w-full text-center py-2 px-4 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
              >
                Go Elite
              </a>
            </Card>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>All plans include 2 months free on yearly billing</p>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">20,000+</div>
              <div className="text-gray-400">Cryptocurrencies Tracked</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Globe className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-gray-400">Languages Supported</div>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">$9</div>
              <div className="text-gray-400">vs $29-49 Competitors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 border-t border-white/10 bg-gradient-to-b from-red-950/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Track Smarter?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join crypto investors worldwide who trust KryptoTrac for real-time tracking and AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all font-semibold text-lg shadow-lg shadow-red-500/50"
            >
              Start Free Today
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-medium text-lg"
            >
              View Pricing
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>
    </main>
  )
}
