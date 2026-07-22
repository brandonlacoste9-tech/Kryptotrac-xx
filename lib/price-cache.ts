import type { PriceMap } from "@/lib/types"

const KEY = "kryptotrac-price-cache-v1"

type CacheBlob = {
  at: number
  prices: PriceMap
}

export function loadPriceCache(): CacheBlob | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheBlob
    if (!parsed?.prices || typeof parsed.at !== "number") return null
    return parsed
  } catch {
    return null
  }
}

export function savePriceCache(prices: PriceMap) {
  if (typeof window === "undefined") return
  try {
    const blob: CacheBlob = { at: Date.now(), prices }
    localStorage.setItem(KEY, JSON.stringify(blob))
  } catch {
    /* quota */
  }
}

/** Merge live prices into cache and return the merged map */
export function mergePriceCache(live: PriceMap): PriceMap {
  const prev = loadPriceCache()?.prices ?? {}
  const merged = { ...prev, ...live }
  savePriceCache(merged)
  return merged
}

export function cacheAgeLabel(at: number): string {
  const sec = Math.round((Date.now() - at) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  return `${hr}h ago`
}
