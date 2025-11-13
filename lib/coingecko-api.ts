import type { CoinData, SearchResult } from "@/types/crypto"

const BASE_URL = "https://api.coingecko.com/api/v3"

export async function fetchCoinsData(coinIds: string[]): Promise<CoinData[]> {
  const ids = coinIds.join(",")
  const response = await fetch(
    `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
    { next: { revalidate: 30 } },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch coin data")
  }

  return response.json()
}

export async function searchCoins(query: string): Promise<SearchResult[]> {
  const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`)

  if (!response.ok) {
    throw new Error("Failed to search coins")
  }

  const data = await response.json()
  return data.coins.slice(0, 10).map((coin: any) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.thumb || coin.large,
  }))
}

export async function fetchCoinDetails(coinId: string) {
  const response = await fetch(
    `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
    { next: { revalidate: 60 } },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch coin details")
  }

  return response.json()
}

export async function fetchCoinChart(coinId: string, days = 7) {
  const response = await fetch(`${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`, {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch chart data")
  }

  return response.json()
}
