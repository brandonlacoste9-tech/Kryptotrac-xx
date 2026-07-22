/**
 * Google AdSense — same publisher as other portfolio sites.
 * Enable Auto ads in AdSense console; optional slot IDs via env.
 */
export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-4276130467303652"

export const ADSENSE_PUB_ID_FOR_ADS_TXT = ADSENSE_PUBLISHER_ID.replace(
  /^ca-/,
  ""
)

export const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false" &&
  ADSENSE_PUBLISHER_ID.startsWith("ca-pub-")

export const ADSENSE_TEST_MODE =
  process.env.NEXT_PUBLIC_ADSENSE_TEST === "true" ||
  process.env.NODE_ENV === "development"

export const ADSENSE_SLOTS = {
  display: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY ?? "",
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "",
} as const

export type AdSenseSlotKey = keyof typeof ADSENSE_SLOTS

export function getAdSlot(key: AdSenseSlotKey): string | null {
  const slot = ADSENSE_SLOTS[key]
  return slot && /^\d+$/.test(slot) ? slot : null
}

export function getAdsTxtBody(): string {
  return `google.com, ${ADSENSE_PUB_ID_FOR_ADS_TXT}, DIRECT, f08c47fec0942fa0\n`
}
