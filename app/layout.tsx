import type { Metadata, Viewport } from "next"
import { PortfolioProvider } from "@/lib/portfolio"
import { CurrencyProvider } from "@/lib/currency"
import { AlertsProvider } from "@/lib/alerts"
import { ThemeProvider } from "@/lib/theme"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PwaRegister } from "@/components/pwa-register"
import { AlertsWatcher } from "@/components/alerts-watcher"
import { AdSenseScript } from "@/components/adsense-script"
import { ADSENSE_ENABLED, ADSENSE_PUBLISHER_ID } from "@/lib/adsense"
import { siteUrl } from "@/lib/utils"
import "./globals.css"

const base = siteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "KryptoTrac — Crypto portfolio tracker",
    template: "%s · KryptoTrac",
  },
  description:
    "Track your crypto holdings with live CoinGecko prices. Portfolio, markets, alerts, compare, USD & CAD — private in your browser.",
  keywords: [
    "crypto",
    "portfolio",
    "bitcoin",
    "ethereum",
    "tracker",
    "kryptotrac",
    "CAD",
  ],
  alternates: {
    canonical: base,
  },
  openGraph: {
    title: "KryptoTrac — Crypto portfolio tracker",
    description: "Live markets and a private browser-side portfolio. USD & CAD.",
    siteName: "KryptoTrac",
    type: "website",
    url: base,
  },
  twitter: {
    card: "summary_large_image",
    title: "KryptoTrac — Crypto portfolio tracker",
    description: "Live markets and a private browser-side portfolio.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KryptoTrac",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(ADSENSE_ENABLED
    ? { other: { "google-adsense-account": ADSENSE_PUBLISHER_ID } }
    : {}),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070b12" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
  ],
  width: "device-width",
  initialScale: 1,
}

const themeBoot = `
try {
  var t = localStorage.getItem('kryptotrac-theme-v1');
  if (t === 'light' || t === 'dark') {
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <ThemeProvider>
          <CurrencyProvider>
            <PortfolioProvider>
              <AlertsProvider>
                <SiteHeader />
                <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                  {children}
                </main>
                <SiteFooter />
                <PwaRegister />
                <AlertsWatcher />
                <AdSenseScript />
              </AlertsProvider>
            </PortfolioProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
