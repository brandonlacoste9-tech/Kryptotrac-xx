import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  
  console.log("[v0] Referral code received:", code)
  
  // Store referral code in cookie for 30 days
  const cookieStore = await cookies()
  cookieStore.set('referral_code', code, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  })
  
  console.log("[v0] Stored referral code in cookie, redirecting to signup")
  
  // Redirect to signup page with referral indicator
  redirect(`/auth/signup?ref=${code}`)
}
