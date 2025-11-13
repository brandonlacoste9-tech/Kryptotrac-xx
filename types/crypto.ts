export interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  sparkline_in_7d: {
    price: number[]
  }
}

export interface SearchResult {
  id: string
  name: string
  symbol: string
  image: string
}

export interface PriceAlert {
  id: string
  coinId: string
  coinName: string
  condition: "above" | "below"
  targetPrice: number
  createdAt: Date
}
