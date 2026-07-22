"use client"

import Image from "next/image"
import Link from "next/link"
import type { MarketCoin, QuoteCurrency } from "@/lib/types"
import { formatMoney } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"

export function MarketMovers({
  coins,
  currency,
}: {
  coins: MarketCoin[]
  currency: QuoteCurrency
}) {
  if (coins.length < 5) return null

  const withChange = coins.filter((c) => c.price_change_percentage_24h != null)
  const gainers = [...withChange]
    .sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) -
        (a.price_change_percentage_24h ?? 0)
    )
    .slice(0, 5)
  const losers = [...withChange]
    .sort(
      (a, b) =>
        (a.price_change_percentage_24h ?? 0) -
        (b.price_change_percentage_24h ?? 0)
    )
    .slice(0, 5)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoverCard title="Top gainers (24h)" items={gainers} currency={currency} />
      <MoverCard title="Top losers (24h)" items={losers} currency={currency} />
    </div>
  )
}

function MoverCard({
  title,
  items,
  currency,
}: {
  title: string
  items: MarketCoin[]
  currency: QuoteCurrency
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="px-3 py-2 border-b border-border text-[11px] uppercase tracking-wider text-muted font-semibold">
        {title}
      </div>
      <ul className="divide-y divide-border/60">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/coin/${c.id}`}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.03]"
            >
              <Image
                src={c.image}
                alt=""
                width={22}
                height={22}
                className="rounded-full"
                unoptimized
              />
              <span className="flex-1 min-w-0 text-sm font-medium truncate">
                {c.symbol.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-muted tabular-nums hidden xs:inline">
                {formatMoney(c.current_price, currency)}
              </span>
              <ChangeBadge
                value={c.price_change_percentage_24h}
                className="text-xs min-w-[4.5rem] text-right"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
