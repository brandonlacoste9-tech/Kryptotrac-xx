import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { taintUniqueValue } from '@/lib/taint'

// Taint sensitive environment variables used in this route
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  taintUniqueValue(
    'SUPABASE_SERVICE_ROLE_KEY must not be sent to the client',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.email?.endsWith('@kryptotrac.com') || 
                    process.env.ADMIN_EMAILS?.split(',').includes(profile?.email || '')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: { persistSession: false }
      }
    )

    const { data: subscriptions, error: subError } = await adminSupabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')

    if (subError && !subError.message.includes('does not exist')) {
      throw subError
    }

    let activeSubscribers = 0
    let mrr = 0
    let mrrByPlan: Record<string, number> = {}
    let churnRate = 0

    if (subscriptions && subscriptions.length > 0) {
      activeSubscribers = subscriptions.length
      
      subscriptions.forEach((sub: any) => {
        const planPrice = sub.plan === 'elite' ? 19 : sub.plan === 'pro' ? 9 : sub.plan === 'starter' ? 5 : 0
        mrr += planPrice
        mrrByPlan[sub.plan] = (mrrByPlan[sub.plan] || 0) + planPrice
      })

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: cancelled } = await adminSupabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'cancelled')
        .gte('updated_at', thirtyDaysAgo.toISOString())

      if (cancelled && cancelled.length > 0) {
        const totalAtStart = activeSubscribers + cancelled.length
        churnRate = (cancelled.length / totalAtStart) * 100
      }
    } else {
      const { data: events } = await adminSupabase
        .from('subscription_events')
        .select('*')
        .or('event_type.eq.subscription.created,event_type.eq.subscription.updated')
        .order('created_at', { ascending: false })
        .limit(100)

      if (events && events.length > 0) {
        const uniqueUsers = new Set(events.map((e: any) => e.user_id))
        activeSubscribers = uniqueUsers.size
        mrr = activeSubscribers * 12
        mrrByPlan = { estimated: mrr }
      }
    }

    return NextResponse.json({
      active_subscribers: activeSubscribers,
      mrr: Math.round(mrr * 100) / 100,
      churn_rate: Math.round(churnRate * 100) / 100,
      mrr_by_plan: mrrByPlan,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
