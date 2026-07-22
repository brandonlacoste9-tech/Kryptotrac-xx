import type { MetadataRoute } from "next"
import { cgFetch } from "@/lib/coingecko"
import type { MarketCoin } from "@/lib/types"
import { siteUrl } from "@/lib/utils"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const now = new Date()

  const staticPaths = [
    { path: "", priority: 1, changeFrequency: "hourly" as const },
    { path: "/portfolio", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/watchlist", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/compare", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/alerts", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    {
      path: "/legal/privacy",
      priority: 0.5,
      changeFrequency: "monthly" as const,
    },
  ]

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p.path || "/"}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  try {
    const markets = await cgFetch<MarketCoin[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "100",
      page: "1",
      sparkline: "false",
    })
    for (const c of markets) {
      entries.push({
        url: `${base}/coin/${c.id}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.85,
      })
    }
  } catch {
    for (const id of ["bitcoin", "ethereum", "solana", "ripple", "cardano"]) {
      entries.push({
        url: `${base}/coin/${id}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.85,
      })
    }
  }

  return entries
}
