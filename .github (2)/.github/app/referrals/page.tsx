import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, DollarSign, Users, TrendingUp, Gift } from 'lucide-react'

export default async function ReferralsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Fetch referral data
  const { data: referralData } = await supabase
    .from('user_referrals')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  // Fetch referral events
  const { data: events } = await supabase
    .from('referral_events')
    .select('*, referred_user_id')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  const referralCode = referralData?.referral_code || 'LOADING'
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kryptotrac.app'}/ref/${referralCode}`
  
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Invite & Earn $200/month</h1>
          <p className="text-white/60 text-lg">Share KryptoTrac and earn credits for every referral</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Signups</p>
                <p className="text-2xl font-bold text-white">{referralData?.total_signups || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Conversions</p>
                <p className="text-2xl font-bold text-white">{referralData?.total_conversions || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Earned</p>
                <p className="text-2xl font-bold text-white">${referralData?.total_credits?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/80 font-medium">Monthly Progress</p>
            <p className="text-white/60 text-sm">${referralData?.total_credits?.toFixed(2) || '0.00'} / $200</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((Number(referralData?.total_credits) / 200) * 100, 100)}%` }}
            />
          </div>
        </Card>

        {/* Share Link */}
        <Card className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4">Share your link</h3>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-white/80 text-sm">
              {referralUrl}
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(referralUrl)
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </Card>

        {/* How it works */}
        <Card className="glass-card p-6">
          <h3 className="text-white font-semibold mb-6">How it works:</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-blue-400 font-semibold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Copy your link and invite friends</p>
                <p className="text-white/60 text-sm">Share your unique referral link via email, social media, or messaging</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-400 font-semibold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Each signup earns you both $5 credits</p>
                <p className="text-white/60 text-sm">When someone signs up using your link, you both receive $5 in account credits</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <span className="text-orange-400 font-semibold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">When they subscribe, you both earn $20 credits</p>
                <p className="text-white/60 text-sm">When your referral upgrades to Pro, you both earn $20 in additional credits</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-purple-400 font-semibold">4</span>
              </div>
              <div>
                <p className="text-white font-medium">Credits apply to your personal scope</p>
                <p className="text-white/60 text-sm">Use credits to unlock Pro features or get discounts on your subscription</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Referrals */}
        {events && events.length > 0 && (
          <Card className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.event_type === 'conversion' ? 'bg-green-400' : 'bg-blue-400'}`} />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {event.event_type === 'signup' ? 'New Signup' : 'Pro Conversion'}
                      </p>
                      <p className="text-white/40 text-xs">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-400 font-semibold">
                    +${event.credit_amount}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
