import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUsd(n: number | null | undefined, compact = false): string {
  if (n == null || Number.isNaN(n)) return "—"
  if (compact && Math.abs(n) >= 1e9) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n)
  }
  if (compact && Math.abs(n) >= 1e6) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n)
  }
  const abs = Math.abs(n)
  const digits = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(n)
}

export function formatPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}

export function formatAmount(n: number): string {
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 6 })
  return n.toLocaleString("en-US", { maximumFractionDigits: 8 })
}
