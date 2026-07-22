"use client"

import { useEffect } from "react"
import { useAlerts } from "@/lib/alerts"
import { useCurrency } from "@/lib/currency"
import { priceFromMap } from "@/lib/utils"
import type { PriceMap } from "@/lib/types"

/** Polls prices for active alerts every 60s while the tab is open */
export function AlertsWatcher() {
  const { alerts, checkPrices, ready } = useAlerts()
  const { currency } = useCurrency()

  useEffect(() => {
    if (!ready) return
    const active = alerts.filter((a) => !a.triggeredAt)
    if (active.length === 0) return

    const ids = [...new Set(active.map((a) => a.coinId))].join(",")

    async function tick() {
      try {
        const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`)
        if (!res.ok) return
        const data = (await res.json()) as PriceMap
        const map: Record<string, number> = {}
        for (const id of Object.keys(data)) {
          const p = priceFromMap(data[id], currency)
          if (p != null) map[id] = p
        }
        checkPrices(map)
      } catch {
        /* ignore */
      }
    }

    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [alerts, checkPrices, currency, ready])

  return null
}
