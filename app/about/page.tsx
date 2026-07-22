import type { Metadata } from "next"
import Link from "next/link"
import { FaqJsonLd } from "@/components/json-ld"
import { siteUrl } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About KryptoTrac — private crypto portfolio tracker",
  description:
    "Learn how KryptoTrac works: free live markets, browser-only portfolio storage, USD/CAD, alerts, and compare tools. Not financial advice.",
  alternates: { canonical: `${siteUrl()}/about` },
  openGraph: {
    title: "About KryptoTrac",
    description: "Free private crypto portfolio tracker powered by CoinGecko.",
    url: `${siteUrl()}/about`,
  },
}

const FAQS = [
  {
    question: "Who is KryptoTrac for?",
    answer:
      "Anyone who wants a simple, private way to track crypto holdings and markets without signing up for a custodial app.",
  },
  {
    question: "Where does price data come from?",
    answer:
      "Live market data is provided by CoinGecko through our API proxies.",
  },
  {
    question: "Is my portfolio private?",
    answer:
      "Yes. Holdings, watchlists, alerts, and preferences stay in your browser localStorage and are not uploaded to KryptoTrac servers.",
  },
]

export default function AboutPage() {
  return (
    <article className="max-w-2xl space-y-6">
      <FaqJsonLd faqs={FAQS} />
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          About KryptoTrac
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          KryptoTrac is a lightweight{" "}
          <strong className="text-foreground">crypto portfolio tracker</strong>{" "}
          for people who want live prices without giving up privacy. Market data
          comes from CoinGecko. Your holdings and watchlist stay in your browser
          — we don&apos;t require an account or store positions on a server.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">What you can do</h2>
        <ul className="list-disc pl-5 text-sm text-muted space-y-2">
          <li>
            Browse live markets, categories, heatmap, gainers, losers, and
            trending coins
          </li>
          <li>Search any asset on CoinGecko and open detailed coin pages</li>
          <li>
            Track a private portfolio with cost basis, allocation, sells, and a
            transaction log
          </li>
          <li>Set browser price alerts and compare coins side by side</li>
          <li>Switch USD/CAD, export backups, install as a PWA</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">FAQ</h2>
        <dl className="space-y-4 text-sm">
          {FAQS.map((f) => (
            <div key={f.question}>
              <dt className="font-semibold text-foreground">{f.question}</dt>
              <dd className="mt-1 text-muted leading-relaxed">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-sm text-muted">
        This is not financial advice. Crypto markets are volatile. Always verify
        prices and do your own research.
      </p>

      <p className="text-sm flex flex-wrap gap-3">
        <Link href="/" className="text-accent hover:underline">
          ← Markets
        </Link>
        <Link href="/portfolio" className="text-accent hover:underline">
          Portfolio
        </Link>
        <Link href="/legal/privacy" className="text-accent hover:underline">
          Privacy
        </Link>
      </p>
    </article>
  )
}
