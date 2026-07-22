import type { Metadata } from "next"
import WatchlistPage from "@/components/watchlist-page"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Crypto watchlist",
  description:
    "Star coins to follow prices in one private watchlist. Saved in your browser with live CoinGecko data.",
  alternates: { canonical: `${siteUrl()}/watchlist` },
  openGraph: {
    title: "Watchlist · KryptoTrac",
    description: "Private crypto watchlist with live prices.",
    url: `${siteUrl()}/watchlist`,
  },
}

export default function Page() {
  return <WatchlistPage />
}
