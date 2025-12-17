import { createServerClient } from '@/lib/supabase/server'

// Optimized 2-tier model for better conversion
export type PlanTier = 'free' | 'pro'

// Subscription tier limits
export const TIER_LIMITS = {
  free: {
    maxCoins: 5,
    maxAlerts: 3,
    maxDeFiWallets: 1,
    bbQueriesPerDay: 20,
    hasCouncilMode: false,
    hasAIInsights: false,
    hasEmailDigests: false,
    hasPortfolioSnapshots: false,
    hasExport: false,
  },
  pro: {
    maxCoins: -1,        // unlimited
    maxAlerts: -1,       // unlimited
    maxDeFiWallets: 10,  // generous limit
    bbQueriesPerDay: -1, // unlimited
    hasCouncilMode: true,
    hasAIInsights: true,
    hasEmailDigests: true,
    hasPortfolioSnapshots: true,
    hasExport: true,
  },
} as const

// BB AI Query Rate Limits
const BB_RATE_LIMITS: Record<PlanTier, number> = {
  free: 20,   // 20 queries per day
  pro: -1,    // unlimited
}

export async function checkAtlasRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  resetAt: Date
  planTier: PlanTier
}> {
  const supabase = await createServerClient()

  // Get user's plan tier
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan_type, status')
    .eq('user_id', userId)
    .single()

  const planTier: PlanTier = subscription?.status === 'active' && subscription?.plan_type === 'pro'
    ? 'pro'
    : 'free'

  const limit = BB_RATE_LIMITS[planTier]

  // Unlimited for Pro
  if (limit === -1) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      planTier,
    }
  }

  // Count queries in last 24h for free users
  const { data: queries } = await supabase
    .from('atlas_query_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const count = queries || 0
  const remaining = Math.max(0, limit - count)

  return {
    allowed: remaining > 0,
    remaining,
    limit,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    planTier,
  }
}

export async function logAtlasQuery(
  userId: string,
  query: string,
  response: string,
  mode: string
): Promise<void> {
  const supabase = await createServerClient()

  await supabase.from('atlas_query_log').insert({
    user_id: userId,
    query_text: query,
    response_text: response,
    mode,
  })
}

export async function updateAtlasMemory(
  userId: string,
  query: string,
  emotionalTag?: string
): Promise<void> {
  const supabase = await createServerClient()

  // Get existing state
  const { data: state } = await supabase
    .from('atlas_user_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  const lastQueries = state?.last_queries || []
  const updatedQueries = [query, ...lastQueries].slice(0, 10)

  const emotionalTags = state?.emotional_tags || []
  if (emotionalTag && !emotionalTags.includes(emotionalTag)) {
    emotionalTags.push(emotionalTag)
  }

  if (state) {
    await supabase
      .from('atlas_user_state')
      .update({
        last_queries: updatedQueries,
        emotional_tags: emotionalTags.slice(0, 20),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } else {
    await supabase.from('atlas_user_state').insert({
      user_id: userId,
      last_queries: updatedQueries,
      emotional_tags: emotionalTag ? [emotionalTag] : [],
    })
  }
}

// Helper to check if user has access to a feature
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof TIER_LIMITS.pro
): Promise<boolean> {
  const supabase = await createServerClient()

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan_type, status')
    .eq('user_id', userId)
    .single()

  const planTier: PlanTier = subscription?.status === 'active' && subscription?.plan_type === 'pro'
    ? 'pro'
    : 'free'

  return TIER_LIMITS[planTier][feature] as boolean
}

// Helper to get user's current limits
export async function getUserLimits(userId: string) {
  const supabase = await createServerClient()

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan_type, status')
    .eq('user_id', userId)
    .single()

  const planTier: PlanTier = subscription?.status === 'active' && subscription?.plan_type === 'pro'
    ? 'pro'
    : 'free'

  return TIER_LIMITS[planTier]
}
