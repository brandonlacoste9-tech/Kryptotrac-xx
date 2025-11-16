"use client"

import { BBWelcome } from './bb-welcome'
import { createBrowserClient } from '@/lib/supabase/client'

export function BBWelcomeWrapper() {
  const handleComplete = async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id)
    }
  }

  return <BBWelcome onComplete={handleComplete} />
}
