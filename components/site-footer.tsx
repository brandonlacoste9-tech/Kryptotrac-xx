import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-xs text-muted space-y-1 max-w-xl">
          <p>
            © {new Date().getFullYear()} KryptoTrac · Market data by{" "}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              CoinGecko
            </a>
            .
          </p>
          <p>
            Not financial advice. Crypto is volatile — verify prices and do your own
            research. Portfolio data stays in your browser.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <Link href="/legal/privacy" className="hover:text-accent">
            Privacy
          </Link>
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/portfolio" className="hover:text-accent">
            Portfolio
          </Link>
        </div>
      </div>
    </footer>
  )
}
