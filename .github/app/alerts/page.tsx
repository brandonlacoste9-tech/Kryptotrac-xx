import { createServerClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { AlertsContainer } from "@/components/alerts/alerts-container"

export default async function AlertsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  const isPro = subscription?.tier === "pro"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
          Price Alerts
        </h1>
        <p className="text-white/60">Get notified via email when prices hit your targets</p>
      </div>

      <AlertsContainer userId={user.id} isPro={isPro} />
    </div>
  )
}
