import { redirect } from 'next/navigation'
import { createServerClient } from "@/lib/supabase/server"
import { DashboardKPIs } from "@/components/dashboard/dashboard-kpis"
import { WatchlistSection } from "@/components/watchlist/watchlist-section"
import { PortfolioSection } from "@/components/portfolio/portfolio-section"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard"
import { StreakTracker } from "@/components/gamification/streak-tracker"
import { RecommendedExchanges } from "@/components/affiliates/recommended-exchanges"
import { BBWelcomeWrapper } from "@/components/onboarding/bb-welcome-wrapper"

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  const showWelcome = !userData?.onboarding_completed

  const { data: watchlistItems } = await supabase
    .from('user_watchlists')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  const { data: portfolioItems } = await supabase
    .from('user_portfolios')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  const hasData = (watchlistItems && watchlistItems.length > 0) || (portfolioItems && portfolioItems.length > 0)

  if (!hasData) {
    return (
      <>
        {showWelcome && <BBWelcomeWrapper />}
        <EmptyDashboard user={user} />
      </>
    )
  }

  return (
    <>
      {showWelcome && <BBWelcomeWrapper />}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-balance">Welcome back, {user.email?.split('@')[0]}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your portfolio</p>
          </div>

          <div className="mb-6">
            <StreakTracker />
          </div>

          <DashboardKPIs userId={user.id} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <WatchlistSection />
              <PortfolioSection />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <ActivityFeed userId={user.id} />
              <RecommendedExchanges />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
