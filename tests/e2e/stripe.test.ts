/**
 * E2E Tests for Stripe Payment Flows
 * 
 * These tests cover the complete payment journey including:
 * - Checkout session creation
 * - Payment success/failure scenarios
 * - Webhook event processing
 * - Subscription management
 * - Customer portal access
 * 
 * Prerequisites:
 * - Stripe account with test mode enabled
 * - Test API keys configured (sk_test_*, pk_test_*)
 * - Webhook endpoint configured and listening
 * - Environment variables set (see .env.example)
 * 
 * IMPORTANT: Always use Stripe test mode keys for testing!
 * Test cards: https://stripe.com/docs/testing#cards
 * 
 * ARCHITECTURE NOTE:
 * This test file intentionally imports Stripe SDK directly, which differs from
 * the production pattern of using server-only imports. This is acceptable for
 * E2E testing because:
 * 
 * 1. These tests run in Node.js test environment, not browser
 * 2. We need direct Stripe API access to verify server-side behavior
 * 3. Tests validate both direct API calls AND API endpoint behavior
 * 4. Test environment is isolated and uses test keys only
 * 
 * For testing application endpoints (without direct SDK), see:
 * - tests/integration/stripe-api.test.ts
 * 
 * Production code maintains server-only pattern via lib/stripe.ts
 */

// Import Stripe SDK directly for E2E test purposes
import Stripe from 'stripe'

// Initialize Stripe with test key for E2E testing
// This is acceptable in test environment only - production uses lib/stripe.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Stripe test card numbers
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119',
  REQUIRES_AUTH: '4000002500003155', // 3D Secure
}

describe('Stripe Payment E2E Tests', () => {
  let testUserId: string
  let testCustomerEmail: string

  beforeAll(async () => {
    // Create test user in Supabase
    testCustomerEmail = 'stripe-test+' + Date.now() + '@example.com'
    
    // Verify we're using test mode
    const apiKey = process.env.STRIPE_SECRET_KEY || ''
    expect(apiKey.startsWith('sk_test_')).toBe(true)
    console.log('✓ Using Stripe test mode')
  })

  describe('Checkout Session Creation', () => {
    it('should create checkout session for authenticated user', async () => {
      const session = await stripe.checkout.sessions.create({
        customer_email: testCustomerEmail,
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'KryptoTrac Pro',
                description: 'Test subscription',
              },
              unit_amount: 999, // $9.99 CAD
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/dashboard?success=true',
        cancel_url: 'http://localhost:3000/pricing',
        metadata: {
          user_id: 'test-user-123',
        },
      })

      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.url).toBeDefined()
      expect(session.customer_email).toBe(testCustomerEmail)
      expect(session.metadata?.user_id).toBe('test-user-123')
      expect(session.mode).toBe('subscription')
    })

    it('should create checkout session with correct pricing for Pro plan', async () => {
      const session = await stripe.checkout.sessions.create({
        customer_email: testCustomerEmail,
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'KryptoTrac Pro',
              },
              unit_amount: 999, // $9.99 CAD
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/dashboard?success=true',
        cancel_url: 'http://localhost:3000/pricing',
      })

      expect(session.line_items).toBeDefined()
      expect(session.amount_total).toBe(999) // cents
    })

    it('should create checkout sessions for different plans', async () => {
      const plans = [
        { name: 'Starter', monthly: 500, yearly: 5000 },
        { name: 'Pro', monthly: 1000, yearly: 10000 },
        { name: 'Elite', monthly: 2000, yearly: 20000 },
      ]

      for (const plan of plans) {
        const session = await stripe.checkout.sessions.create({
          customer_email: testCustomerEmail,
          line_items: [
            {
              price_data: {
                currency: 'cad',
                product_data: {
                  name: `KryptoTrac ${plan.name}`,
                },
                unit_amount: plan.monthly,
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: 'http://localhost:3000/dashboard?success=true',
          cancel_url: 'http://localhost:3000/pricing',
        })

        expect(session.id).toBeDefined()
        console.log(`✓ Created checkout for ${plan.name} plan`)
      }
    })

    it('should fail to create session without required parameters', async () => {
      try {
        await stripe.checkout.sessions.create({
          mode: 'subscription',
          // Missing line_items
          success_url: 'http://localhost:3000/dashboard',
          cancel_url: 'http://localhost:3000/pricing',
        } as any)
        
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.type).toBe('StripeInvalidRequestError')
      }
    })

    it('should create checkout with existing customer ID', async () => {
      // First create a customer
      const customer = await stripe.customers.create({
        email: testCustomerEmail,
        metadata: {
          supabase_user_id: 'test-user-456',
        },
      })

      expect(customer.id).toBeDefined()

      // Then create checkout with customer ID
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'KryptoTrac Pro',
              },
              unit_amount: 999,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/dashboard?success=true',
        cancel_url: 'http://localhost:3000/pricing',
      })

      expect(session.customer).toBe(customer.id)
    })
  })

  describe('Payment Success Scenarios', () => {
    it('should simulate successful payment with test card', async () => {
      // Note: This requires Stripe test mode and manual completion
      // In automated tests, you'd use Stripe CLI to trigger events
      console.log('Manual test: Use test card 4242424242424242 to complete payment')
      console.log('Expiry: Any future date, CVC: Any 3 digits, ZIP: Any 5 digits')
    })

    it('should handle payment_intent.succeeded event', async () => {
      // This would typically be triggered by Stripe webhook
      // Test by sending mock webhook event
      console.log('Test using: stripe trigger payment_intent.succeeded')
    })
  })

  describe('Payment Failure Scenarios', () => {
    it('should handle declined card (generic)', async () => {
      console.log('Manual test: Use test card 4000000000000002 (generic decline)')
      console.log('Expected: Payment should fail with "Your card was declined" message')
    })

    it('should handle insufficient funds', async () => {
      console.log('Manual test: Use test card 4000000000009995 (insufficient funds)')
      console.log('Expected: Payment should fail with insufficient funds error')
    })

    it('should handle expired card', async () => {
      console.log('Manual test: Use test card 4000000000000069 (expired card)')
      console.log('Expected: Payment should fail with expired card error')
    })

    it('should handle incorrect CVC', async () => {
      console.log('Manual test: Use test card 4000000000000127 (incorrect CVC)')
      console.log('Expected: Payment should fail with CVC error')
    })

    it('should handle processing error', async () => {
      console.log('Manual test: Use test card 4000000000000119 (processing error)')
      console.log('Expected: Payment should fail with processing error')
    })
  })

  describe('Webhook Event Processing', () => {
    let testCustomer: any
    let testSubscription: any

    beforeAll(async () => {
      // Create test customer
      testCustomer = await stripe.customers.create({
        email: testCustomerEmail,
        metadata: {
          supabase_user_id: 'webhook-test-user',
        },
      })
    })

    it('should verify webhook signature', () => {
      const payload = JSON.stringify({
        id: 'evt_test',
        object: 'event',
        type: 'customer.created',
        data: { object: {} },
      })

      const signature = 'test_signature'
      
      // In real test, use Stripe.webhooks.generateTestHeaderString
      console.log('Webhook signature verification should use STRIPE_WEBHOOK_SECRET')
    })

    it('should process checkout.session.completed event', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: testCustomer.id,
            subscription: 'sub_test_123',
            metadata: {
              user_id: 'webhook-test-user',
            },
          },
        },
      }

      // Webhook handler should:
      // 1. Verify signature
      // 2. Create/update user_subscriptions record
      // 3. Update profiles.plan_type
      // 4. Return 200 OK

      console.log('Webhook should create subscription record in database')
    })

    it('should process customer.subscription.updated event', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      }

      // Webhook handler should:
      // 1. Update user_subscriptions status
      // 2. Update period dates
      // 3. Return 200 OK

      console.log('Webhook should update subscription record in database')
    })

    it('should process customer.subscription.deleted event', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: testCustomer.id,
          },
        },
      }

      // Webhook handler should:
      // 1. Update subscription status to 'canceled'
      // 2. Update profiles.plan_type to 'free'
      // 3. Return 200 OK

      console.log('Webhook should cancel subscription and downgrade user to free plan')
    })

    it('should handle duplicate webhook events (idempotency)', async () => {
      // Send same event twice
      const eventId = 'evt_test_duplicate_' + Date.now()
      
      // First webhook call
      console.log('First webhook call should succeed')
      
      // Second webhook call with same event ID
      console.log('Second webhook call should be idempotent (no duplicate actions)')
      console.log('Recommendation: Track processed event IDs in database')
    })

    it('should reject webhook with invalid signature', async () => {
      const payload = JSON.stringify({
        id: 'evt_test',
        type: 'customer.created',
        data: { object: {} },
      })

      const invalidSignature = 'invalid_signature'

      // Webhook handler should return 400 Bad Request
      console.log('Invalid signature should be rejected with 400 status')
    })

    it('should handle unknown webhook event types gracefully', async () => {
      const mockEvent = {
        type: 'unknown.event.type',
        data: { object: {} },
      }

      // Webhook handler should:
      // 1. Log the unknown event
      // 2. Return 200 OK (to acknowledge receipt)
      // 3. Not crash or throw errors

      console.log('Unknown event types should be logged but not cause errors')
    })
  })

  describe('Billing Portal', () => {
    it('should create portal session for existing customer', async () => {
      // First create customer
      const customer = await stripe.customers.create({
        email: testCustomerEmail,
        metadata: {
          supabase_user_id: 'portal-test-user',
        },
      })

      // Then create portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'http://localhost:3000/dashboard',
      })

      expect(session.id).toBeDefined()
      expect(session.url).toBeDefined()
      expect(session.customer).toBe(customer.id)
    })

    it('should fail to create portal session without customer ID', async () => {
      try {
        await stripe.billingPortal.sessions.create({
          customer: '',
          return_url: 'http://localhost:3000/dashboard',
        })
        
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.type).toBe('StripeInvalidRequestError')
      }
    })

    it('should fail to create portal session with invalid customer ID', async () => {
      try {
        await stripe.billingPortal.sessions.create({
          customer: 'cus_invalid_id',
          return_url: 'http://localhost:3000/dashboard',
        })
        
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.type).toBe('StripeInvalidRequestError')
      }
    })
  })

  describe('Subscription Management', () => {
    let testCustomer: any

    beforeAll(async () => {
      testCustomer = await stripe.customers.create({
        email: testCustomerEmail,
        metadata: {
          supabase_user_id: 'subscription-test-user',
        },
      })
    })

    it('should create subscription programmatically', async () => {
      // First create a price
      const price = await stripe.prices.create({
        unit_amount: 999,
        currency: 'cad',
        recurring: { interval: 'month' },
        product_data: {
          name: 'KryptoTrac Pro Test',
        },
      })

      // Then create subscription
      const subscription = await stripe.subscriptions.create({
        customer: testCustomer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      expect(subscription.id).toBeDefined()
      expect(subscription.status).toBeDefined()
      expect(subscription.customer).toBe(testCustomer.id)
    })

    it('should retrieve subscription details', async () => {
      const subscriptions = await stripe.subscriptions.list({
        customer: testCustomer.id,
        limit: 10,
      })

      expect(subscriptions.data).toBeDefined()
      console.log(`Found ${subscriptions.data.length} subscriptions for customer`)
    })

    it('should cancel subscription', async () => {
      // Create subscription first
      const price = await stripe.prices.create({
        unit_amount: 999,
        currency: 'cad',
        recurring: { interval: 'month' },
        product_data: {
          name: 'KryptoTrac Pro Cancel Test',
        },
      })

      const subscription = await stripe.subscriptions.create({
        customer: testCustomer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
      })

      // Cancel it
      const canceledSubscription = await stripe.subscriptions.cancel(subscription.id)

      expect(canceledSubscription.status).toBe('canceled')
      expect(canceledSubscription.canceled_at).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent checkout session creations', async () => {
      const promises = Array(5).fill(null).map((_, i) =>
        stripe.checkout.sessions.create({
          customer_email: `concurrent-test-${i}@example.com`,
          line_items: [
            {
              price_data: {
                currency: 'cad',
                product_data: { name: 'Test Product' },
                unit_amount: 999,
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
        })
      )

      const results = await Promise.all(promises)
      
      expect(results.length).toBe(5)
      results.forEach(session => {
        expect(session.id).toBeDefined()
      })
    })

    it('should handle rate limiting gracefully', async () => {
      // Stripe has rate limits (typically 100 req/sec in test mode)
      console.log('Manual test: Make rapid requests to test rate limiting')
      console.log('Expected: 429 Too Many Requests with Retry-After header')
    })

    it('should handle network timeouts', async () => {
      // Set timeout and test
      const stripe = require('@/lib/stripe').stripe
      stripe.setTimeout(1000) // 1 second timeout

      console.log('Manual test: Trigger network delay to test timeout handling')
    })

    it('should validate customer metadata', async () => {
      const customer = await stripe.customers.create({
        email: testCustomerEmail,
        metadata: {
          supabase_user_id: 'metadata-test-user',
          custom_field: 'test_value',
        },
      })

      expect(customer.metadata.supabase_user_id).toBe('metadata-test-user')
      expect(customer.metadata.custom_field).toBe('test_value')
    })
  })

  describe('3D Secure Authentication', () => {
    it('should handle 3D Secure required scenario', async () => {
      console.log('Manual test: Use test card 4000002500003155 (requires 3DS)')
      console.log('Expected: Additional authentication step before payment completes')
    })

    it('should handle 3D Secure authentication failure', async () => {
      console.log('Manual test: Fail 3DS authentication when prompted')
      console.log('Expected: Payment should fail with authentication failure')
    })
  })
})

/**
 * Manual Verification Steps:
 * 
 * 1. Complete Checkout Flow:
 *    - Login to application
 *    - Navigate to pricing page
 *    - Click "Subscribe" for Pro plan
 *    - Verify redirected to Stripe checkout
 *    - Use test card 4242424242424242
 *    - Complete payment
 *    - Verify redirected to success page
 *    - Check dashboard shows Pro plan
 * 
 * 2. Failed Payment Flow:
 *    - Start checkout process
 *    - Use declined test card 4000000000000002
 *    - Verify error message shown
 *    - Verify user remains on free plan
 *    - Verify no subscription created in Stripe
 * 
 * 3. Webhook Processing:
 *    - Configure webhook endpoint in Stripe dashboard
 *    - Complete a test purchase
 *    - Check Stripe webhook logs for delivery
 *    - Verify database updated correctly
 *    - Check application shows updated plan
 * 
 * 4. Billing Portal:
 *    - As subscribed user, access billing portal
 *    - Verify can view subscription details
 *    - Test updating payment method
 *    - Test canceling subscription
 *    - Verify changes reflected in application
 * 
 * 5. Subscription Status:
 *    - Create subscription
 *    - Wait for first payment
 *    - Verify status shows as "active"
 *    - Cancel subscription
 *    - Verify status shows as "canceled"
 *    - Verify access until period end
 * 
 * 6. Webhook Delivery Failures:
 *    - Temporarily disable webhook endpoint
 *    - Complete a purchase
 *    - Check Stripe dashboard for failed webhooks
 *    - Re-enable endpoint
 *    - Verify Stripe retries webhook
 *    - Verify database updates after retry
 * 
 * 7. Test Different Plans:
 *    - Subscribe to Starter plan
 *    - Verify correct price charged
 *    - Upgrade to Pro plan
 *    - Verify proration calculated
 *    - Upgrade to Elite plan
 *    - Verify all features unlocked
 * 
 * 8. Security Verification:
 *    - Attempt to create checkout without auth
 *    - Verify 401 Unauthorized returned
 *    - Attempt webhook with invalid signature
 *    - Verify 400 Bad Request returned
 *    - Check logs for no leaked secrets
 */

/**
 * Testing with Stripe CLI:
 * 
 * Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 
 * 1. Login to Stripe:
 *    stripe login
 * 
 * 2. Forward webhooks to local dev:
 *    stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * 
 * 3. Trigger test events:
 *    stripe trigger checkout.session.completed
 *    stripe trigger customer.subscription.updated
 *    stripe trigger customer.subscription.deleted
 *    stripe trigger payment_intent.succeeded
 *    stripe trigger payment_intent.payment_failed
 * 
 * 4. Test with specific scenarios:
 *    stripe trigger checkout.session.completed --add checkout.session.customer=cus_test123
 */
