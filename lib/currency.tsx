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

const KEY = "kryptotrac-currency-v1"

type CurrencyContextValue = {
  currency: QuoteCurrency
  setCurrency: (c: QuoteCurrency) => void
  /** CAD per 1 USD — for converting cost basis */
  usdToCad: number
  ready: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<QuoteCurrency>("usd")
  const [usdToCad, setUsdToCad] = useState(1.35)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw === "cad" || raw === "usd") setCurrencyState(raw)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, currency)
    } catch {
      /* ignore */
    }
  }, [currency, ready])

  // Refresh FX occasionally via bitcoin dual quote
  useEffect(() => {
    let cancelled = false
    async function loadFx() {
      try {
        const res = await fetch("/api/fx")
        if (!res.ok) return
        const data = (await res.json()) as { usdToCad?: number }
        if (!cancelled && data.usdToCad && data.usdToCad > 0) {
          setUsdToCad(data.usdToCad)
        }
      } catch {
        /* keep default */
      }
    }
    loadFx()
    const t = setInterval(loadFx, 5 * 60_000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const setCurrency = useCallback((c: QuoteCurrency) => setCurrencyState(c), [])

  const value = useMemo(
    () => ({ currency, setCurrency, usdToCad, ready }),
    [currency, setCurrency, usdToCad, ready]
  )

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
