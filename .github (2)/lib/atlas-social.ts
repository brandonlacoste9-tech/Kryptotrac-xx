import type { XFeedItem } from "@/lib/x"

export function summarizeXFeedForLLM(items: XFeedItem[]): string {
  if (!items.length) return "No meaningful recent X activity detected."

  const texts = items.map((i) => i.text.toLowerCase())

  const scoreWord = (word: string) =>
    texts.reduce((acc, t) => acc + (t.includes(word) ? 1 : 0), 0)

  const hype = scoreWord("moon") + scoreWord("pump") + scoreWord("bull")
  const fear = scoreWord("dump") + scoreWord("rug") + scoreWord("bear")
  const scam = scoreWord("scam") + scoreWord("rugpull")

  const total = items.length || 1
  const hypeRatio = hype / total
  const fearRatio = fear / total
  const scamRatio = scam / total

  let vibe = "neutral/mixed"
  if (hypeRatio > 0.25 && fearRatio < 0.15) vibe = "hype/bullish"
  if (fearRatio > 0.25 && hypeRatio < 0.15) vibe = "fearful/bearish"
  if (scamRatio > 0.1) vibe = "scam/concern-heavy"

  const sample = items
    .slice(0, 5)
    .map((i) => `- ${i.text}`)
    .join("\n")

  return `
Social sentiment summary (X):

- Approximate vibe: ${vibe}
- Hype mentions: ${hype}
- Fear mentions: ${fear}
- Scam/Rug mentions: ${scam}
- Sample posts:
${sample}
`.trim()
}
