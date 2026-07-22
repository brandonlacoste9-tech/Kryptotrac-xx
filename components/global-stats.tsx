"use client"

import { useEffect, useState } from "react"
import type { QuoteCurrency } from "@/lib/types"
import { formatMoney, formatPct } from "@/lib/utils"
import type { GlobalData } from "@/app/api/global/route"

export function GlobalStats({ currency }: { currency: QuoteCurrency }) {
  const [data, setData] = useState<GlobalData | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/global")
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled && !json.error) setData(json as GlobalData)
      } catch {
        /* optional strip */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return null

  const mcap = data.total_market_cap?.[currency] ?? data.total_market_cap?.usd
  const vol = data.total_volume?.[currency] ?? data.total_volume?.usd
  const btcDom = data.market_cap_percentage?.btc
  const ethDom = data.market_cap_percentage?.eth
  const ch = data.market_cap_change_percentage_24h_usd

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <Stat
        label="Total market cap"
        value={formatMoney(mcap, currency, true)}
        sub={
          ch != null ? (
            <span className={ch >= 0 ? "text-success" : "text-danger"}>
              {formatPct(ch)} 24h
            </span>
          ) : undefined
        }
      />
      <Stat label="24h volume" value={formatMoney(vol, currency, true)} />
      <Stat
        label="BTC dominance"
        value={btcDom != null ? `${btcDom.toFixed(1)}%` : "—"}
      />
      <Stat
        label="ETH dominance"
        value={ethDom != null ? `${ethDom.toFixed(1)}%` : "—"}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
        {label}
      </p>
      <p className="mt-0.5 text-sm sm:text-base font-semibold tabular-nums font-mono">
        {value}
      </p>
      {sub && <div className="text-[11px] mt-0.5">{sub}</div>}
    </div>
  )
}
