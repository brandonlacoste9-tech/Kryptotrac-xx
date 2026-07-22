"use client"

import { RefreshCw } from "lucide-react"

export function ErrorBanner({
  message,
  onRetry,
  hint,
}: {
  message: string
  onRetry?: () => void
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p>{message}</p>
        {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-danger/40 bg-background/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  )
}
