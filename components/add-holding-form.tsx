"use client"

import { useState } from "react"
import { usePortfolio } from "@/lib/portfolio"

export function AddHoldingForm({
  id,
  symbol,
  name,
  currentPrice,
}: {
  id: string
  symbol: string
  name: string
  currentPrice?: number
}) {
  const { addHolding, getHolding } = usePortfolio()
  const existing = getHolding(id)
  const [amount, setAmount] = useState("")
  const [cost, setCost] = useState("")
  const [msg, setMsg] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setMsg("Enter a valid amount")
      return
    }
    let costBasisUsd: number | undefined
    if (cost.trim()) {
      const c = parseFloat(cost)
      if (!Number.isFinite(c) || c < 0) {
        setMsg("Invalid cost basis")
        return
      }
      costBasisUsd = c
    } else if (currentPrice != null) {
      costBasisUsd = amt * currentPrice
    }

    addHolding({ id, symbol, name, amount: amt, costBasisUsd })
    setAmount("")
    setCost("")
    setMsg(existing ? "Added to existing position" : "Position added")
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <h3 className="text-sm font-semibold">
        {existing ? `Add more ${symbol.toUpperCase()}` : `Add ${symbol.toUpperCase()} to portfolio`}
      </h3>
      {existing && (
        <p className="text-xs text-muted">
          Current holding: {existing.amount} {symbol.toUpperCase()}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          Amount
          <input
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.5"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
        </label>
        <label className="block text-xs text-muted">
          Cost basis USD (optional)
          <input
            type="number"
            step="any"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder={currentPrice != null ? `≈ market ($${currentPrice.toFixed(2)})` : "Total paid"}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
      >
        Save to portfolio
      </button>
      {msg && <p className="text-xs text-accent">{msg}</p>}
    </form>
  )
}
