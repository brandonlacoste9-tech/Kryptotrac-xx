import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy policy",
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
          Portfolio holdings and watchlists are saved in your browser&apos;s{" "}
          <code className="text-accent text-xs">localStorage</code> only. They are not sent to our
          servers.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Market data</h2>
        <p>
          Price and market information is requested from CoinGecko through our API routes so the app
          can display live numbers. Those requests include the coin IDs needed to value your
          portfolio.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Hosting & logs</h2>
        <p>
          The site may be hosted on Vercel or similar platforms, which can log standard technical
          data (IP, user agent, pages) for security and reliability.
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Advertising</h2>
        <p>
          If Google AdSense or similar ads are enabled later, third parties may use cookies or
          identifiers for ad measurement and personalization. You can manage personalized ads at{" "}
          <a
            href="https://adssettings.google.com"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            adssettings.google.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-2 text-sm text-muted leading-relaxed">
        <h2 className="text-foreground font-semibold text-base">Contact</h2>
        <p>
          Questions about this policy: use the contact channel on your KryptoTrac deployment or
          repository.
        </p>
      </section>
    </article>
  )
}
