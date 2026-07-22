import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { QuoteCurrency } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(
  n: number | null | undefined,
  currency: QuoteCurrency = "usd",
  compact = false
): string {
  if (n == null || Number.isNaN(n)) return "—"
  const code = currency.toUpperCase()
  const locale = currency === "cad" ? "en-CA" : "en-US"
  if (compact && Math.abs(n) >= 1e6) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n)
  }
  const abs = Math.abs(n)
  const digits = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(n)
}

/** @deprecated use formatMoney */
export function formatUsd(n: number | null | undefined, compact = false): string {
  return formatMoney(n, "usd", compact)
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

export function currencyLabel(c: QuoteCurrency): string {
  return c === "cad" ? "CAD" : "USD"
}

/** Convert USD amount to quote currency using usd→quote rate (cad per 1 usd) */
export function fromUsd(
  amountUsd: number | null | undefined,
  currency: QuoteCurrency,
  usdToCad: number
): number | null {
  if (amountUsd == null || Number.isNaN(amountUsd)) return null
  if (currency === "usd") return amountUsd
  return amountUsd * usdToCad
}

export function toUsd(
  amount: number,
  currency: QuoteCurrency,
  usdToCad: number
): number {
  if (currency === "usd") return amount
  return usdToCad > 0 ? amount / usdToCad : amount
}

export function priceFromMap(
  map: { usd?: number; cad?: number } | undefined,
  currency: QuoteCurrency
): number | null {
  if (!map) return null
  const v = currency === "cad" ? map.cad ?? map.usd : map.usd
  return v ?? null
}

export function changeFromMap(
  map: { usd_24h_change?: number; cad_24h_change?: number } | undefined,
  currency: QuoteCurrency
): number | null {
  if (!map) return null
  if (currency === "cad" && map.cad_24h_change != null) return map.cad_24h_change
  return map.usd_24h_change ?? null
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://kryptotrac.netlify.app"
  )
}
