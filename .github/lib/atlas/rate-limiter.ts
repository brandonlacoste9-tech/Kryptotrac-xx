import { createServerClient } from '@/lib/supabase/server'

export type PlanTier = 'free' | 'starter' | 'pro' | 'elite'

const RATE_LIMITS: Record<PlanTier, number> = {
  free: 20,
  starter: 200,
  pro: -1, // unlimited
  elite: -1, // unlimited
}

export async function checkAtlasRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  resetAt: Date
}> {
  const supabase = await createServerClient()

  // Get user's plan tier
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan_type, status')
    .eq('user_id', userId)
    .single()

  const planTier: PlanTier = subscription?.status === 'active' 
    ? (subscription.plan_type as PlanTier) 
    : 'free'

  const limit = RATE_LIMITS[planTier]

  // Unlimited for Pro/Elite
  if (limit === -1) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  }

  // Count queries in last 24h
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
