const COINGECKO_API = "https://api.coingecko.com/api/v3"

export interface CoinSearchResult {
  id: string
  symbol: string
  name: string
  thumb: string
  large: string
}

export interface CoinPrice {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  sparkline_in_7d?: {
    price: number[]
  }
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  try {
    const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Failed to search coins")
    const data = await response.json()
    return data.coins || []
  } catch (error) {
    console.error("[v0] CoinGecko search error:", error)
    throw error
  }
}

export async function getCoinPrice(coinId: string): Promise<number> {
  try {
    const response = await fetch(`${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`)
    if (!response.ok) throw new Error("Failed to fetch price")
    const data = await response.json()
    return data[coinId]?.usd || 0
  } catch (error) {
    console.error("[v0] CoinGecko price error:", error)
    throw error
  }
}

export async function getMultipleCoinPrices(coinIds: string[]): Promise<CoinPrice[]> {
  if (coinIds.length === 0) return []

  try {
    const idsParam = coinIds.join(",")
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Fetched prices for:", coinIds.length, "coins")
    return data
  } catch (error) {
    console.error("[v0] CoinGecko multi-price error:", error)
    throw error
  }
}

export async function fetchCoinPrices(coinIds: string[]): Promise<CoinPrice[]> {
  return getMultipleCoinPrices(coinIds)
}

export async function getTrendingCoins(): Promise<CoinPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trending: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] CoinGecko trending error:", error)
    throw error
  }
}
