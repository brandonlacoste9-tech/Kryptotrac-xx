const COINGECKO_API = "https://api.coingecko.com/api/v3"
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ""

const CACHE_DURATION = 60000 // 1 minute cache
const cache = new Map<string, { data: any; timestamp: number }>()

// Create headers with API key if available
function getHeaders() {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  }

  if (COINGECKO_API_KEY) {
    headers['x-cg-pro-api-key'] = COINGECKO_API_KEY
  }

  return headers
}

const FALLBACK_TOP_COINS: CoinPrice[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 95000,
    price_change_percentage_24h: 2.5,
    market_cap: 1800000000000,
    total_volume: 45000000000,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3200,
    price_change_percentage_24h: 1.8,
    market_cap: 380000000000,
    total_volume: 20000000000,
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    current_price: 1.00,
    price_change_percentage_24h: 0.01,
    market_cap: 120000000000,
    total_volume: 80000000000,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 180,
    price_change_percentage_24h: 3.2,
    market_cap: 85000000000,
    total_volume: 4000000000,
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 620,
    price_change_percentage_24h: 1.5,
    market_cap: 90000000000,
    total_volume: 2000000000,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 2.20,
    price_change_percentage_24h: 0.8,
    market_cap: 125000000000,
    total_volume: 5000000000,
  },
]

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

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const cacheKey = `search-${query}`
  const cached = getCached<CoinSearchResult[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Failed to search coins")
    const data = await response.json()
    const results = data.coins || []
    setCache(cacheKey, results)
    return results
  } catch (error) {
    console.error("[v0] CoinGecko search error:", error)
    throw error
  }
}

export async function getCoinPrice(coinId: string): Promise<number> {
  const cacheKey = `price-${coinId}`
  const cached = getCached<number>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`,
      { headers: getHeaders() }
    )
    if (!response.ok) throw new Error("Failed to fetch price")
    const data = await response.json()
    const price = data[coinId]?.usd || 0
    setCache(cacheKey, price)
    return price
  } catch (error) {
    console.error("[v0] CoinGecko price error:", error)
    throw error
  }
}

export async function getMultipleCoinPrices(coinIds: string[]): Promise<CoinPrice[]> {
  if (coinIds.length === 0) return []

  const cacheKey = `multi-${coinIds.sort().join(',')}`
  const cached = getCached<CoinPrice[]>(cacheKey)
  if (cached) return cached

  try {
    const idsParam = coinIds.join(",")
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Fetched prices for:", coinIds.length, "coins")
    setCache(cacheKey, data)
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
  const cacheKey = 'trending'
  const cached = getCached<CoinPrice[]>(cacheKey)
  if (cached) {
    console.log("[v0] Returning cached trending coins")
    return cached
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
      { headers: getHeaders() }
    )

    if (response.ok) {
      const data = await response.json()
      setCache(cacheKey, data)
      return data
    }
  } catch {
    // Silently swallow all errors including 429
  }

  setCache(cacheKey, FALLBACK_TOP_COINS)
  return FALLBACK_TOP_COINS
}
