import type { Metadata } from "next"
import MarketsPage from "@/components/markets-page"
import { HomeSeoContent } from "@/components/seo-content"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    absolute: "KryptoTrac — Free private crypto portfolio tracker | Live prices",
  },
  description:
    "Track Bitcoin, Ethereum, and altcoins with live CoinGecko prices. Free private portfolio in your browser — USD & CAD, alerts, compare tools. No account required.",
  keywords: [
    "crypto portfolio tracker",
    "bitcoin tracker",
    "ethereum price",
    "private crypto portfolio",
    "CAD crypto",
    "free portfolio tracker",
    "CoinGecko portfolio",
    "kryptotrac",
  ],
  alternates: { canonical: siteUrl() },
  openGraph: {
    title: "KryptoTrac — Free private crypto portfolio tracker",
    description:
      "Live markets and a browser-only portfolio. USD & CAD. No account required.",
    url: siteUrl(),
  },
}

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">
        KryptoTrac — free private crypto portfolio tracker with live prices
      </h1>
      <MarketsPage />
      <HomeSeoContent />
    </>
  )
}
