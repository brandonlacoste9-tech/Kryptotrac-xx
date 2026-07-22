"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { useAlerts } from "@/lib/alerts"
import { formatMoney } from "@/lib/utils"

export default function AlertsPage() {
  const { ready, alerts, removeAlert, requestPermission, permission } =
    useAlerts()

  if (!ready) return <p className="text-sm text-muted">Loading…</p>

  const active = alerts.filter((a) => !a.triggeredAt)
  const done = alerts.filter((a) => a.triggeredAt)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Bell className="h-7 w-7 text-accent" />
          Price alerts
        </h1>
        <p className="mt-1 text-sm text-muted">
          Stored in this browser. Checked every 60s while KryptoTrac is open.
        </p>
      </div>

      {permission !== "granted" && permission !== "unsupported" && (
        <button
          type="button"
          onClick={() => requestPermission()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black"
        >
          Enable browser notifications
        </button>
      )}
      {permission === "unsupported" && (
        <p className="text-sm text-warning">
          This browser does not support notifications.
        </p>
      )}

      {active.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No active alerts. Open a coin page to set one.{" "}
          <Link href="/" className="text-accent hover:underline">
            Markets
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card/40">
          {active.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <Link
                  href={`/coin/${a.coinId}`}
                  className="font-medium hover:text-accent"
                >
                  {a.name}{" "}
                  <span className="text-xs uppercase text-muted">{a.symbol}</span>
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  Alert when {a.direction}{" "}
                  {formatMoney(a.target, a.currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeAlert(a.id)}
                className="text-xs text-danger hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted mb-2">Triggered</h2>
          <ul className="space-y-1 text-xs text-muted">
            {done.map((a) => (
              <li key={a.id} className="flex justify-between gap-2">
                <span>
                  {a.symbol.toUpperCase()} {a.direction}{" "}
                  {formatMoney(a.target, a.currency)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAlert(a.id)}
                  className="text-danger"
                >
                  Clear
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
