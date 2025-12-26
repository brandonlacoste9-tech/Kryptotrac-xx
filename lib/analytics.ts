"use client"

type EventName = 
  | "view_item" 
  | "begin_checkout" 
  | "purchase" 
  | "sign_up" 
  | "login"
  | "upgrade_view"

type EventProperties = Record<string, string | number | boolean | undefined>

export function trackEvent(name: EventName, properties?: EventProperties) {
  // In a real app, this would send data to Google Analytics, Meta Pixel, or Mixpanel
  // For now, we simulate the "Hardware" telemetry transmission
  
  if (process.env.NODE_ENV === "development") {
    console.groupCollapsed(`[TELEMETRY] Signal Transmitted: ${name}`)
    console.table(properties)
    console.groupEnd()
  }

  // Placeholder for real analytics integration
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', name, properties)
  // }
}
