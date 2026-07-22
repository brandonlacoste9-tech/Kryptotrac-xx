"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { GitCompare, X } from "lucide-react"
import type { MarketCoin } from "@/lib/types"
import { formatMoney, formatPct, cn } from "@/lib/utils"
import { ChangeBadge } from "@/components/change-badge"
import { Sparkline } from "@/components/sparkline"
import { useCurrency } from "@/lib/currency"
import { CoinSearch } from "@/components/coin-search"
import { ErrorBanner } from "@/components/error-banner"

const PRESETS = [
  ["bitcoin", "ethereum"],
  ["bitcoin", "solana"],
  ["ethereum", "solana"],
]

function CompareInner() {
  const search = useSearchParams()
  const router = useRouter()
  const { currency } = useCurrency()
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const idsFromUrl = useMemo(() => {
    const raw = search.get("ids") || search.get("a")
    if (!raw) return ["bitcoin", "ethereum"]
    if (search.get("a") && search.get("b")) {
      return [search.get("a")!, search.get("b")!, search.get("c")].filter(
        Boolean
      ) as string[]
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4)
  }, [search])

  const load = useCallback(async () => {
    if (idsFromUrl.length === 0) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/compare?ids=${encodeURIComponent(idsFromUrl.join(","))}&vs=${currency}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Compare failed")
      setCoins((data.coins as MarketCoin[]) || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoading(false)
    }
  }, [idsFromUrl, currency])

  useEffect(() => {
    load()
  }, [load])

  function setIds(ids: string[]) {
    const q = ids.filter(Boolean).slice(0, 4).join(",")
    router.push(`/compare?ids=${encodeURIComponent(q)}`)
  }

  function removeId(id: string) {
    setIds(idsFromUrl.filter((x) => x !== id))
  }

  const rows: { label: string; render: (c: MarketCoin) => React.ReactNode }[] =
    [
      {
        label: "Price",
        render: (c) => formatMoney(c.current_price, currency),
      },
      {
        label: "24h %",
        render: (c) => <ChangeBadge value={c.price_change_percentage_24h} />,
      },
      {
        label: "Market cap",
        render: (c) => formatMoney(c.market_cap, currency, true),
      },
      {
        label: "Volume 24h",
        render: (c) => formatMoney(c.total_volume, currency, true),
      },
      {
        label: "Rank",
        render: (c) => `#${c.market_cap_rank ?? "—"}`,
      },
      {
        label: "7d spark",
        render: (c) => (
          <Sparkline
            prices={c.sparkline_in_7d?.price ?? []}
            positive={
              c.price_change_percentage_24h == null
                ? undefined
                : c.price_change_percentage_24h >= 0
            }
          />
        ),
      },
    ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <GitCompare className="h-7 w-7 text-accent" />
          Compare coins
        </h1>
        <p className="mt-1 text-sm text-muted">
          Side-by-side metrics for up to 4 assets.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.join("-")}
            type="button"
            onClick={() => setIds(p)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-accent/40"
          >
            {p.map((x) => x.slice(0, 3).toUpperCase()).join(" vs ")}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Comparing:</span>
        {idsFromUrl.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
          >
            <Link href={`/coin/${id}`} className="hover:text-accent">
              {id}
            </Link>
            <button
              type="button"
              onClick={() => removeId(id)}
              className="text-muted hover:text-danger"
              aria-label={`Remove ${id}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="w-full sm:w-auto sm:ml-auto">
          <p className="text-[10px] text-muted mb-1">
            Search a coin, open it, copy the id from the URL, or use{" "}
            <code className="text-accent">?ids=bitcoin,ethereum</code>
          </p>
          <CoinSearch />
        </div>
      </div>

      {error && (
        <ErrorBanner message={error} onRetry={load} hint="Retry compare load" />
      )}

      {loading && coins.length === 0 ? (
        <div className="h-48 animate-pulse rounded-xl bg-card border border-border" />
      ) : coins.length === 0 ? (
        <p className="text-sm text-muted">No coins loaded.</p>
      ) : (
        <div className="table-scroll rounded-xl border border-border bg-card/40 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wider text-muted font-medium w-28">
                  Metric
                </th>
                {coins.map((c) => (
                  <th key={c.id} className="px-3 py-3 text-center">
                    <Link
                      href={`/coin/${c.id}`}
                      className="inline-flex flex-col items-center gap-1.5 hover:text-accent"
                    >
                      <Image
                        src={c.image}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-full"
                        unoptimized
                      />
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[11px] uppercase text-muted">
                        {c.symbol}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border/60 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3 text-xs text-muted font-medium">
                    {row.label}
                  </td>
                  {coins.map((c) => (
                    <td
                      key={c.id}
                      className={cn(
                        "px-3 py-3 text-center font-mono tabular-nums"
                      )}
                    >
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {coins.length >= 2 && (
        <p className="text-xs text-muted">
          24h delta (first − second):{" "}
          {formatPct(
            (coins[0].price_change_percentage_24h ?? 0) -
              (coins[1].price_change_percentage_24h ?? 0)
          )}
          . Not investment advice.
        </p>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted">Loading compare…</p>}
    >
      <CompareInner />
    </Suspense>
  )
}
