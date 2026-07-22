import type { Metadata } from "next"
import ComparePage from "@/components/compare-page"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Compare cryptocurrencies side by side",
  description:
    "Compare Bitcoin, Ethereum, Solana and more: price, market cap, volume, 24h change, and sparklines. Free crypto comparison tool.",
  alternates: { canonical: `${siteUrl()}/compare` },
  openGraph: {
    title: "Compare coins · KryptoTrac",
    description: "Side-by-side crypto metrics for up to 4 assets.",
    url: `${siteUrl()}/compare`,
  },
}

export default function Page() {
  return <ComparePage />
}
