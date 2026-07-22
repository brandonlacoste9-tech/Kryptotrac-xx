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
import type { Holding, PortfolioState } from "@/lib/types"

const STORAGE_KEY = "kryptotrac-portfolio-v1"

const defaultState: PortfolioState = { holdings: [], watchlist: [] }

type PortfolioContextValue = {
  ready: boolean
  holdings: Holding[]
  watchlist: string[]
  addHolding: (h: Omit<Holding, "amount"> & { amount: number }) => void
  updateHolding: (id: string, patch: Partial<Pick<Holding, "amount" | "costBasisUsd">>) => void
  removeHolding: (id: string) => void
  toggleWatchlist: (id: string) => void
  isWatched: (id: string) => boolean
  getHolding: (id: string) => Holding | undefined
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

function load(): PortfolioState {
  if (typeof window === "undefined") return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as PortfolioState
    return {
      holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
      watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : [],
    }
  } catch {
    return defaultState
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(defaultState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(load())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota */
    }
  }, [state, ready])

  const addHolding = useCallback(
    (h: Omit<Holding, "amount"> & { amount: number }) => {
      setState((prev) => {
        const existing = prev.holdings.find((x) => x.id === h.id)
        if (existing) {
          return {
            ...prev,
            holdings: prev.holdings.map((x) =>
              x.id === h.id
                ? {
                    ...x,
                    amount: x.amount + h.amount,
                    costBasisUsd:
                      h.costBasisUsd != null
                        ? (x.costBasisUsd ?? 0) + h.costBasisUsd
                        : x.costBasisUsd,
                  }
                : x
            ),
          }
        }
        return { ...prev, holdings: [...prev.holdings, h] }
      })
    },
    []
  )

  const updateHolding = useCallback(
    (id: string, patch: Partial<Pick<Holding, "amount" | "costBasisUsd">>) => {
      setState((prev) => ({
        ...prev,
        holdings: prev.holdings
          .map((x) => (x.id === id ? { ...x, ...patch } : x))
          .filter((x) => x.amount > 0),
      }))
    },
    []
  )

  const removeHolding = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      holdings: prev.holdings.filter((x) => x.id !== id),
    }))
  }, [])

  const toggleWatchlist = useCallback((id: string) => {
    setState((prev) => {
      const on = prev.watchlist.includes(id)
      return {
        ...prev,
        watchlist: on
          ? prev.watchlist.filter((x) => x !== id)
          : [...prev.watchlist, id],
      }
    })
  }, [])

  const isWatched = useCallback(
    (id: string) => state.watchlist.includes(id),
    [state.watchlist]
  )

  const getHolding = useCallback(
    (id: string) => state.holdings.find((x) => x.id === id),
    [state.holdings]
  )

  const value = useMemo(
    () => ({
      ready,
      holdings: state.holdings,
      watchlist: state.watchlist,
      addHolding,
      updateHolding,
      removeHolding,
      toggleWatchlist,
      isWatched,
      getHolding,
    }),
    [
      ready,
      state.holdings,
      state.watchlist,
      addHolding,
      updateHolding,
      removeHolding,
      toggleWatchlist,
      isWatched,
      getHolding,
    ]
  )

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider")
  return ctx
}
