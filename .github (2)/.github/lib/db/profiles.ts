import { createServerClient } from "@/lib/supabase/server"
import { createBrowserClient } from "@/lib/supabase/client"

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return null
  }

  return data
}

export async function createProfile(userId: string, email: string): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      display_name: email.split("@")[0],
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating profile:", error)
    return null
  }

  return data
}

export async function getProfileClient(userId: string): Promise<Profile | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "display_name">>
): Promise<Profile | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating profile:", error)
    return null
  }

  return data
}
