import type { Metadata } from "next"
import { redirect } from 'next/navigation'
import { createServerClient } from "@/lib/supabase/server"
import { UpgradeContainer } from "@/components/upgrade/upgrade-container"

export const metadata: Metadata = {
  title: "Upgrade to Pro - KryptoTrac",
  description: "Upgrade to KryptoTrac Pro for unlimited alerts and advanced features",
}

export default async function UpgradePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/upgrade")
  }

  // Check if already Pro
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (subscription) {
    redirect("/portfolio")
  }

  return <UpgradeContainer userEmail={user.email!} />
}
