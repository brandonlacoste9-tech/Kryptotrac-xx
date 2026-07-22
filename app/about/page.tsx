import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
}

export default function AboutPage() {
  return (
    <article className="prose prose-invert max-w-2xl space-y-4">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">About KryptoTrac</h1>
      <p className="text-muted leading-relaxed">
        KryptoTrac is a lightweight crypto portfolio tracker. Live market data comes from CoinGecko.
        Your holdings and watchlist stay in your browser — we don&apos;t run accounts or store your
        positions on a server.
      </p>
      <ul className="list-disc pl-5 text-sm text-muted space-y-2">
        <li>Markets: top 100, categories (DeFi/L2/meme…), gainers/losers, trending</li>
        <li>Search any coin · compare up to 4 side-by-side</li>
        <li>Portfolio: cost basis, allocation, export/import backup</li>
        <li>Price alerts (browser notifications while the tab is open)</li>
        <li>USD &amp; CAD · multi-range charts · optional AdSense</li>
        <li>Installable PWA · data stays in your browser</li>
      </ul>
      <p className="text-sm text-muted">
        This is not financial advice. Crypto markets are volatile. Always verify prices and do your
        own research.
      </p>
      <p className="text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to markets
        </Link>
      </p>
    </article>
  )
}
