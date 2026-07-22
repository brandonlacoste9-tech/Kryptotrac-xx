import Link from "next/link"
import { FaqJsonLd } from "@/components/json-ld"

const FAQS = [
  {
    question: "Is KryptoTrac free?",
    answer:
      "Yes. KryptoTrac is free to use. Live market data comes from CoinGecko. Optional ads may appear to support the product.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Your portfolio, watchlist, and alerts are stored only in your browser (localStorage). Nothing is uploaded to our servers.",
  },
  {
    question: "Does KryptoTrac support Canadian dollars?",
    answer:
      "Yes. Switch between USD and CAD in the header. Prices and portfolio totals update to your selected currency.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. KryptoTrac is a tracking tool only. Cryptocurrency markets are volatile — always do your own research.",
  },
]

/** Crawlable SEO block under the interactive markets UI */
export function HomeSeoContent() {
  return (
    <section className="mt-12 space-y-8 border-t border-border pt-10">
      <FaqJsonLd faqs={FAQS} />
      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Free private crypto portfolio tracker
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          KryptoTrac helps you track Bitcoin, Ethereum, and thousands of other
          cryptocurrencies with live prices from CoinGecko. Build a personal
          portfolio with cost basis and P&amp;L, set price alerts, compare
          coins, and switch between <strong className="text-foreground">USD</strong>{" "}
          and <strong className="text-foreground">CAD</strong> — without creating
          an account.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Unlike custodial apps, holdings never leave your device. Export a
          backup anytime, install the PWA for a home-screen shortcut, and use
          offline last-known prices when the network is slow.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Live markets",
            body: "Top coins, categories (DeFi, L2, meme), heatmap, gainers & losers, and full CoinGecko search.",
            href: "/",
          },
          {
            title: "Private portfolio",
            body: "Amounts, cost basis, allocation, transaction log, sell tools, and shareable snapshots.",
            href: "/portfolio",
          },
          {
            title: "Alerts & compare",
            body: "Browser notifications for price targets and side-by-side coin comparison.",
            href: "/compare",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-border bg-card/40 p-4"
          >
            <h3 className="font-semibold text-sm mb-1.5">{c.title}</h3>
            <p className="text-xs text-muted leading-relaxed mb-3">{c.body}</p>
            <Link href={c.href} className="text-xs font-semibold text-accent hover:underline">
              Open →
            </Link>
          </div>
        ))}
      </div>

      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold tracking-tight mb-3">
          Frequently asked questions
        </h2>
        <dl className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.question}>
              <dt className="text-sm font-semibold text-foreground">
                {f.question}
              </dt>
              <dd className="mt-1 text-sm text-muted leading-relaxed">
                {f.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-xs text-muted max-w-3xl">
        Popular pages:{" "}
        <Link href="/coin/bitcoin" className="text-accent hover:underline">
          Bitcoin
        </Link>
        {" · "}
        <Link href="/coin/ethereum" className="text-accent hover:underline">
          Ethereum
        </Link>
        {" · "}
        <Link href="/coin/solana" className="text-accent hover:underline">
          Solana
        </Link>
        {" · "}
        <Link href="/portfolio" className="text-accent hover:underline">
          Portfolio
        </Link>
        {" · "}
        <Link href="/about" className="text-accent hover:underline">
          About
        </Link>
        {" · "}
        <Link href="/legal/privacy" className="text-accent hover:underline">
          Privacy
        </Link>
      </p>
    </section>
  )
}
