#!/usr/bin/env tsx

/**
 * Environment Validation Script
 * 
 * Validates that all required environment variables are present
 * and have valid formats before deployment.
 * 
 * Usage: npm run validate:env
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
};

/**
 * Check if environment variable exists
 */
function checkRequired(name: string, description: string): void {
    if (!process.env[name]) {
        result.valid = false;
        result.errors.push(`❌ ${name} is required (${description})`);
    } else {
        console.log(`✓ ${name} is set`);
    }
}

/**
 * Check if environment variable has valid URL format
 */
function checkUrl(name: string, description: string): void {
    const value = process.env[name];

    if (!value) {
        result.valid = false;
        result.errors.push(`❌ ${name} is required (${description})`);
        return;
    }

    try {
        new URL(value);
        console.log(`✓ ${name} is valid URL`);
    } catch {
        result.valid = false;
        result.errors.push(`❌ ${name} is not a valid URL: ${value}`);
    }
}

/**
 * Check if Stripe key matches environment
 */
function checkStripeKey(name: string): void {
    const value = process.env[name];

    if (!value) {
        result.warnings.push(`⚠️  ${name} is not set (Stripe features disabled)`);
        return;
    }

    const isTest = value.startsWith('sk_test_') || value.startsWith('pk_test_');
    const isProd = value.startsWith('sk_live_') || value.startsWith('pk_live_');

    if (!isTest && !isProd) {
        result.valid = false;
        result.errors.push(`❌ ${name} has invalid format (must start with sk_test_, pk_test_, sk_live_, or pk_live_)`);
        return;
    }

    const nodeEnv = process.env.NODE_ENV || 'development';

    if (nodeEnv === 'production' && isTest) {
        result.warnings.push(`⚠️  ${name} is using TEST key in production environment`);
    }

    if (nodeEnv !== 'production' && isProd) {
        result.warnings.push(`⚠️  ${name} is using LIVE key in non-production environment`);
    }

    console.log(`✓ ${name} is valid ${isTest ? 'TEST' : 'LIVE'} key`);
}

/**
 * Check if API key has valid format
 */
function checkApiKey(name: string, minLength: number = 20): void {
    const value = process.env[name];

    if (!value) {
        result.warnings.push(`⚠️  ${name} is not set (some features may be limited)`);
        return;
    }

    if (value.length < minLength) {
        result.valid = false;
        result.errors.push(`❌ ${name} appears to be invalid (too short)`);
        return;
    }

    console.log(`✓ ${name} is set`);
}

console.log('🔍 Validating environment variables...\n');

// Supabase (Required)
console.log('📦 Supabase Configuration:');
checkUrl('NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL');
checkRequired('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anonymous key');
checkRequired('SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role key');
console.log('');

// Stripe (Optional but recommended)
console.log('💳 Stripe Configuration:');
checkStripeKey('STRIPE_SECRET_KEY');
checkStripeKey('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
console.log('');

// External APIs (Optional)
console.log('🌐 External APIs:');
checkApiKey('COINGECKO_API_KEY', 10);
checkApiKey('ETH_RPC_URL', 10);
console.log('');

// DeepSeek AI (Optional)
console.log('🤖 AI Configuration:');
checkApiKey('DEEPSEEK_API_KEY', 20);
console.log('');

// Results
console.log('\n' + '='.repeat(50));

if (result.errors.length > 0) {
    console.log('\n❌ Validation FAILED\n');
    result.errors.forEach(error => console.log(error));
}

if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:\n');
    result.warnings.forEach(warning => console.log(warning));
}

if (result.valid && result.errors.length === 0) {
    console.log('\n✅ All required environment variables are valid!\n');

    if (result.warnings.length > 0) {
        console.log('Note: Some optional features may be limited due to missing API keys.\n');
    }

    process.exit(0);
} else {
    console.log('\nPlease fix the errors above before deploying.\n');
    process.exit(1);
}
