/**
 * Security Tests for Data Tainting
 * 
 * These tests verify that the taint utilities properly protect sensitive
 * server-side data from being accidentally sent to the client.
 * 
 * Note: Since taint APIs throw errors when tainted values are serialized,
 * we test that the taint functions execute without errors when properly used.
 */

import { 
  taintUniqueValue, 
  taintObjectReference, 
  taintEnvironmentVariables,
  taintSensitiveEnvironmentVariables,
  SENSITIVE_ENV_PATTERNS
} from '@/lib/taint'

describe('Taint Security Utilities', () => {
  describe('taintUniqueValue', () => {
    it('should taint a string value without throwing', () => {
      expect(() => {
        taintUniqueValue('Test secret', 'secret-value-123')
      }).not.toThrow()
    })

    it('should handle empty strings gracefully', () => {
      expect(() => {
        taintUniqueValue('Empty secret', '')
      }).not.toThrow()
    })

    it('should handle multiple taints of different values', () => {
      expect(() => {
        taintUniqueValue('Secret 1', 'value1')
        taintUniqueValue('Secret 2', 'value2')
        taintUniqueValue('Secret 3', 'value3')
      }).not.toThrow()
    })
  })

  describe('taintObjectReference', () => {
    it('should taint an object without throwing', () => {
      expect(() => {
        const sensitiveObj = { apiKey: 'secret', token: 'token123' }
        taintObjectReference('Sensitive config', sensitiveObj)
      }).not.toThrow()
    })

    it('should handle complex nested objects', () => {
      expect(() => {
        const config = {
          stripe: { secretKey: 'sk_test_123', webhookSecret: 'whsec_123' },
          supabase: { serviceRoleKey: 'service_key_123' }
        }
        taintObjectReference('Config object', config)
      }).not.toThrow()
    })

    it('should handle arrays of objects', () => {
      expect(() => {
        const secrets = [
          { name: 'secret1', value: 'value1' },
          { name: 'secret2', value: 'value2' }
        ]
        taintObjectReference('Secrets array', secrets)
      }).not.toThrow()
    })
  })

  describe('taintEnvironmentVariables', () => {
    it('should taint multiple environment variables at once', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'API_KEY', value: 'test-key-123' },
          { name: 'SECRET_TOKEN', value: 'test-token-456' },
          { name: 'WEBHOOK_SECRET', value: 'test-webhook-789' }
        ])
      }).not.toThrow()
    })

    it('should skip undefined values gracefully', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'DEFINED_KEY', value: 'value' },
          { name: 'UNDEFINED_KEY', value: undefined },
          { name: 'ANOTHER_KEY', value: 'another-value' }
        ])
      }).not.toThrow()
    })

    it('should handle empty array', () => {
      expect(() => {
        taintEnvironmentVariables([])
      }).not.toThrow()
    })

    it('should handle all undefined values', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'KEY1', value: undefined },
          { name: 'KEY2', value: undefined }
        ])
      }).not.toThrow()
    })
  })

  describe('taintSensitiveEnvironmentVariables', () => {
    it('should identify and taint sensitive environment variables', () => {
      const mockEnv = {
        'STRIPE_SECRET_KEY': 'sk_test_123',
        'DATABASE_PASSWORD': 'password123',
        'API_TOKEN': 'token123',
        'WEBHOOK_SECRET': 'whsec_123',
        'NEXT_PUBLIC_API_URL': 'https://api.example.com', // Should not be tainted
        'NODE_ENV': 'test', // Should not be tainted
        'PORT': '3000' // Should not be tainted
      }

      const taintedCount = taintSensitiveEnvironmentVariables(mockEnv)
      
      // Should taint 4 values: SECRET_KEY, PASSWORD, TOKEN, SECRET
      // Should NOT taint NEXT_PUBLIC_API_URL, NODE_ENV, PORT
      expect(taintedCount).toBe(4)
    })

    it('should skip NEXT_PUBLIC_* variables', () => {
      const mockEnv = {
        'NEXT_PUBLIC_STRIPE_KEY': 'pk_test_123',
        'NEXT_PUBLIC_SUPABASE_URL': 'https://example.supabase.co',
        'STRIPE_SECRET_KEY': 'sk_test_123'
      }

      const taintedCount = taintSensitiveEnvironmentVariables(mockEnv)
      
      // Should only taint STRIPE_SECRET_KEY, not NEXT_PUBLIC_* vars
      expect(taintedCount).toBe(1)
    })

    it('should handle empty environment object', () => {
      const taintedCount = taintSensitiveEnvironmentVariables({})
      expect(taintedCount).toBe(0)
    })

    it('should handle environment with no sensitive variables', () => {
      const mockEnv = {
        'NODE_ENV': 'production',
        'PORT': '3000',
        'HOST': 'localhost'
      }

      const taintedCount = taintSensitiveEnvironmentVariables(mockEnv)
      expect(taintedCount).toBe(0)
    })
  })

  describe('SENSITIVE_ENV_PATTERNS', () => {
    it('should include common sensitive patterns', () => {
      expect(SENSITIVE_ENV_PATTERNS).toContain('SECRET')
      expect(SENSITIVE_ENV_PATTERNS).toContain('KEY')
      expect(SENSITIVE_ENV_PATTERNS).toContain('TOKEN')
      expect(SENSITIVE_ENV_PATTERNS).toContain('PASSWORD')
      expect(SENSITIVE_ENV_PATTERNS).toContain('PRIVATE')
      expect(SENSITIVE_ENV_PATTERNS).toContain('CREDENTIAL')
    })

    it('should have expected length', () => {
      expect(SENSITIVE_ENV_PATTERNS.length).toBe(6)
    })
  })

  describe('Real-world usage scenarios', () => {
    it('should protect Stripe secrets', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'STRIPE_SECRET_KEY', value: 'sk_test_123' },
          { name: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_123' }
        ])
      }).not.toThrow()
    })

    it('should protect Supabase service role key', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'SUPABASE_SERVICE_ROLE_KEY', value: 'service_role_key_123' }
        ])
      }).not.toThrow()
    })

    it('should protect admin and cron secrets', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'ADMIN_ANALYTICS_TOKEN', value: 'admin_token_123' },
          { name: 'CRON_SECRET', value: 'cron_secret_123' }
        ])
      }).not.toThrow()
    })

    it('should protect third-party API tokens', () => {
      expect(() => {
        taintEnvironmentVariables([
          { name: 'X_BEARER_TOKEN', value: 'bearer_token_123' },
          { name: 'COINGECKO_API_KEY', value: 'CG-test-key-123' }
        ])
      }).not.toThrow()
    })

    it('should handle realistic configuration tainting', () => {
      expect(() => {
        // Simulate server-side module initialization
        const stripeKey = 'sk_test_123'
        const webhookSecret = 'whsec_123'
        const serviceRoleKey = 'service_role_123'

        taintUniqueValue('Stripe secret key', stripeKey)
        taintUniqueValue('Webhook secret', webhookSecret)
        taintUniqueValue('Service role key', serviceRoleKey)
      }).not.toThrow()
    })
  })

  describe('Error handling', () => {
    it('should handle null gracefully for object tainting', () => {
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        taintObjectReference('Null object', null)
      }).not.toThrow()
    })

    it('should handle undefined gracefully for object tainting', () => {
      expect(() => {
        // @ts-expect-error Testing runtime behavior
        taintObjectReference('Undefined object', undefined)
      }).not.toThrow()
    })
  })
})
