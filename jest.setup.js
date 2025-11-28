/**
 * Jest Setup File
 * 
 * This file runs before each test file.
 * Use it to configure testing libraries and global test utilities.
 */

// Load environment variables for testing
require('dotenv').config({ path: '.env.local' })

// Extend Jest matchers with @testing-library/jest-dom
require('@testing-library/jest-dom')

// Set up global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock environment variables if needed
process.env.NODE_ENV = 'test'

// Ensure we're using test mode for Stripe
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.warn('⚠️  WARNING: Not using Stripe test mode key!')
}

// Verify required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.warn('⚠️  WARNING: Missing environment variables:', missingEnvVars.join(', '))
  console.warn('Some tests may fail. Copy .env.example to .env.local and fill in values.')
}
