"use client"

import { useEffect, useRef } from "react"
import {
  ADSENSE_ENABLED,
  ADSENSE_PUBLISHER_ID,
  ADSENSE_TEST_MODE,
  getAdSlot,
  type AdSenseSlotKey,
} from "@/lib/adsense"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

export function AdUnit({
  slotKey,
  className,
  label = "Advertisement",
}: {
  slotKey: AdSenseSlotKey
  className?: string
  label?: string
}) {
  const pushed = useRef(false)
  const slot = getAdSlot(slotKey)

  useEffect(() => {
    if (!ADSENSE_ENABLED || !slot || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      /* adblock */
    }
  }, [slot])

  if (!ADSENSE_ENABLED || !slot) return null

  return (
    <aside
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border/60 bg-card/40",
        className
      )}
      aria-label={label}
    >
      <p className="text-[9px] tracking-[0.2em] uppercase text-muted/70 text-center pt-2 pb-1">
        {label}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(ADSENSE_TEST_MODE ? { "data-adtest": "on" } : {})}
      />
    </aside>
  )
}

export function AdBanner({ className }: { className?: string }) {
  return <AdUnit slotKey="display" className={cn("my-6", className)} />
}
