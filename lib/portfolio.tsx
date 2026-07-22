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
import type { Holding, PortfolioBackup, PortfolioState } from "@/lib/types"

const STORAGE_KEY = "kryptotrac-portfolio-v1"

const defaultState: PortfolioState = { holdings: [], watchlist: [] }

type PortfolioContextValue = {
  ready: boolean
  holdings: Holding[]
  watchlist: string[]
  addHolding: (h: Omit<Holding, "amount"> & { amount: number }) => void
  updateHolding: (
    id: string,
    patch: Partial<Pick<Holding, "amount" | "costBasisUsd">>
  ) => void
  removeHolding: (id: string) => void
  toggleWatchlist: (id: string) => void
  isWatched: (id: string) => boolean
  getHolding: (id: string) => Holding | undefined
  exportBackup: () => PortfolioBackup
  importBackup: (data: unknown, mode: "merge" | "replace") => { ok: boolean; message: string }
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
          .map((x) => {
            if (x.id !== id) return x
            const next = { ...x, ...patch }
            if (patch.costBasisUsd === undefined && "costBasisUsd" in patch) {
              delete next.costBasisUsd
            }
            return next
          })
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

  const exportBackup = useCallback((): PortfolioBackup => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      holdings: state.holdings,
      watchlist: state.watchlist,
    }
  }, [state.holdings, state.watchlist])

  const importBackup = useCallback((data: unknown, mode: "merge" | "replace") => {
    try {
      const parsed = data as PortfolioBackup
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.holdings)) {
        return { ok: false, message: "Invalid backup file" }
      }
      const holdings = parsed.holdings.filter(
        (h) => h && typeof h.id === "string" && typeof h.amount === "number" && h.amount > 0
      )
      const watchlist = Array.isArray(parsed.watchlist)
        ? parsed.watchlist.filter((id) => typeof id === "string")
        : []

      if (mode === "replace") {
        setState({ holdings, watchlist })
        return { ok: true, message: `Restored ${holdings.length} holdings` }
      }

      setState((prev) => {
        const map = new Map(prev.holdings.map((h) => [h.id, { ...h }]))
        for (const h of holdings) {
          const ex = map.get(h.id)
          if (ex) {
            map.set(h.id, {
              ...ex,
              amount: ex.amount + h.amount,
              costBasisUsd:
                h.costBasisUsd != null
                  ? (ex.costBasisUsd ?? 0) + h.costBasisUsd
                  : ex.costBasisUsd,
            })
          } else {
            map.set(h.id, h)
          }
        }
        const wl = new Set([...prev.watchlist, ...watchlist])
        return { holdings: [...map.values()], watchlist: [...wl] }
      })
      return { ok: true, message: `Merged ${holdings.length} holdings` }
    } catch {
      return { ok: false, message: "Could not read backup" }
    }
  }, [])

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
      exportBackup,
      importBackup,
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
      exportBackup,
      importBackup,
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
