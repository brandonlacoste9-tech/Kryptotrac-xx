const BASE = "https://api.coingecko.com/api/v3"

type CacheEntry = { at: number; data: unknown }
const cache = new Map<string, CacheEntry>()
const TTL_MS = 45_000

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: "application/json" }
  const key = process.env.COINGECKO_API_KEY
  if (key) {
    // Demo/Pro header names — CoinGecko accepts x-cg-demo-api-key or x-cg-pro-api-key
    h["x-cg-demo-api-key"] = key
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
