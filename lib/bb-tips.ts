import { createClient } from '@/lib/supabase/server'

// Tip trigger conditions
export const TIP_TRIGGERS = {
  whale_movement: { threshold: 1000000, frequency: 'hourly', severity: 'high' },
  sentiment_spike: { threshold: 200, frequency: 'every_4h', severity: 'medium' },
  price_breakout: { threshold: 5, frequency: 'real_time', severity: 'high' },
  unusual_volume: { threshold: 150, frequency: 'hourly', severity: 'medium' },
  flash_crash: { threshold: -10, frequency: 'real_time', severity: 'critical' },
  accumulation: { threshold: 7, frequency: 'daily', severity: 'low' },
} as const

// Tip delivery limits based on user tier
export const TIP_LIMITS = {
  free: { per_week: 2, priority: 'low', instant: false },
  starter: { per_week: 5, priority: 'medium', instant: false },
  pro: { per_week: 10, priority: 'high', instant: true },
  elite: { per_week: 999, priority: 'instant', instant: true },
} as const

export type TipTrigger = keyof typeof TIP_TRIGGERS
export type TipSeverity = 'low' | 'medium' | 'high' | 'critical'
export type UserTier = keyof typeof TIP_LIMITS

interface TipData {
  coin: string
  event: string
  amount?: string
  percent?: number
  level?: string
  implication: string
}

// Tip message templates (BB's voice)
const TIP_TEMPLATES = {
  whale_movement: (data: TipData) =>
    `Psst... Bee. Just saw a whale move $${data.amount} worth of ${data.coin}. Could mean volatility incoming. Not financial advice, just FYI. I got you. 👀`,

  sentiment_spike: (data: TipData) =>
    `Yo hold up. ${data.coin} social volume spiked ${data.percent}%. Classic ${data.implication} signal. Just sayin'... be careful. I got you.`,

  price_breakout: (data: TipData) =>
    `Bro... ${data.coin} just broke $${data.level} on high volume. ${data.implication}. Thought you should know. I got you. 👀`,

  unusual_volume: (data: TipData) =>
    `Not sure what's happening but ${data.coin} volume is ${data.percent}% above average. ${data.implication}. Keep an eye on it. I got you.`,

  flash_crash: (data: TipData) =>
    `YO! ${data.coin} just dropped ${data.percent}% in minutes. ${data.implication}. Stay calm, check your stop losses. I got you. 🚨`,

  accumulation: (data: TipData) =>
    `Noticed something... ${data.coin} has been quietly ${data.event} for ${data.amount} days. ${data.implication}. Just FYI. I got you.`,
}

// Generate tip based on trigger and data
export async function generateTip(
  trigger: TipTrigger,
  data: TipData,
  userId: string
): Promise<TipNotification | null> {
  const supabase = await createClient()

  // Get user tier
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single()

  const userTier = (subscription?.tier || 'free') as UserTier

  // Check if user has exceeded tip limits for the week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { count } = await supabase
    .from('bb_tips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString())

  const tipLimit = TIP_LIMITS[userTier].per_week
  if (count !== null && count >= tipLimit) {
    return null // User hit their weekly limit
  }

  // Generate tip message
  const template = TIP_TEMPLATES[trigger]
  const message = template(data)

  // Determine haptic pattern based on severity
  const severity = TIP_TRIGGERS[trigger].severity
  const hapticPattern = getHapticPattern(severity)

  // Save tip to database
  await supabase.from('bb_tips').insert({
    user_id: userId,
    trigger_type: trigger,
    severity,
    message,
    coin: data.coin,
    read: false,
  })

  return {
    id: crypto.randomUUID(),
    message,
    haptic: hapticPattern,
    priority: TIP_LIMITS[userTier].priority,
    severity,
    disclaimer: 'Not financial advice. Just FYI.',
    signature: 'I got you. 👀',
    instant: TIP_LIMITS[userTier].instant,
  }
}

// Get haptic pattern based on severity
function getHapticPattern(severity: TipSeverity): number[] {
  switch (severity) {
    case 'critical':
      return [100, 50, 100, 50, 300] // Critical alert
    case 'high':
      return [50, 30, 100] // BB tip alert
    case 'medium':
      return [50, 30, 50] // Opportunity
    case 'low':
      return [30, 20, 30] // Gentle notification
  }
}

export interface TipNotification {
  id: string
  message: string
  haptic: number[]
  priority: string
  severity: TipSeverity
  disclaimer: string
  signature: string
  instant: boolean
}

// Check user's watchlist and generate relevant tips
export async function checkWatchlistForTips(userId: string) {
  const supabase = await createClient()

  // Get user's watchlist
  const { data: watchlist } = await supabase
    .from('user_watchlists')
    .select('coin_id')
    .eq('user_id', userId)

  if (!watchlist || watchlist.length === 0) return []

  const tips: TipNotification[] = []

  // Check each coin for tip triggers (in production, this would use real market data)
  for (const item of watchlist) {
    // Placeholder: In production, integrate with CoinGecko or real-time data feed
    // For now, simulate tip detection
    const shouldTip = Math.random() > 0.9 // 10% chance for demo

    if (shouldTip) {
      const tip = await generateTip(
        'price_breakout',
        {
          coin: item.coin_id,
          event: 'broke resistance',
          level: '50000',
          implication: 'Could be start of a leg up',
        },
        userId
      )
      if (tip) tips.push(tip)
    }
  }

  return tips
}
