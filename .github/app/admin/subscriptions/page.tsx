import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { SubscriptionAnalyticsDashboard } from '@/components/admin/subscription-analytics-dashboard'

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  // Simple admin check - only allow specific email or set admin flag in profile
  const isAdmin = profile?.email?.endsWith('@kryptotrac.com') || process.env.ADMIN_EMAILS?.split(',').includes(profile?.email || '')

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Subscription Analytics</h1>
      <SubscriptionAnalyticsDashboard />
    </div>
  )
}
