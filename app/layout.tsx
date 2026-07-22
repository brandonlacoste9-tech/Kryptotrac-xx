import type { Metadata } from "next"
import { PortfolioProvider } from "@/lib/portfolio"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://kryptotrac.com"),
  title: {
    default: "KryptoTrac — Crypto portfolio tracker",
    template: "%s · KryptoTrac",
  },
  description:
    "Track your crypto holdings with live CoinGecko prices. Portfolio, markets, and watchlist — private in your browser.",
  keywords: ["crypto", "portfolio", "bitcoin", "ethereum", "tracker", "kryptotrac"],
  openGraph: {
    title: "KryptoTrac — Crypto portfolio tracker",
    description: "Live markets and a private browser-side portfolio.",
    siteName: "KryptoTrac",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col antialiased">
        <PortfolioProvider>
          <SiteHeader />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
          <SiteFooter />
        </PortfolioProvider>
      </body>
    </html>
  )
}
