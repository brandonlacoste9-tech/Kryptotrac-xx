"use client"

import { cn } from "@/lib/utils"

export const CATEGORY_OPTIONS = [
  { id: "", label: "All" },
  { id: "decentralized-finance-defi", label: "DeFi" },
  { id: "layer-1", label: "L1" },
  { id: "layer-2", label: "L2" },
  { id: "meme-token", label: "Meme" },
  { id: "smart-contract-platform", label: "Smart contracts" },
  { id: "artificial-intelligence", label: "AI" },
  { id: "gaming", label: "Gaming" },
] as const

export function CategoryFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="group"
      aria-label="Market category"
    >
      {CATEGORY_OPTIONS.map((c) => (
        <button
          key={c.id || "all"}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
            value === c.id
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-border bg-card text-muted hover:text-foreground hover:border-border"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
