import { WatchlistContainer } from "@/components/watchlist/watchlist-container"
import { AffiliateSidebar } from "@/components/affiliates/affiliate-sidebar"
import { Header } from "@/components/layout/header"
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DisclaimerBanner />
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <WatchlistContainer />
          </div>
          <aside className="lg:w-80">
            <AffiliateSidebar />
          </aside>
        </div>
      </main>
    </div>
  )
}
