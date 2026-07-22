import type { Metadata } from "next"
import Link from "next/link"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How KryptoTrac handles browser storage, CoinGecko market data, notifications, hosting logs, and Google AdSense advertising.",
  alternates: { canonical: `${siteUrl()}/legal/privacy` },
}

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-accent">
          ← KryptoTrac
        </Link>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
          Privacy policy
        </h1>
        <p className="mt-1 text-sm text-muted">Last updated: 22 July 2026</p>
      </div>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">What we store</h2>
        <p>
          Portfolio holdings, watchlists, price alerts, and currency preference
          are saved in your browser&apos;s{" "}
          <code className="text-accent text-xs">localStorage</code> only. They
          are not sent to our servers.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Market data</h2>
        <p>
          Price and market information is requested from CoinGecko through our
          API routes so the app can display live numbers and evaluate alerts.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">
          Notifications
        </h2>
        <p>
          If you enable browser notifications for price alerts, your browser may
          show system notifications. Alert rules stay on your device.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Hosting & logs</h2>
        <p>
          The site is hosted on Netlify (or similar), which can log standard
          technical data (IP, user agent, pages) for security and reliability.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">
          Advertising (Google AdSense)
        </h2>
        <p>
          KryptoTrac may display ads via Google AdSense (publisher{" "}
          <code className="text-accent text-xs">ca-pub-4276130467303652</code>
          ). Google and partners may use cookies or identifiers for ad
          measurement and personalization.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Manage personalized ads at{" "}
            <a
              href="https://adssettings.google.com"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              adssettings.google.com
            </a>
          </li>
          <li>
            Google ads technologies:{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/ads
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Contact</h2>
        <p>
          Questions about this policy: use the contact channel on your KryptoTrac
          deployment or repository.
        </p>
      </section>
    </article>
  )
}
