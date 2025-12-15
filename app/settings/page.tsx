import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmailPreferences } from "@/components/settings/email-preferences"
import { ExportHistory } from "@/components/settings/export-history"
import { DeleteAccount } from "@/components/settings/delete-account"

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user subscription status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  const isPro = !!subscription

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account preferences and notifications</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Account Status</span>
                <span className={isPro ? "text-red-400 font-semibold" : "text-white"}>
                  {isPro ? "Pro Member" : "Free"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Member Since</span>
                <span className="text-white">{new Date(user.created_at || "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <EmailPreferences userId={user.id} userEmail={user.email || ""} />

        <ExportHistory userId={user.id} isPro={isPro} />

        <DeleteAccount userEmail={user.email || ""} />
      </div>
    </div>
  )
}
