export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className || "h-20 w-full"}`} />
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }

  return (
    <div
      className={`${sizeClasses[size]} border-red-500/30 border-t-red-500 rounded-full animate-spin`}
    />
  )
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <LoadingSkeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-1/3" />
            <LoadingSkeleton className="h-3 w-1/4" />
          </div>
          <LoadingSkeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  )
}
