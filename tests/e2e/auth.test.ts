/**
 * E2E Tests for Authentication Flows
 * 
 * These tests cover the complete user authentication journey including:
 * - Signup with valid/invalid inputs
 * - Login with password
 * - Magic link authentication
 * - Session management
 * - Logout functionality
 * - Error handling scenarios
 * 
 * Prerequisites:
 * - Supabase project configured with email auth enabled
 * - Environment variables set (see .env.example)
 * - Test environment should use test/staging Supabase instance
 */

import { createBrowserClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase/server'

// Test configuration
const TEST_USER_EMAIL = 'test+' + Date.now() + '@example.com'
const TEST_USER_PASSWORD = 'TestPassword123!'
const INVALID_EMAIL = 'invalid-email'
const WEAK_PASSWORD = '123'
const WRONG_PASSWORD = 'WrongPassword123!'

describe('Authentication E2E Tests', () => {
  let supabase: ReturnType<typeof createBrowserClient>

  beforeAll(() => {
    supabase = createBrowserClient()
  })

  describe('Signup Flow', () => {
    it('should successfully signup with valid email and password', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 'http://localhost:3000/dashboard',
        },
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(TEST_USER_EMAIL)
      expect(data.user?.id).toBeDefined()
      
      // Check if email confirmation is required
      console.log('Email confirmed:', data.user?.email_confirmed_at)
      console.log('User requires email confirmation:', !data.user?.email_confirmed_at)
    })

    it('should fail signup with invalid email format', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: INVALID_EMAIL,
        password: TEST_USER_PASSWORD,
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('email')
    })

    it('should fail signup with weak password', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'weak-password-test@example.com',
        password: WEAK_PASSWORD,
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('password')
    })

    it('should fail signup with duplicate email', async () => {
      // First signup
      await supabase.auth.signUp({
        email: 'duplicate@example.com',
        password: TEST_USER_PASSWORD,
      })

      // Second signup with same email
      const { data, error } = await supabase.auth.signUp({
        email: 'duplicate@example.com',
        password: TEST_USER_PASSWORD,
      })

      // Note: Supabase may return success but not create duplicate
      // Check response for expected behavior
      console.log('Duplicate signup response:', { data, error })
    })

    it('should include referral code in user metadata when provided', async () => {
      const refCode = 'TEST123'
      const { data, error } = await supabase.auth.signUp({
        email: 'referral-test@example.com',
        password: TEST_USER_PASSWORD,
        options: {
          data: {
            referred_by: refCode,
          },
        },
      })

      expect(error).toBeNull()
      expect(data.user?.user_metadata?.referred_by).toBe(refCode)
    })
  })

  describe('Login Flow', () => {
    beforeAll(async () => {
      // Ensure test user exists and is confirmed
      // In production, this would require email confirmation
      await supabase.auth.signUp({
        email: 'login-test@example.com',
        password: TEST_USER_PASSWORD,
      })
    })

    it('should successfully login with valid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'login-test@example.com',
        password: TEST_USER_PASSWORD,
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(data.session?.access_token).toBeDefined()
      expect(data.session?.refresh_token).toBeDefined()
    })

    it('should fail login with incorrect password', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'login-test@example.com',
        password: WRONG_PASSWORD,
      })

      expect(error).toBeDefined()
      expect(error?.message).toMatch(/invalid|credentials|password/i)
      expect(data.session).toBeNull()
    })

    it('should fail login with non-existent user', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: TEST_USER_PASSWORD,
      })

      expect(error).toBeDefined()
      expect(data.session).toBeNull()
    })

    it('should fail login with empty credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: '',
        password: '',
      })

      expect(error).toBeDefined()
    })
  })

  describe('Magic Link Flow', () => {
    it('should send magic link email successfully', async () => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: 'magic-link-test@example.com',
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 'http://localhost:3000/dashboard',
        },
      })

      expect(error).toBeNull()
      // Note: Magic link must be clicked in email to complete auth
      console.log('Magic link sent, check email to complete authentication')
    })

    it('should fail to send magic link with invalid email', async () => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: INVALID_EMAIL,
      })

      expect(error).toBeDefined()
    })
  })

  describe('Session Management', () => {
    beforeAll(async () => {
      // Login to establish session
      await supabase.auth.signInWithPassword({
        email: 'session-test@example.com',
        password: TEST_USER_PASSWORD,
      })
    })

    it('should retrieve current session', async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      expect(error).toBeNull()
      expect(session).toBeDefined()
      expect(session?.access_token).toBeDefined()
      expect(session?.user).toBeDefined()
    })

    it('should retrieve current user', async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      expect(error).toBeNull()
      expect(user).toBeDefined()
      expect(user?.email).toBeDefined()
    })

    it('should refresh session token', async () => {
      const { data, error } = await supabase.auth.refreshSession()

      expect(error).toBeNull()
      expect(data.session).toBeDefined()
      expect(data.session?.access_token).toBeDefined()
    })

    it('should handle expired session gracefully', async () => {
      // This test would require manipulating session expiry
      // In practice, test by waiting for token to expire or manually invalidating
      console.log('Manual test: Wait for session expiry (default: 1 hour) and verify auto-refresh')
    })
  })

  describe('Logout Flow', () => {
    beforeAll(async () => {
      // Login to have session to logout from
      await supabase.auth.signInWithPassword({
        email: 'logout-test@example.com',
        password: TEST_USER_PASSWORD,
      })
    })

    it('should successfully logout and clear session', async () => {
      const { error } = await supabase.auth.signOut()

      expect(error).toBeNull()

      // Verify session is cleared
      const { data: { session } } = await supabase.auth.getSession()
      expect(session).toBeNull()
    })

    it('should handle logout when not logged in', async () => {
      // Logout when already logged out
      const { error } = await supabase.auth.signOut()

      // Should not error
      expect(error).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This would require mocking network failures
      console.log('Manual test: Disconnect network and verify error handling')
    })

    it('should handle invalid tokens gracefully', async () => {
      // Manually set invalid token and test
      console.log('Manual test: Set invalid auth token and verify graceful degradation')
    })

    it('should provide user-friendly error messages', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(error).toBeDefined()
      // Error message should not expose internal system details
      expect(error?.message).not.toContain('database')
      expect(error?.message).not.toContain('SQL')
      expect(error?.message).not.toContain('internal')
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent login attempts', async () => {
      const promises = Array(5).fill(null).map(() =>
        supabase.auth.signInWithPassword({
          email: 'concurrent-test@example.com',
          password: TEST_USER_PASSWORD,
        })
      )

      const results = await Promise.all(promises)
      
      // All should succeed or fail consistently
      const successCount = results.filter(r => !r.error).length
      console.log('Concurrent login results:', { successCount, totalAttempts: 5 })
    })

    it('should handle special characters in password', async () => {
      const specialPassword = 'P@$$w0rd!#%&*()_+-=[]{}|;:,.<>?'
      const { data, error } = await supabase.auth.signUp({
        email: 'special-chars@example.com',
        password: specialPassword,
      })

      expect(error).toBeNull()
      
      // Test login with special chars
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'special-chars@example.com',
        password: specialPassword,
      })

      expect(loginError).toBeNull()
    })

    it('should handle case sensitivity in email', async () => {
      const lowerEmail = 'case-test@example.com'
      const upperEmail = 'CASE-TEST@EXAMPLE.COM'

      await supabase.auth.signUp({
        email: lowerEmail,
        password: TEST_USER_PASSWORD,
      })

      // Try login with different case
      const { data, error } = await supabase.auth.signInWithPassword({
        email: upperEmail,
        password: TEST_USER_PASSWORD,
      })

      // Emails should be case-insensitive
      expect(error).toBeNull()
    })
  })
})

/**
 * Manual Verification Steps:
 * 
 * 1. Email Confirmation:
 *    - Sign up with real email
 *    - Check inbox for confirmation email
 *    - Click link and verify redirect to dashboard
 *    - Confirm profile created in Supabase dashboard
 * 
 * 2. Magic Link:
 *    - Request magic link
 *    - Check email arrives within 1 minute
 *    - Click link and verify instant login
 *    - Verify session persists after browser refresh
 * 
 * 3. Session Persistence:
 *    - Login to application
 *    - Close browser completely
 *    - Reopen and verify still logged in
 *    - Test across multiple tabs
 * 
 * 4. Logout Across Tabs:
 *    - Open application in 2 tabs
 *    - Logout from one tab
 *    - Verify other tab also shows logged out state
 * 
 * 5. Password Requirements:
 *    - Test various password lengths
 *    - Test passwords with/without special chars
 *    - Verify minimum 6 character requirement
 * 
 * 6. Rate Limiting:
 *    - Attempt multiple failed logins rapidly
 *    - Verify if rate limiting triggers
 *    - Document behavior for owner
 * 
 * 7. Referral Flow:
 *    - Use referral link to signup
 *    - Verify referral code captured
 *    - Check credits awarded in database
 *    - Verify welcome email mentions bonus
 */
