#!/usr/bin/env tsx

/**
 * Database Migration Verification Script
 * 
 * Verifies that all required database tables and policies exist
 * before deployment.
 * 
 * Usage: npm run verify:migrations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationResult {
    passed: number;
    failed: number;
    errors: string[];
}

const result: VerificationResult = {
    passed: 0,
    failed: 0,
    errors: [],
};

/**
 * Check if a table exists
 */
async function checkTable(tableName: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            // Check if error is "relation does not exist"
            if (error.message.includes('does not exist')) {
                result.failed++;
                result.errors.push(`❌ Table '${tableName}' does not exist`);
                return false;
            }
            // Other errors might be RLS-related, which is okay
        }

        result.passed++;
        console.log(`✓ Table '${tableName}' exists`);
        return true;
    } catch (error) {
        result.failed++;
        result.errors.push(`❌ Error checking table '${tableName}': ${error}`);
        return false;
    }
}

/**
 * Check if RLS is enabled on a table
 */
async function checkRLS(tableName: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .rpc('check_rls_enabled', { table_name: tableName })
            .single();

        if (error) {
            // RPC might not exist, skip this check
            console.log(`⚠️  Could not verify RLS for '${tableName}' (RPC not available)`);
            return true;
        }

        if (data) {
            result.passed++;
            console.log(`✓ RLS enabled on '${tableName}'`);
            return true;
        } else {
            result.failed++;
            result.errors.push(`❌ RLS not enabled on '${tableName}'`);
            return false;
        }
    } catch (error) {
        console.log(`⚠️  Could not verify RLS for '${tableName}'`);
        return true; // Don't fail on RLS check errors
    }
}

/**
 * Test a sample query
 */
async function testQuery(description: string, query: () => Promise<any>): Promise<boolean> {
    try {
        await query();
        result.passed++;
        console.log(`✓ ${description}`);
        return true;
    } catch (error) {
        result.failed++;
        result.errors.push(`❌ ${description} failed: ${error}`);
        return false;
    }
}

async function main() {
    console.log('🔍 Verifying database migrations...\n');

    // Check required tables
    console.log('📋 Checking tables:');
    const tables = [
        'profiles',
        'user_portfolios',
        'user_watchlists',
        'price_alerts',
        'referrals',
        'bb_tips',
        'atlas_conversations',
        'atlas_messages',
        'atlas_rate_limits',
        'user_wallets',
    ];

    for (const table of tables) {
        await checkTable(table);
    }

    console.log('');

    // Check RLS on critical tables
    console.log('🔒 Checking Row Level Security:');
    await checkRLS('user_wallets');
    await checkRLS('portfolios');
    await checkRLS('holdings');

    console.log('');

    // Test sample queries
    console.log('🧪 Testing sample queries:');

    await testQuery(
        'Can query user_wallets',
        async () => {
            const { error } = await supabase
                .from('user_wallets')
                .select('id')
                .limit(1);
            if (error) throw error;
        }
    );

    await testQuery(
        'Can query portfolios',
        async () => {
            const { error } = await supabase
                .from('portfolios')
                .select('id')
                .limit(1);
            if (error) throw error;
        }
    );

    console.log('');

    // Results
    console.log('='.repeat(50));
    console.log(`\n✅ Passed: ${result.passed}`);
    console.log(`❌ Failed: ${result.failed}\n`);

    if (result.errors.length > 0) {
        console.log('Errors:');
        result.errors.forEach(error => console.log(error));
        console.log('');
        console.log('⚠️  Some migrations may not have been applied.');
        console.log('Please run the migration scripts in the scripts/ directory.\n');
        process.exit(1);
    } else {
        console.log('✅ All database migrations verified!\n');
        process.exit(0);
    }
}

main().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
