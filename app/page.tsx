import { createServerClient } from "@/lib/supabase/server"
import { PortfolioContainer } from "@/components/portfolio/portfolio-container"
import { MarketOverview } from "@/components/market/market-overview"
import { AffiliateBanner } from "@/components/affiliates/affiliate-banner"
import { WatchlistSection } from "@/components/watchlist/watchlist-section"
import { HeroWithFire } from "@/components/hero/hero-with-fire"
import { Testimonials } from "@/components/landing/testimonials"
import { TrustBanner } from "@/components/trust/trust-banner"
import { GlobalNotice } from "@/components/canadian/canadian-notice"

export default async function HomePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If logged in, show portfolio as home
  if (user) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <WatchlistSection />
        <PortfolioContainer />
        <AffiliateBanner />
      </div>
    )
  }

  // If not logged in, show market overview
  return (
    <div className="container mx-auto p-6 space-y-8">
      <HeroWithFire />

      <TrustBanner />

      <MarketOverview />

      <Testimonials />

      <GlobalNotice />

      <AffiliateBanner />
    </div>
  )
}
