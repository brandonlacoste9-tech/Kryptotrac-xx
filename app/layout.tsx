import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FeedbackPrompt } from "@/components/feedback/feedback-prompt"
import { ErrorBoundary } from "@/components/error/error-boundary"
import { AtlasDock } from "@/components/atlas/atlas-dock"
import Script from "next/script"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KryptoTrac - Track Your Crypto Portfolio with Real-Time Insights",
  description: "Canadian-friendly crypto portfolio tracker with real-time price alerts, P&L analytics, and AI-powered insights. Track Bitcoin, Ethereum, and your favorite cryptocurrencies.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["crypto", "portfolio", "tracker", "bitcoin", "ethereum", "cryptocurrency", "canada", "price alerts", "analytics"],
  authors: [{ name: "KryptoTrac" }],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://kryptotrac.com",
    siteName: "KryptoTrac",
    title: "KryptoTrac - Track Your Crypto Portfolio",
    description: "Canadian-friendly crypto portfolio tracker with real-time price alerts and AI-powered insights.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KryptoTrac - Track Your Crypto Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KryptoTrac - Track Your Crypto Portfolio",
    description: "Canadian-friendly crypto portfolio tracker with real-time price alerts and AI insights.",
    images: ["/og-image.jpg"],
    creator: "@kryptotrac",
  },
  icons: {
    icon: [
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.jpg", sizes: "192x192", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="KryptoTrac" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KryptoTrac" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-black text-white antialiased">
        <ErrorBoundary>
          <Header />
          {children}
          <FeedbackPrompt />
          <AtlasDock />
          <Footer />
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((reg) => console.log('[v0] Service Worker registered'))
                  .catch((err) => console.error('[v0] Service Worker registration failed:', err))
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}
