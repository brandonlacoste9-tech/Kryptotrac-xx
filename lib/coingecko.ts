/**
 * CoinGecko Demo keys (CG-…) use api.coingecko.com + x-cg-demo-api-key.
 * Pro keys use pro-api.coingecko.com + x-cg-pro-api-key (set COINGECKO_PRO=true).
 */
const isPro = process.env.COINGECKO_PRO === "true"
const BASE = isPro
  ? "https://pro-api.coingecko.com/api/v3"
  : "https://api.coingecko.com/api/v3"

type CacheEntry = { at: number; data: unknown }
const cache = new Map<string, CacheEntry>()
const TTL_MS = 45_000

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: "application/json" }
  const key = process.env.COINGECKO_API_KEY
  if (key) {
    if (isPro) h["x-cg-pro-api-key"] = key
    else h["x-cg-demo-api-key"] = key
  }
  return h
}

export async function cgFetch<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v != null && v !== "") url.searchParams.set(k, v)
    }
  }
  const key = url.toString()
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data as T
  }

  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 45 },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`CoinGecko ${res.status}: ${body.slice(0, 200) || res.statusText}`)
  }

  const data = (await res.json()) as T
  cache.set(key, { at: Date.now(), data })
  return data
}
