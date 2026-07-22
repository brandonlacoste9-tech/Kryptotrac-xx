import type { Metadata } from "next"
import CoinPageClient from "@/components/coin-page-client"
import { CoinJsonLd } from "@/components/json-ld"
import { cgFetch } from "@/lib/coingecko"
import type { CoinDetail, MarketCoin } from "@/lib/types"
import { siteUrl } from "@/lib/utils"

type Props = { params: Promise<{ id: string }> }

async function fetchCoin(id: string): Promise<CoinDetail | null> {
  try {
    return await cgFetch<CoinDetail>(`/coins/${encodeURIComponent(id)}`, {
      localization: "false",
      tickers: "false",
      market_data: "true",
      community_data: "false",
      developer_data: "false",
      sparkline: "false",
    })
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const markets = await cgFetch<MarketCoin[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "40",
      page: "1",
      sparkline: "false",
    })
    return markets.map((c) => ({ id: c.id }))
  } catch {
    return [
      { id: "bitcoin" },
      { id: "ethereum" },
      { id: "solana" },
      { id: "ripple" },
      { id: "cardano" },
    ]
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const coin = await fetchCoin(id)
  const base = siteUrl()
  if (!coin) {
    return {
      title: "Coin not found",
      robots: { index: false },
    }
  }
  const price = coin.market_data?.current_price?.usd
  const change = coin.market_data?.price_change_percentage_24h
  const priceStr =
    price != null
      ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 6 })}`
      : ""
  const chStr =
    change != null ? ` · 24h ${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : ""
  const title = `${coin.name} (${coin.symbol.toUpperCase()}) price${priceStr ? ` ${priceStr}` : ""}${chStr}`
  const desc = `Live ${coin.name} (${coin.symbol.toUpperCase()}) price${priceStr ? ` is ${priceStr}` : ""}. Track charts, set alerts, and add to your private KryptoTrac portfolio — free, no account.`
  const image = coin.image?.large || coin.image?.small

  return {
    title,
    description: desc,
    alternates: { canonical: `${base}/coin/${coin.id}` },
    openGraph: {
      title: `${coin.name} price · KryptoTrac`,
      description: desc,
      url: `${base}/coin/${coin.id}`,
      type: "website",
      ...(image ? { images: [{ url: image, alt: coin.name }] } : {}),
    },
    twitter: {
      card: "summary",
      title: `${coin.name} (${coin.symbol.toUpperCase()}) price`,
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function CoinPage({ params }: Props) {
  const { id } = await params
  const coin = await fetchCoin(id)
  const plain = coin?.description?.en?.replace(/<[^>]+>/g, "") ?? ""

  return (
    <>
      {coin && (
        <CoinJsonLd
          id={coin.id}
          name={coin.name}
          symbol={coin.symbol}
          description={plain}
          image={coin.image?.large}
          priceUsd={coin.market_data?.current_price?.usd}
        />
      )}
      {/* Crawlable summary for bots; interactive UI hydrates client */}
      {coin && (
        <article className="sr-only">
          <h1>
            {coin.name} ({coin.symbol.toUpperCase()}) price
          </h1>
          {coin.market_data?.current_price?.usd != null && (
            <p>
              Current price: ${coin.market_data.current_price.usd} USD. Market
              cap rank: #{coin.market_cap_rank ?? "n/a"}.
            </p>
          )}
          {plain && <p>{plain.slice(0, 500)}</p>}
        </article>
      )}
      <CoinPageClient initialId={id} />
    </>
  )
}
