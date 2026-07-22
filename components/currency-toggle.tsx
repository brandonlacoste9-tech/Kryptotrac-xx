"use client"

import { useCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { QuoteCurrency } from "@/lib/types"

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()
  const opts: QuoteCurrency[] = ["usd", "cad"]

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-card p-0.5 text-xs font-semibold",
        className
      )}
      role="group"
      aria-label="Display currency"
    >
      {opts.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={cn(
            "rounded-md px-2.5 py-1 uppercase transition-colors",
            currency === c
              ? "bg-accent/20 text-accent"
              : "text-muted hover:text-foreground"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
