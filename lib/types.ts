export type QuoteCurrency = "usd" | "cad"

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
    current_price: { usd: number; cad?: number }
    market_cap: { usd: number; cad?: number }
    total_volume: { usd: number; cad?: number }
    price_change_percentage_24h: number | null
    price_change_percentage_7d: number | null
    high_24h: { usd: number; cad?: number }
    low_24h: { usd: number; cad?: number }
    ath: { usd: number; cad?: number }
    atl: { usd: number; cad?: number }
  }
  market_cap_rank: number | null
}

/** CoinGecko simple/price shape for one or more quote currencies */
export type PriceMap = Record<
  string,
  {
    usd?: number
    cad?: number
    usd_24h_change?: number
    cad_24h_change?: number
  }
>

export type Holding = {
  id: string
  symbol: string
  name: string
  amount: number
  /** Total paid for this position, in USD (convert for CAD display) */
  costBasisUsd?: number
}

export type TxType = "buy" | "sell" | "adjust"

export type Transaction = {
  id: string
  coinId: string
  symbol: string
  name: string
  type: TxType
  amount: number
  /** Price per unit in USD at time of tx (optional) */
  priceUsd?: number
  /** Total USD for this fill (amount * price or cost entered) */
  totalUsd?: number
  note?: string
  createdAt: string
}

export type PortfolioState = {
  holdings: Holding[]
  watchlist: string[]
  transactions: Transaction[]
}

export type ChartPoint = [number, number] // [timestamp ms, price]

export type PortfolioBackup = {
  version: 1 | 2
  exportedAt: string
  currency?: QuoteCurrency
  holdings: Holding[]
  watchlist: string[]
  transactions?: Transaction[]
}
