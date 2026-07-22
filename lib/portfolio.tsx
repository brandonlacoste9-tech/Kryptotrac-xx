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
import type {
  Holding,
  PortfolioBackup,
  PortfolioState,
  Transaction,
  TxType,
} from "@/lib/types"

const STORAGE_KEY = "kryptotrac-portfolio-v1"

const defaultState: PortfolioState = {
  holdings: [],
  watchlist: [],
  transactions: [],
}

type PortfolioContextValue = {
  ready: boolean
  holdings: Holding[]
  watchlist: string[]
  transactions: Transaction[]
  addHolding: (
    h: Omit<Holding, "amount"> & { amount: number },
    opts?: { priceUsd?: number; note?: string }
  ) => void
  sellHolding: (
    id: string,
    amount: number,
    opts?: { priceUsd?: number; note?: string }
  ) => { ok: boolean; message: string }
  updateHolding: (
    id: string,
    patch: Partial<Pick<Holding, "amount" | "costBasisUsd">>
  ) => void
  removeHolding: (id: string) => void
  toggleWatchlist: (id: string) => void
  isWatched: (id: string) => boolean
  getHolding: (id: string) => Holding | undefined
  removeTransaction: (txId: string) => void
  clearTransactions: () => void
  exportBackup: () => PortfolioBackup
  importBackup: (
    data: unknown,
    mode: "merge" | "replace"
  ) => { ok: boolean; message: string }
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
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
    }
  } catch {
    return defaultState
  }
}

function makeTx(
  partial: Omit<Transaction, "id" | "createdAt">
): Transaction {
  return {
    ...partial,
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
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
    (
      h: Omit<Holding, "amount"> & { amount: number },
      opts?: { priceUsd?: number; note?: string }
    ) => {
      const totalUsd =
        opts?.priceUsd != null
          ? h.amount * opts.priceUsd
          : h.costBasisUsd
      const tx = makeTx({
        coinId: h.id,
        symbol: h.symbol,
        name: h.name,
        type: "buy" as TxType,
        amount: h.amount,
        priceUsd: opts?.priceUsd,
        totalUsd,
        note: opts?.note,
      })

      setState((prev) => {
        const existing = prev.holdings.find((x) => x.id === h.id)
        let holdings: Holding[]
        if (existing) {
          holdings = prev.holdings.map((x) =>
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
          )
        } else {
          holdings = [...prev.holdings, h]
        }
        return {
          ...prev,
          holdings,
          transactions: [tx, ...prev.transactions].slice(0, 500),
        }
      })
    },
    []
  )

  const sellHolding = useCallback(
    (
      id: string,
      amount: number,
      opts?: { priceUsd?: number; note?: string }
    ) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: "Invalid amount" }
      }
      let message = ""
      let ok = false
      setState((prev) => {
        const h = prev.holdings.find((x) => x.id === id)
        if (!h) {
          message = "Holding not found"
          return prev
        }
        if (amount > h.amount + 1e-12) {
          message = "Cannot sell more than you hold"
          return prev
        }
        ok = true
        const ratio = h.amount > 0 ? amount / h.amount : 0
        const costRemoved =
          h.costBasisUsd != null ? h.costBasisUsd * ratio : undefined
        const remaining = h.amount - amount
        const holdings =
          remaining <= 1e-12
            ? prev.holdings.filter((x) => x.id !== id)
            : prev.holdings.map((x) =>
                x.id === id
                  ? {
                      ...x,
                      amount: remaining,
                      costBasisUsd:
                        costRemoved != null && x.costBasisUsd != null
                          ? Math.max(0, x.costBasisUsd - costRemoved)
                          : x.costBasisUsd,
                    }
                  : x
              )
        const tx = makeTx({
          coinId: h.id,
          symbol: h.symbol,
          name: h.name,
          type: "sell",
          amount,
          priceUsd: opts?.priceUsd,
          totalUsd:
            opts?.priceUsd != null ? amount * opts.priceUsd : costRemoved,
          note: opts?.note,
        })
        message = `Sold ${amount} ${h.symbol.toUpperCase()}`
        return {
          ...prev,
          holdings,
          transactions: [tx, ...prev.transactions].slice(0, 500),
        }
      })
      return { ok, message: message || "Sell failed" }
    },
    []
  )

  const updateHolding = useCallback(
    (id: string, patch: Partial<Pick<Holding, "amount" | "costBasisUsd">>) => {
      setState((prev) => {
        const before = prev.holdings.find((x) => x.id === id)
        const holdings = prev.holdings
          .map((x) => {
            if (x.id !== id) return x
            const next = { ...x, ...patch }
            if (patch.costBasisUsd === undefined && "costBasisUsd" in patch) {
              delete next.costBasisUsd
            }
            return next
          })
          .filter((x) => x.amount > 0)

        let transactions = prev.transactions
        if (
          before &&
          patch.amount != null &&
          Math.abs(patch.amount - before.amount) > 1e-12
        ) {
          const delta = patch.amount - before.amount
          const tx = makeTx({
            coinId: before.id,
            symbol: before.symbol,
            name: before.name,
            type: "adjust",
            amount: Math.abs(delta),
            note: delta > 0 ? "Manual increase" : "Manual decrease",
          })
          transactions = [tx, ...transactions].slice(0, 500)
        }

        return { ...prev, holdings, transactions }
      })
    },
    []
  )

  const removeHolding = useCallback((id: string) => {
    setState((prev) => {
      const h = prev.holdings.find((x) => x.id === id)
      const holdings = prev.holdings.filter((x) => x.id !== id)
      if (!h) return { ...prev, holdings }
      const tx = makeTx({
        coinId: h.id,
        symbol: h.symbol,
        name: h.name,
        type: "sell",
        amount: h.amount,
        totalUsd: h.costBasisUsd,
        note: "Position removed",
      })
      return {
        ...prev,
        holdings,
        transactions: [tx, ...prev.transactions].slice(0, 500),
      }
    })
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

  const removeTransaction = useCallback((txId: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== txId),
    }))
  }, [])

  const clearTransactions = useCallback(() => {
    setState((prev) => ({ ...prev, transactions: [] }))
  }, [])

  const exportBackup = useCallback((): PortfolioBackup => {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      holdings: state.holdings,
      watchlist: state.watchlist,
      transactions: state.transactions,
    }
  }, [state.holdings, state.watchlist, state.transactions])

  const importBackup = useCallback(
    (data: unknown, mode: "merge" | "replace") => {
      try {
        const parsed = data as PortfolioBackup
        if (!parsed || !Array.isArray(parsed.holdings)) {
          return { ok: false, message: "Invalid backup file" }
        }
        const holdings = parsed.holdings.filter(
          (h) =>
            h &&
            typeof h.id === "string" &&
            typeof h.amount === "number" &&
            h.amount > 0
        )
        const watchlist = Array.isArray(parsed.watchlist)
          ? parsed.watchlist.filter((id) => typeof id === "string")
          : []
        const transactions = Array.isArray(parsed.transactions)
          ? parsed.transactions
          : []

        if (mode === "replace") {
          setState({ holdings, watchlist, transactions })
          return {
            ok: true,
            message: `Restored ${holdings.length} holdings, ${transactions.length} txs`,
          }
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
          return {
            holdings: [...map.values()],
            watchlist: [...wl],
            transactions: [...transactions, ...prev.transactions].slice(0, 500),
          }
        })
        return { ok: true, message: `Merged ${holdings.length} holdings` }
      } catch {
        return { ok: false, message: "Could not read backup" }
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      ready,
      holdings: state.holdings,
      watchlist: state.watchlist,
      transactions: state.transactions,
      addHolding,
      sellHolding,
      updateHolding,
      removeHolding,
      toggleWatchlist,
      isWatched,
      getHolding,
      removeTransaction,
      clearTransactions,
      exportBackup,
      importBackup,
    }),
    [
      ready,
      state.holdings,
      state.watchlist,
      state.transactions,
      addHolding,
      sellHolding,
      updateHolding,
      removeHolding,
      toggleWatchlist,
      isWatched,
      getHolding,
      removeTransaction,
      clearTransactions,
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
