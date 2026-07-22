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
import { AppJsonLd } from "@/components/json-ld"
import { siteUrl } from "@/lib/utils"
import "./globals.css"

const base = siteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default:
      "KryptoTrac — Free private crypto portfolio tracker | Live CoinGecko prices",
    template: "%s · KryptoTrac",
  },
  description:
    "Free private crypto portfolio tracker with live CoinGecko prices. USD & CAD, alerts, compare, watchlist — no account. Holdings stay in your browser.",
  keywords: [
    "crypto portfolio tracker",
    "private crypto portfolio",
    "bitcoin portfolio",
    "ethereum tracker",
    "CAD crypto tracker",
    "CoinGecko portfolio",
    "free portfolio tracker",
    "kryptotrac",
  ],
  authors: [{ name: "KryptoTrac" }],
  creator: "KryptoTrac",
  category: "finance",
  alternates: {
    canonical: base,
  },
  openGraph: {
    title: "KryptoTrac — Free private crypto portfolio tracker",
    description:
      "Live markets and a browser-only portfolio. USD & CAD. No account required.",
    siteName: "KryptoTrac",
    type: "website",
    url: base,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "KryptoTrac — Free private crypto portfolio tracker",
    description:
      "Live markets and a browser-only portfolio. USD & CAD. No account required.",
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
        <AppJsonLd />
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
