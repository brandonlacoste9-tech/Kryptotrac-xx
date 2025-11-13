"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "kryptotrac_watchlist"
const DEFAULT_WATCHLIST = ["bitcoin", "ethereum", "solana"]

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setWatchlist(JSON.parse(stored))
    } else {
      setWatchlist(DEFAULT_WATCHLIST)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST))
    }
  }, [])

  const addToWatchlist = (coinId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) return prev
      const updated = [...prev, coinId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removeFromWatchlist = (coinId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((id) => id !== coinId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return { watchlist, addToWatchlist, removeFromWatchlist }
}
