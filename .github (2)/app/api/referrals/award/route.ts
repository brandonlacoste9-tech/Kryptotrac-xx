import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { referrerId, referredUserId, eventType } = await request.json()
    
    const supabase = await createServerClient()
    
    // Determine credit amount
    const creditAmount = eventType === 'signup' ? 5 : 20
    
    // Create referral event
    const { error: eventError } = await supabase
      .from('referral_events')
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        event_type: eventType,
        credit_amount: creditAmount
      })
    
    if (eventError) throw eventError
    
    // Update referrer's total credits
    const { error: updateError } = await supabase.rpc('increment_referral_credits', {
      user_id: referrerId,
      amount: creditAmount
    })
    
    if (updateError) console.error('[v0] Failed to update credits:', updateError)
    
    return NextResponse.json({ success: true, creditAmount })
  } catch (error) {
    console.error('[v0] Referral award error:', error)
    return NextResponse.json({ error: 'Failed to award referral credits' }, { status: 500 })
  }
}
