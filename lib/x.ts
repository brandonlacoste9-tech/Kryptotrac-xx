export type XPostPayload = {
  text: string
}

export type XFeedItem = {
  id: string
  text: string
  created_at: string
  author: string
  source: "following" | "search"
}

const REQUIRED_ENV = ["X_BEARER_TOKEN"]

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env: ${name}`)
  }
  return value
}

function ensureEnv() {
  REQUIRED_ENV.forEach(getEnv)
}

export async function fetchCryptoFeedForSymbols(
  symbols: string[],
  limit: number = 30
): Promise<XFeedItem[]> {
  ensureEnv()
  const bearer = getEnv("X_BEARER_TOKEN")

  if (!symbols.length) return []

  const query = symbols.map((s) => `($${s})`).join(" OR ")

  const url = new URL("https://api.x.com/2/tweets/search/recent")
  url.searchParams.set("query", query)
  url.searchParams.set("max_results", String(Math.min(limit, 50)))
  url.searchParams.set("tweet.fields", "created_at,author_id,source")

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  })

  if (!res.ok) {
    console.error("X feed error", await res.text())
    return []
  }

  const data = await res.json()
  const tweets = (data.data ?? []) as any[]

  return tweets.map((t) => ({
    id: t.id,
    text: t.text,
    created_at: t.created_at,
    author: t.author_id ?? "unknown",
    source: "search" as const,
  }))
}

// Minimal posting stub – safe for dev/testing
export async function postToX(payload: XPostPayload): Promise<{ id: string | null; ok: boolean }> {
  console.log("[X POST - STUB]", payload.text)
  return {
    id: globalThis.crypto.randomUUID(),
    ok: true,
  }
}
