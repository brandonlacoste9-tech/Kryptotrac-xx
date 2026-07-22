"use client"

import { useState } from "react"
import { usePortfolio } from "@/lib/portfolio"
import { useCurrency } from "@/lib/currency"
import { formatMoney } from "@/lib/utils"

export function SellHoldingForm({
  coinId,
  symbol,
  maxAmount,
  priceUsd,
}: {
  coinId: string
  symbol: string
  maxAmount: number
  priceUsd?: number
}) {
  const { sellHolding } = usePortfolio()
  const { currency, usdToCad } = useCurrency()
  const [amount, setAmount] = useState("")
  const [msg, setMsg] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    const result = sellHolding(coinId, amt, { priceUsd })
    setMsg(result.message)
    if (result.ok) setAmount("")
  }

  const displayPrice =
    priceUsd != null
      ? currency === "cad"
        ? priceUsd * usdToCad
        : priceUsd
      : undefined

  const est =
    displayPrice != null && parseFloat(amount) > 0
      ? displayPrice * parseFloat(amount)
      : null

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card/60 p-3 space-y-2"
    >
      <p className="text-xs font-semibold text-muted">
        Sell {symbol.toUpperCase()}
        <span className="font-normal"> · max {maxAmount}</span>
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs text-muted flex-1 min-w-[7rem]">
          Amount
          <input
            type="number"
            step="any"
            min="0"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
        </label>
        <button
          type="button"
          className="text-[11px] text-accent hover:underline pb-2"
          onClick={() => setAmount(String(maxAmount))}
        >
          Max
        </button>
        <button
          type="submit"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger/20"
        >
          Sell
        </button>
      </div>
      {est != null && (
        <p className="text-[10px] text-muted">
          ~{formatMoney(est, currency)} at market
        </p>
      )}
      {msg && <p className="text-xs text-accent">{msg}</p>}
    </form>
  )
}
