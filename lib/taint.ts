/**
 * Data Tainting Utilities for React Server Components
 * 
 * This module provides utilities to taint sensitive server-side data
 * using React 19's experimental taint APIs. Tainting prevents accidental
 * exposure of sensitive values (API keys, secrets, tokens) to the client.
 * 
 * SECURITY: When a tainted value is attempted to be serialized and sent
 * to a client component, React will throw an error, preventing data leakage.
 * 
 * References:
 * - React 19 Taint API: https://react.dev/reference/react/experimental_taintObjectReference
 * - Next.js Security: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#security
 * 
 * @packageDocumentation
 */

import 'server-only'
import { experimental_taintObjectReference, experimental_taintUniqueValue } from 'react'

/**
 * Taints a unique string value (like an API key or secret) to prevent
 * accidental exposure to the client.
 * 
 * @param message - Error message shown if value is exposed
 * @param value - The sensitive value to taint (will be hidden in error messages)
 * @example
 * ```ts
 * const apiKey = process.env.STRIPE_SECRET_KEY!
 * taintUniqueValue('Stripe secret key must not be sent to the client', apiKey)
 * ```
 */
// Safe wrapper for taintUniqueValue
export function taintUniqueValue(message: string, value: string): void {
  if (typeof experimental_taintUniqueValue === 'function' && typeof value === 'string' && value.length > 0) {
    experimental_taintUniqueValue(message, value, value)
  }
}

/**
 * Taints an object reference (like a configuration object) to prevent
 * accidental exposure to the client.
 * 
 * @param message - Error message shown if object is exposed
 * @param object - The sensitive object to taint
 * @example
 * ```ts
 * const config = { apiKey: process.env.API_KEY }
 * taintObjectReference('Config must not be sent to the client', config)
 * ```
 */
export function taintObjectReference(message: string, object: object): void {
  if (typeof experimental_taintObjectReference === 'function' && object && typeof object === 'object') {
    experimental_taintObjectReference(message, object)
  }
}

/**
 * Taints multiple environment variable values at once.
 * Useful for tainting all sensitive values in a module initialization.
 * 
 * @param variables - Array of { name, value } objects to taint
 * @example
 * ```ts
 * taintEnvironmentVariables([
 *   { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY },
 *   { name: 'WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET }
 * ])
 * ```
 */
export function taintEnvironmentVariables(
  variables: Array<{ name: string; value: string | undefined }>
): void {
  variables.forEach(({ name, value }) => {
    if (value) {
      taintUniqueValue(
        `Environment variable ${name} must not be sent to the client. ` +
        `This is a sensitive server-side value that should never be exposed.`,
        value
      )
    }
  })
}

/**
 * Common sensitive environment variables that should be tainted.
 * This is a convenience array for common secret patterns.
 */
export const SENSITIVE_ENV_PATTERNS = [
  'SECRET',
  'KEY',
  'TOKEN',
  'PASSWORD',
  'PRIVATE',
  'CREDENTIAL',
] as const

/**
 * Automatically taints all environment variables matching sensitive patterns.
 * Use with caution - prefer explicit tainting for better control.
 * 
 * @param envObject - The environment object to scan (defaults to process.env)
 * @returns Number of variables tainted
 */
export function taintSensitiveEnvironmentVariables(
  envObject: Record<string, string | undefined> = process.env
): number {
  let taintedCount = 0

  Object.entries(envObject).forEach(([key, value]) => {
    // Skip NEXT_PUBLIC_* variables as they're meant to be public
    if (key.startsWith('NEXT_PUBLIC_')) {
      return
    }

    // Check if key matches any sensitive pattern
    const isSensitive = SENSITIVE_ENV_PATTERNS.some(pattern =>
      key.toUpperCase().includes(pattern)
    )

    if (isSensitive && value) {
      taintUniqueValue(
        `Environment variable ${key} contains sensitive data and must not be sent to the client`,
        value
      )
      taintedCount++
    }
  })

  return taintedCount
}
