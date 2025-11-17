# Staging Deployment Log - feat(ui+admin): replace beehive + add orb cursor and subscription analytics

## Changes Implemented

### 1. Chat Widget Replacement
- ✅ Created `components/ChatWidget.tsx` with KryptoTrac logo
- ✅ Replaced beehive hexagon button with circular button
- ✅ Logo renders from `/public/images/kryptotrac-logo.svg`
- ✅ Maintains existing chat functionality
- ✅ Added `aria-label="Open KryptoTrac chat"` for accessibility
- ✅ Keyboard focusable with focus ring

### 2. Custom Orb Cursor
- ✅ Created `components/CustomCursor.tsx` with animated glowing orb
- ✅ 24px diameter, glowing red effect matching theme
- ✅ Lerp-based smooth follow with lag effect
- ✅ `pointer-events:none` to avoid blocking clicks
- ✅ Hidden on touch devices via `@media (pointer: coarse)`
- ✅ Uses `requestAnimationFrame` for performance
- ✅ Hides OS cursor with `body.with-orb { cursor: none }`
- ✅ Preserves cursor for keyboard focus (`:focus` elements)

### 3. Removed Bee Cursor
- ✅ Removed bee SVG cursor from `globals.css`
- ✅ Removed `.bb-cursor` class
- ✅ Removed bee trail animations
- ✅ Added CSS to hide any 3rd-party bee widgets

### 4. Subscription Analytics API (SECURITY FIXED)
- ✅ Created `/app/api/admin/analytics/route.ts` (session-based auth)
- ✅ Server-side only, uses service role key (never exposed to client)
- ✅ Protected with user session + admin email check (secure server-side validation)
- ✅ Returns: `active_subscribers`, `mrr`, `churn_rate`, `mrr_by_plan`
- ✅ Reads from `user_subscriptions` table with fallback to `subscription_events`
- ✅ Calculates churn rate (cancelled in last 30 days)
- ⚠️ Deprecated: `/app/api/admin/subscription-analytics/route.ts` (token-based, keep for backwards compat)

### 5. Admin Dashboard
- ✅ Created `/app/admin/subscriptions/page.tsx`
- ✅ Server-side auth check (redirects non-admins)
- ✅ Admin check via email domain or admin email list
- ✅ Updated `components/admin/subscription-analytics-dashboard.tsx`
- ✅ **SECURITY FIX**: Removed client-side token access, uses session-based API
- ✅ Displays 4 metric cards: Active Subs, MRR, Churn, ARPU
- ✅ Shows MRR breakdown by plan
- ✅ Auto-refreshes every 60 seconds

## Security Improvements

### Before (INSECURE)
\`\`\`typescript
// ❌ Client-side code exposed admin credentials
const token = process.env.ADMIN_TOKEN || 'fallback'
const res = await fetch('/api/admin/subscription-analytics', {
  headers: { 'x-admin-token': token }
})
\`\`\`

### After (SECURE)
\`\`\`typescript
// ✅ No credentials needed - uses session auth
const res = await fetch('/api/admin/analytics') // Server validates session + admin status
\`\`\`

## Manual Test Checklist

### Chat Button Tests
- [ ] Chat button visible in bottom-right corner
- [ ] Button shows KryptoTrac logo
- [ ] Keyboard accessible (Tab to focus, Enter to open)
- [ ] Focus ring visible when focused
- [ ] Clicking opens chat window
- [ ] Chat maintains BB functionality

### Custom Orb Tests
- [ ] Orb appears when moving mouse (desktop only)
- [ ] Orb follows cursor with smooth lag
- [ ] Orb does NOT block clicks (can click buttons behind it)
- [ ] Orb hidden on mobile/touch devices
- [ ] OS cursor hidden when orb is active
- [ ] Cursor reappears on keyboard focus

### Admin Analytics Tests
- [ ] `/admin/subscriptions` requires login
- [ ] Non-admin users redirected to dashboard
- [ ] Admin users can access page
- [ ] API `/api/admin/analytics` uses session auth (no credentials in request)
- [ ] Returns valid JSON with all 4 metrics
- [ ] MRR breakdown shows plan distribution
- [ ] Values match Stripe dashboard (sanity check)

### Security Tests
- [ ] Analytics API blocks unauthenticated requests
- [ ] Analytics API blocks non-admin users
- [ ] Service role key never exposed client-side
- [ ] No admin credentials exposed in client code
- [ ] RLS policies prevent data leakage

## Environment Variables Required

\`\`\`env
# Server-side only (never expose these)
ADMIN_EMAILS=admin@kryptotrac.com,dev@kryptotrac.com
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>

# Optional: Keep for backwards compatibility with old token-based API
ADMIN_ANALYTICS_TOKEN=your-secret-token-here
\`\`\`

## Commit Message

\`\`\`
feat(ui+admin): replace beehive + add orb cursor and subscription analytics

- Replace hexagon beehive button with circular KryptoTrac logo button
- Remove bee cursor, add animated glowing orb cursor (24px, lerp-based)
- Orb hidden on touch devices, doesn't block clicks
- Add subscription analytics API (MRR, churn, active subs, breakdown by plan)
- Add admin dashboard at /admin/subscriptions with charts
- SECURITY: Use session-based auth instead of client-exposed credentials
- Protected with server-side user session + admin email validation
\`\`\`

## Next Steps

1. Run manual test checklist above
2. Take screenshots (desktop orb, chat button, admin dashboard)
3. Test API response with browser DevTools
4. Compare MRR with Stripe dashboard for accuracy
5. Create PR with screenshots and sample JSON
6. Deploy to staging for final validation
