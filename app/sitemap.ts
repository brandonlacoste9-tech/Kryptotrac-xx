import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/utils"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const paths = [
    "",
    "/portfolio",
    "/watchlist",
    "/compare",
    "/alerts",
    "/about",
    "/legal/privacy",
  ]
  const now = new Date()
  return paths.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: p === "" ? "hourly" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }))
}
