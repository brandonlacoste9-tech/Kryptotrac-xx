export type MarketCoin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number | null
  total_volume: number
  price_change_percentage_24h: number | null
  sparkline_in_7d?: { price: number[] }
}

export type CoinDetail = {
  id: string
  symbol: string
  name: string
  image: { large: string; small: string; thumb: string }
  description: { en: string }
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    total_volume: { usd: number }
    price_change_percentage_24h: number | null
    price_change_percentage_7d: number | null
    high_24h: { usd: number }
    low_24h: { usd: number }
    ath: { usd: number }
    atl: { usd: number }
  }
  market_cap_rank: number | null
}

export type PriceMap = Record<
  string,
  { usd: number; usd_24h_change?: number }
>

export type Holding = {
  id: string
  symbol: string
  name: string
  amount: number
  /** Total USD paid for this position (optional) */
  costBasisUsd?: number
}

export type PortfolioState = {
  holdings: Holding[]
  watchlist: string[]
}
