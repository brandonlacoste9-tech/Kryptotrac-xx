"use client"

import { useState, useEffect } from "react"
import { fetchCoinsData } from "@/lib/coingecko-api"
import type { CoinData } from "@/types/crypto"

const REFRESH_INTERVAL = 30000 // 30 seconds

export function useCryptoData(coinIds: string[]) {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    if (coinIds.length === 0) {
      setCoins([])
      return
    }

    setLoading(true)
    try {
      const data = await fetchCoinsData(coinIds)
      setCoins(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("[v0] Failed to fetch crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [coinIds.join(",")])

  return {
    coins,
    loading,
    lastUpdated,
    refresh: fetchData,
  }
}
