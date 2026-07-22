"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useAlerts } from "@/lib/alerts"
import { useCurrency } from "@/lib/currency"
import { formatMoney } from "@/lib/utils"

export function AlertForm({
  coinId,
  symbol,
  name,
  currentPrice,
}: {
  coinId: string
  symbol: string
  name: string
  currentPrice?: number
}) {
  const { addAlert, requestPermission, permission, alerts, removeAlert } =
    useAlerts()
  const { currency } = useCurrency()
  const [direction, setDirection] = useState<"above" | "below">("above")
  const [target, setTarget] = useState("")
  const [msg, setMsg] = useState("")

  const mine = alerts.filter((a) => a.coinId === coinId && !a.triggeredAt)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = parseFloat(target)
    if (!Number.isFinite(t) || t <= 0) {
      setMsg("Enter a valid target price")
      return
    }
    if (permission === "default") {
      const p = await requestPermission()
      if (p !== "granted") {
        setMsg("Notifications blocked — enable them in browser settings")
      }
    }
    addAlert({
      coinId,
      symbol,
      name,
      direction,
      target: t,
      currency,
    })
    setTarget("")
    setMsg("Alert saved — checked while this site is open")
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">Price alert</h3>
      </div>
      <p className="text-xs text-muted">
        Browser notification when {symbol.toUpperCase()} crosses your target.
        Works while KryptoTrac is open in a tab.
        {currentPrice != null && (
          <> Now {formatMoney(currentPrice, currency)}.</>
        )}
      </p>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-end">
        <label className="text-xs text-muted">
          When price goes
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as "above" | "below")
            }
            className="mt-1 block rounded-lg border border-border bg-background px-2 py-2 text-sm"
          >
            <option value="above">above</option>
            <option value="below">below</option>
          </select>
        </label>
        <label className="text-xs text-muted flex-1 min-w-[8rem]">
          Target ({currency.toUpperCase()})
          <input
            type="number"
            step="any"
            min="0"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={currentPrice?.toFixed(2)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Add alert
        </button>
      </form>
      {msg && <p className="text-xs text-accent">{msg}</p>}
      {mine.length > 0 && (
        <ul className="space-y-1.5 pt-1 border-t border-border">
          {mine.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between text-xs text-muted"
            >
              <span>
                {a.direction} {formatMoney(a.target, a.currency)}
              </span>
              <button
                type="button"
                onClick={() => removeAlert(a.id)}
                className="text-danger hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
