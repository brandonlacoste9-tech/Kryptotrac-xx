"use client"

import Link from "next/link"
import { usePortfolio } from "@/lib/portfolio"
import { useCurrency } from "@/lib/currency"
import { formatAmount, formatMoney, fromUsd } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function TransactionList() {
  const { transactions, removeTransaction, clearTransactions } = usePortfolio()
  const { currency, usdToCad } = useCurrency()

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted">
        Buys, sells, and manual adjustments will show up here.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">
          Transaction history
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all transaction history? Holdings stay intact.")) {
              clearTransactions()
            }
          }}
          className="text-[11px] text-danger hover:underline"
        >
          Clear log
        </button>
      </div>
      <ul className="max-h-72 overflow-y-auto divide-y divide-border/60">
        {transactions.slice(0, 80).map((tx) => {
          const total = fromUsd(tx.totalUsd, currency, usdToCad)
          const badge =
            tx.type === "buy"
              ? "bg-success/15 text-success"
              : tx.type === "sell"
                ? "bg-danger/15 text-danger"
                : "bg-muted/20 text-muted"
          return (
            <li
              key={tx.id}
              className="flex items-start gap-3 px-3 py-2.5 text-sm"
            >
              <span
                className={cn(
                  "mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  badge
                )}
              >
                {tx.type}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/coin/${tx.coinId}`}
                  className="font-medium hover:text-accent"
                >
                  {formatAmount(tx.amount)} {tx.symbol.toUpperCase()}
                </Link>
                <p className="text-[11px] text-muted">
                  {new Date(tx.createdAt).toLocaleString()}
                  {total != null && ` · ${formatMoney(total, currency)}`}
                  {tx.note && ` · ${tx.note}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeTransaction(tx.id)}
                className="text-[11px] text-muted hover:text-danger"
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
