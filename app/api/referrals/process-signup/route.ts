import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId, refCode } = await request.json()
    
    const supabase = await createServerClient()
    
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', refCode)
      .single()
    
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }
    
    // Award credits to both users
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/referrals/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerId: referrer.id,
        referredUserId: userId,
        eventType: 'signup'
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Process signup error:', error)
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}
