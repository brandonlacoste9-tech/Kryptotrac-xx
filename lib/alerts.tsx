"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { QuoteCurrency } from "@/lib/types"

const KEY = "kryptotrac-alerts-v1"

export type PriceAlert = {
  id: string
  coinId: string
  symbol: string
  name: string
  direction: "above" | "below"
  target: number
  currency: QuoteCurrency
  createdAt: string
  triggeredAt?: string
}

type AlertsContextValue = {
  ready: boolean
  alerts: PriceAlert[]
  permission: NotificationPermission | "unsupported"
  requestPermission: () => Promise<NotificationPermission | "unsupported">
  addAlert: (a: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">) => void
  removeAlert: (id: string) => void
  checkPrices: (prices: Record<string, number>) => void
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

function load(): PriceAlert[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PriceAlert[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [ready, setReady] = useState(false)
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default")

  useEffect(() => {
    setAlerts(load())
    if (typeof Notification === "undefined") setPermission("unsupported")
    else setPermission(Notification.permission)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(alerts))
    } catch {
      /* ignore */
    }
  }, [alerts, ready])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported")
      return "unsupported"
    }
    const p = await Notification.requestPermission()
    setPermission(p)
    return p
  }, [])

  const addAlert = useCallback(
    (a: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">) => {
      const alert: PriceAlert = {
        ...a,
        id: `${a.coinId}-${a.direction}-${a.target}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setAlerts((prev) => [...prev, alert])
    },
    []
  )

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const checkPrices = useCallback(
    (prices: Record<string, number>) => {
      setAlerts((prev) => {
        let changed = false
        const next = prev.map((a) => {
          if (a.triggeredAt) return a
          const price = prices[a.coinId]
          if (price == null) return a
          const hit =
            a.direction === "above" ? price >= a.target : price <= a.target
          if (!hit) return a
          changed = true
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`KryptoTrac: ${a.symbol.toUpperCase()}`, {
                body: `${a.symbol.toUpperCase()} is ${a.direction} ${a.target} ${a.currency.toUpperCase()} (now ${price.toFixed(4)})`,
                icon: "/favicon.svg",
                tag: a.id,
              })
            } catch {
              /* ignore */
            }
          }
          return { ...a, triggeredAt: new Date().toISOString() }
        })
        return changed ? next : prev
      })
    },
    []
  )

  const value = useMemo(
    () => ({
      ready,
      alerts,
      permission,
      requestPermission,
      addAlert,
      removeAlert,
      checkPrices,
    }),
    [
      ready,
      alerts,
      permission,
      requestPermission,
      addAlert,
      removeAlert,
      checkPrices,
    ]
  )

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  )
}

export function useAlerts() {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider")
  return ctx
}
