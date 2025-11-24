/**
 * Integration Tests for Authentication API Endpoints
 * 
 * Tests the actual API routes for authentication flows
 * including welcome emails and referral processing.
 */

describe('Authentication API Integration Tests', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 'http://localhost:3000'

  describe('POST /api/auth/welcome', () => {
    it('should send welcome email to new user', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      
      console.log('Welcome email response:', data)
    })

    it('should fail without email parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.ok).toBe(false)
    })

    it('should fail with invalid email format', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
        }),
      })

      expect(response.ok).toBe(false)
    })
  })

  describe('POST /api/referrals/process-signup', () => {
    it('should process referral signup successfully', async () => {
      const response = await fetch(`${BASE_URL}/api/referrals/process-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          refCode: 'TEST123',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      
      console.log('Referral processing response:', data)
    })

    it('should fail without userId', async () => {
      const response = await fetch(`${BASE_URL}/api/referrals/process-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refCode: 'TEST123',
        }),
      })

      expect(response.ok).toBe(false)
    })

    it('should fail without refCode', async () => {
      const response = await fetch(`${BASE_URL}/api/referrals/process-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id',
        }),
      })

      expect(response.ok).toBe(false)
    })

    it('should handle invalid referral code', async () => {
      const response = await fetch(`${BASE_URL}/api/referrals/process-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          refCode: 'INVALID999',
        }),
      })

      // Should still return 200 but log the invalid code
      const data = await response.json()
      console.log('Invalid ref code response:', data)
    })
  })

  describe('GET /auth/signout/route', () => {
    it('should successfully sign out user', async () => {
      // First need to be logged in
      // Then call signout
      const response = await fetch(`${BASE_URL}/auth/signout`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      expect(response.ok).toBe(true)
    })

    it('should handle signout when not logged in', async () => {
      const response = await fetch(`${BASE_URL}/auth/signout`, {
        method: 'GET',
      })

      // Should succeed even if not logged in
      expect(response.ok).toBe(true)
    })
  })

  describe('Session Validation', () => {
    it('should validate active session via middleware', async () => {
      // Access protected route
      const response = await fetch(`${BASE_URL}/dashboard`, {
        credentials: 'include',
      })

      // Will redirect to login if no session
      console.log('Session validation status:', response.status)
    })

    it('should refresh expired session automatically', async () => {
      // This would require manipulating session expiry
      console.log('Manual test: Wait for session expiry and verify auto-refresh')
    })
  })
})
