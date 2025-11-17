import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkWatchlistForTips } from '@/lib/bb-tips'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unread tips
    const { data: tips, error } = await supabase
      .from('bb_tips')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ tips })
  } catch (error) {
    console.error('[BB Tips API Error]', error)
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate tips based on user's watchlist
    const tips = await checkWatchlistForTips(user.id)

    return NextResponse.json({ tips, count: tips.length })
  } catch (error) {
    console.error('[BB Tips Generate Error]', error)
    return NextResponse.json(
      { error: 'Failed to generate tips' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { tipId } = await request.json()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark tip as read
    const { error } = await supabase
      .from('bb_tips')
      .update({ read: true })
      .eq('id', tipId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BB Tips Mark Read Error]', error)
    return NextResponse.json(
      { error: 'Failed to mark tip as read' },
      { status: 500 }
    )
  }
}
