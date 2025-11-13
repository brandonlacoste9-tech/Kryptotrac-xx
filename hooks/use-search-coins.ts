"use client"

import { useState, useEffect } from "react"
import { searchCoins } from "@/lib/coingecko-api"
import type { SearchResult } from "@/types/crypto"

export function useSearchCoins(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchDebounced = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchCoins(query)
        setResults(data)
      } catch (error) {
        console.error("[v0] Search failed:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounced)
  }, [query])

  return { results, loading }
}
