"use client"

import { useMemo, useState } from "react"
import { Copy, Share2 } from "lucide-react"
import { usePortfolio } from "@/lib/portfolio"
import { useCurrency } from "@/lib/currency"
import type { PriceMap } from "@/lib/types"
import { formatMoney, formatPct, priceFromMap } from "@/lib/utils"

export function SharePortfolio({
  prices,
  totalValue,
  totalPnlPct,
}: {
  prices: PriceMap
  totalValue: number
  totalPnlPct: number | null
}) {
  const { holdings } = usePortfolio()
  const { currency } = useCurrency()
  const [msg, setMsg] = useState("")

  const text = useMemo(() => {
    const lines = [
      "KryptoTrac portfolio snapshot",
      `Total: ${formatMoney(totalValue, currency)}`,
      totalPnlPct != null
        ? `Unrealized P&L: ${formatPct(totalPnlPct)}`
        : null,
      "",
      ...holdings.map((h) => {
        const p = priceFromMap(prices[h.id], currency)
        const v = p != null ? h.amount * p : null
        const alloc =
          v != null && totalValue > 0
            ? ((v / totalValue) * 100).toFixed(1)
            : "?"
        return `• ${h.symbol.toUpperCase()}: ${h.amount} (${formatMoney(v, currency)}, ${alloc}%)`
      }),
      "",
      "Private tracker — amounts stay in my browser.",
      "https://kryptotrac.netlify.app",
    ].filter(Boolean) as string[]
    return lines.join("\n")
  }, [holdings, prices, totalValue, totalPnlPct, currency])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setMsg("Copied to clipboard")
    } catch {
      setMsg("Could not copy")
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My KryptoTrac portfolio",
          text,
        })
        setMsg("Shared")
        return
      } catch {
        /* cancelled */
      }
    }
    await copy()
  }

  if (holdings.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-accent/40"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-accent/40"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy summary
      </button>
      {msg && <span className="text-xs text-accent">{msg}</span>}
    </div>
  )
}
