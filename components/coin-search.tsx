"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, X } from "lucide-react"
import type { SearchCoin } from "@/app/api/search/route"

export function CoinSearch() {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SearchCoin[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
        const data = await res.json()
        if (res.ok) setResults((data.coins as SearchCoin[]) || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 280)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted z-10" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search all coins…"
        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        aria-label="Search all coins"
      />
      {q && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
          onClick={() => {
            setQ("")
            setResults([])
            setOpen(false)
          }}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-[var(--bg-elevated)] shadow-xl overflow-hidden">
          {loading && (
            <p className="px-3 py-3 text-xs text-muted">Searching…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-3 py-3 text-xs text-muted">No results</p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {results.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/coin/${c.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5"
                >
                  <Image
                    src={c.thumb || c.large}
                    alt=""
                    width={22}
                    height={22}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{c.name}</span>
                    <span className="text-[11px] uppercase text-muted">
                      {c.symbol}
                      {c.market_cap_rank != null && ` · #${c.market_cap_rank}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
