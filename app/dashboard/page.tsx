import { redirect } from 'next/navigation'
import { createServerClient } from "@/lib/supabase/server"
import { WatchlistSection } from "@/components/watchlist/watchlist-section"
import { PortfolioSection } from "@/components/portfolio/portfolio-section"

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome back, {user.email}</p>
          </div>
        </div>

        <WatchlistSection />

        <PortfolioSection />
      </div>
    </div>
  )
}
