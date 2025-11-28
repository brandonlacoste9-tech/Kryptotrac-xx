# Manual Verification Guide

This guide provides step-by-step instructions for manually testing critical authentication and payment flows that cannot be fully automated.

## Prerequisites

Before starting manual verification:

- [ ] Application running locally (`npm run dev`) or deployed
- [ ] Test Supabase project configured
- [ ] Test Stripe account in test mode
- [ ] Test email account accessible
- [ ] Browser dev tools open (F12)
- [ ] Stripe CLI installed and logged in (for webhook testing)

## Part 1: Authentication Flows

### Test 1.1: Complete Signup Flow (Email Confirmation)

**Objective:** Verify new users can sign up and confirm their email.

**Steps:**
1. Navigate to `/auth/signup`
2. Enter test email: `test+signup-{timestamp}@yourdomain.com`
3. Enter password: `TestPassword123!` (min 6 chars)
4. Click "Sign Up" button
5. Observe success message about checking email
6. Open email inbox
7. Locate confirmation email (check spam folder)
8. Click confirmation link in email
9. Verify redirected to `/dashboard`
10. Check browser network tab - should see authenticated requests
11. Refresh page - should remain logged in

**Expected Results:**
- ✅ Signup form validates input
- ✅ Success message displayed
- ✅ Email received within 1 minute
- ✅ Confirmation link redirects to dashboard
- ✅ User can access protected routes
- ✅ Session persists after refresh

**Verification in Supabase Dashboard:**
- Open Supabase > Authentication > Users
- Confirm new user exists
- Check email is confirmed
- Open Supabase > Table Editor > profiles
- Verify profile record created for user

**Edge Cases to Test:**
- [ ] Signup with already registered email - should show error
- [ ] Signup with invalid email format - should show validation error
- [ ] Signup with weak password (<6 chars) - should show error
- [ ] Don't click confirmation link - user should not be able to login

---

### Test 1.2: Password Login

**Objective:** Verify existing users can login with password.

**Steps:**
1. Navigate to `/auth/login`
2. Enter registered email
3. Enter correct password
4. Click "Sign In" button
5. Verify redirected to `/dashboard`
6. Check session in dev tools > Application > Cookies
7. Verify `sb-` cookies present

**Expected Results:**
- ✅ Login form validates input
- ✅ Successful login redirects to dashboard
- ✅ Auth cookies set correctly
- ✅ User info displayed in dashboard

**Edge Cases to Test:**
- [ ] Login with wrong password - should show error message
- [ ] Login with non-existent email - should show error
- [ ] Login with unconfirmed email - should show error or resend link
- [ ] Multiple failed login attempts - check for rate limiting

---

### Test 1.3: Magic Link Login

**Objective:** Verify passwordless authentication works.

**Steps:**
1. Navigate to `/auth/magic-link` (or click "Sign in with Magic Link" on login page)
2. Enter registered email
3. Click "Send Magic Link"
4. Check email inbox
5. Click magic link in email
6. Verify instantly logged in and redirected to dashboard

**Expected Results:**
- ✅ Magic link email received within 30 seconds
- ✅ Click link instantly logs user in
- ✅ No password required
- ✅ Session persists after browser restart

**Edge Cases to Test:**
- [ ] Click expired magic link - should show error
- [ ] Click used magic link - should show error
- [ ] Request multiple magic links - only latest should work

---

### Test 1.4: Session Persistence

**Objective:** Verify sessions persist and refresh correctly.

**Steps:**
1. Login to application
2. Close all browser tabs
3. Reopen browser
4. Navigate to `/dashboard`
5. Verify still logged in
6. Open application in second tab
7. Navigate in both tabs
8. Logout from one tab
9. Check other tab - should also show logged out

**Expected Results:**
- ✅ Session persists across browser restarts
- ✅ Session shared across tabs
- ✅ Logout affects all tabs
- ✅ Session auto-refreshes before expiry

---

### Test 1.5: Referral Signup

**Objective:** Verify referral system captures and processes referrals.

**Steps:**
1. Login as User A
2. Navigate to `/referrals` (or equivalent page)
3. Copy referral link (e.g., `https://app.com/ref/ABC123`)
4. Open referral link in incognito window
5. Verify redirected to `/auth/signup?ref=ABC123`
6. Complete signup as User B
7. Confirm email for User B
8. Check both users' accounts for referral credits

**Expected Results:**
- ✅ Referral code captured in URL
- ✅ Signup page shows referral bonus message
- ✅ Both users receive credits after confirmation
- ✅ Referral tracked in database

**Verification in Supabase:**
- Check `referrals` table for new record
- Verify referrer and referee IDs correct
- Confirm credits awarded

---

### Test 1.6: Logout

**Objective:** Verify logout clears session properly.

**Steps:**
1. Login to application
2. Navigate to dashboard or any protected route
3. Click logout button/link
4. Verify redirected to login or home page
5. Check cookies in dev tools - auth cookies should be removed
6. Try to access `/dashboard` directly
7. Verify redirected to login page

**Expected Results:**
- ✅ Logout clears session
- ✅ Auth cookies removed
- ✅ Cannot access protected routes
- ✅ Must login again to access app

---

## Part 2: Payment Flows

### Test 2.1: Complete Checkout Flow (Successful Payment)

**Objective:** Verify users can successfully subscribe to a paid plan.

**Steps:**
1. Login to application
2. Navigate to `/pricing`
3. Click "Subscribe" on Pro plan
4. Verify redirected to Stripe Checkout
5. Fill in payment form:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
6. Click "Subscribe" or "Pay"
7. Verify redirected back to `/dashboard?success=true`
8. Check dashboard shows "Pro" plan
9. Verify success message displayed

**Expected Results:**
- ✅ Checkout session created
- ✅ Stripe checkout page loads
- ✅ Payment processes successfully
- ✅ Redirect to success URL
- ✅ User plan upgraded to Pro
- ✅ Success message shown

**Verification in Stripe Dashboard:**
- Open Stripe > Payments
- Confirm payment succeeded
- Check customer created
- Verify subscription active

**Verification in Supabase:**
- Check `user_subscriptions` table
- Verify subscription record created
- Confirm `stripe_customer_id` set
- Check `profiles` table - `plan_type` should be "pro"

---

### Test 2.2: Failed Payment (Declined Card)

**Objective:** Verify declined payments are handled gracefully.

**Steps:**
1. Login to application
2. Navigate to `/pricing`
3. Click "Subscribe" on any plan
4. At Stripe checkout, use declined card: `4000 0000 0000 0002`
5. Complete form and submit
6. Verify error message displayed
7. Close checkout and return to app
8. Verify user still on free plan

**Expected Results:**
- ✅ Error message: "Your card was declined"
- ✅ User not charged
- ✅ No subscription created
- ✅ User remains on free plan
- ✅ Can retry with different card

**Verification:**
- Stripe dashboard shows failed payment
- No subscription created
- Database unchanged

---

### Test 2.3: Webhook Processing

**Objective:** Verify webhooks update database correctly.

**Prerequisites:** Stripe CLI running
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Steps:**
1. Start local server: `npm run dev`
2. Start Stripe CLI webhook forwarding (command above)
3. In another terminal, trigger event:
   ```bash
   stripe trigger checkout.session.completed
   ```
4. Check Stripe CLI output - should show webhook delivered
5. Check application logs - should show webhook processed
6. Check database for updated subscription

**Expected Results:**
- ✅ Webhook received (200 OK)
- ✅ Event processed correctly
- ✅ Database updated
- ✅ No errors in logs

**Test Additional Events:**
```bash
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

### Test 2.4: Billing Portal Access

**Objective:** Verify subscribed users can access billing portal.

**Steps:**
1. Login as user with active subscription
2. Navigate to settings or billing page
3. Click "Manage Subscription" or "Billing Portal" link
4. Verify redirected to Stripe billing portal
5. Verify subscription details visible
6. Test updating payment method:
   - Click "Update payment method"
   - Enter new card: `4242 4242 4242 4242`
   - Save changes
7. Test canceling subscription:
   - Click "Cancel subscription"
   - Confirm cancellation
   - Verify cancellation scheduled at period end

**Expected Results:**
- ✅ Portal opens for subscribed users
- ✅ Subscription details accurate
- ✅ Can update payment method
- ✅ Can cancel subscription
- ✅ Changes reflected in app

**Verification:**
- Stripe dashboard shows updated payment method
- Subscription status shows "Canceling at period end"
- App still shows Pro plan until period ends

---

### Test 2.5: Subscription Plans

**Objective:** Verify all plan tiers work correctly.

**Test Each Plan:**
1. Starter Plan ($5/month)
2. Pro Plan ($10/month)
3. Elite Plan ($20/month)

**For Each Plan:**
- [ ] Checkout creates session with correct price
- [ ] Payment succeeds with test card
- [ ] Correct plan shown in app
- [ ] Correct features unlocked
- [ ] Subscription visible in Stripe

---

### Test 2.6: 3D Secure Authentication

**Objective:** Verify 3D Secure authentication flow.

**Steps:**
1. Start checkout flow
2. Use 3DS test card: `4000 0025 0000 3155`
3. Fill remaining fields
4. Submit payment
5. Verify 3DS authentication challenge appears
6. Click "Complete" or "Authenticate"
7. Verify payment succeeds after authentication

**Expected Results:**
- ✅ 3DS modal appears
- ✅ Can complete authentication
- ✅ Payment succeeds after auth
- ✅ Subscription created

**Test Failed Authentication:**
- Use same card
- Click "Fail" on 3DS modal
- Verify payment fails
- No subscription created

---

## Part 3: Security Verification

### Test 3.1: Unauthenticated Access Protection

**Objective:** Verify protected routes require authentication.

**Steps:**
1. Ensure logged out
2. Try to access `/dashboard`
3. Try to access `/api/create-checkout-session`
4. Try to access other protected routes

**Expected Results:**
- ✅ Redirected to login page
- ✅ API returns 401 Unauthorized
- ✅ No sensitive data exposed

---

### Test 3.2: Webhook Signature Verification

**Objective:** Verify webhooks reject invalid signatures.

**Steps:**
1. Send POST to `/api/webhooks/stripe` without signature header
2. Send POST with invalid signature
3. Send POST with valid signature (use Stripe CLI)

**Expected Results:**
- ✅ No signature: 400 Bad Request
- ✅ Invalid signature: 400 Bad Request
- ✅ Valid signature: 200 OK

---

### Test 3.3: Secrets Not Exposed

**Objective:** Verify no secrets exposed in responses.

**Steps:**
1. Open browser dev tools > Network tab
2. Complete signup, login, checkout flows
3. Review all network responses
4. Check for exposed secrets

**Expected Results:**
- ✅ No `sk_live_` or `sk_test_` in responses
- ✅ No `SUPABASE_SERVICE_ROLE_KEY` exposed
- ✅ No `STRIPE_WEBHOOK_SECRET` exposed
- ✅ No database credentials visible

---

## Part 4: Edge Cases

### Test 4.1: Concurrent Sessions

**Steps:**
1. Login in Browser 1
2. Login with same account in Browser 2
3. Perform actions in both browsers
4. Logout from Browser 1
5. Check Browser 2 - should also logout

---

### Test 4.2: Network Interruption

**Steps:**
1. Start checkout flow
2. Disable network before submitting
3. Try to submit payment
4. Re-enable network
5. Verify graceful error handling

---

### Test 4.3: Browser Back Button

**Steps:**
1. Complete checkout flow
2. Click browser back button
3. Verify doesn't recreate subscription
4. Verify shows correct state

---

## Checklist Summary

Use this checklist to track manual verification progress:

### Authentication
- [ ] Signup with email confirmation
- [ ] Password login (success)
- [ ] Password login (failure)
- [ ] Magic link login
- [ ] Session persistence across tabs
- [ ] Session persistence across browser restart
- [ ] Referral signup flow
- [ ] Logout functionality
- [ ] Error messages user-friendly

### Payments
- [ ] Successful checkout (test card)
- [ ] Failed payment (declined card)
- [ ] Failed payment (insufficient funds)
- [ ] Webhook: checkout.session.completed
- [ ] Webhook: subscription.updated
- [ ] Webhook: subscription.deleted
- [ ] Billing portal access
- [ ] Update payment method
- [ ] Cancel subscription
- [ ] 3D Secure authentication
- [ ] All plan tiers work

### Security
- [ ] Protected routes require auth
- [ ] Webhook signature verification
- [ ] No secrets in responses
- [ ] No secrets in source code
- [ ] No secrets in git repository
- [ ] Error messages don't expose internals

### Edge Cases
- [ ] Concurrent sessions handled
- [ ] Network errors handled gracefully
- [ ] Browser back button safe
- [ ] Rate limiting (if implemented)
- [ ] Special characters in passwords
- [ ] Case insensitive emails

## Reporting Issues

When reporting issues found during manual testing:

1. **Document the issue:**
   - What you were testing
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/screen recordings if applicable

2. **Include context:**
   - Browser and version
   - Environment (local/staging/production)
   - Timestamp
   - User account used for testing

3. **Severity assessment:**
   - Critical: Blocks core functionality
   - High: Major feature broken
   - Medium: Minor feature broken
   - Low: Cosmetic or edge case

4. **Log evidence:**
   - Browser console errors
   - Network request/response
   - Application logs
   - Database state before/after

## Sign-off

After completing all manual tests, document results:

**Tested by:** _______________  
**Date:** _______________  
**Environment:** _______________  

**Overall Status:**
- [ ] All critical flows pass
- [ ] All edge cases handled
- [ ] No security issues found
- [ ] Ready for production

**Issues Found:** (link to issue tracker)

**Recommendations:**
(List any recommendations for owner follow-up)
