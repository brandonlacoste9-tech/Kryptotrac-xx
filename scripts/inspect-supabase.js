#!/usr/bin/env node

/**
 * Supabase Database Schema Inspector
 * Connects to your Supabase project and shows all tables, columns, and RLS policies
 * 
 * Usage: node scripts/inspect-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')

// Your Supabase project details
const SUPABASE_URL = 'https://hiuemmkhwiaarpdyncgj.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
    console.log('\nSet it by running:')
    console.log('  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here')
    console.log('\nOr create a .env.local file with:')
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function inspectDatabase() {
    console.log('🔍 Inspecting Supabase Database...')
    console.log('📍 Project: hiuemmkhwiaarpdyncgj')
    console.log('🔗 URL:', SUPABASE_URL)
    console.log()

    try {
        // Get all tables from information_schema
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .order('table_name')

        if (tablesError) {
            console.error('❌ Error fetching tables:', tablesError.message)
            return
        }

        console.log(`📊 Found ${tables?.length || 0} tables in public schema:\n`)

        for (const table of tables || []) {
            const tableName = table.table_name

            // Get columns for this table
            const { data: columns, error: columnsError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_schema', 'public')
                .eq('table_name', tableName)
                .order('ordinal_position')

            if (columnsError) {
                console.log(`  ⚠️  Could not fetch columns for ${tableName}`)
                continue
            }

            console.log(`📋 ${tableName}`)
            console.log('   Columns:')
            columns?.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)'
                console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}`)
            })

            // Try to get row count (this might fail for some tables)
            try {
                const { count, error: countError } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true })

                if (!countError) {
                    console.log(`   📊 Rows: ${count || 0}`)
                }
            } catch (e) {
                // Silently skip count if RLS prevents it
            }

            console.log()
        }

        // Check RLS policies
        console.log('🔒 Checking Row Level Security (RLS) Policies...\n')

        const { data: policies, error: policiesError } = await supabase.rpc('get_policies')

        if (policiesError) {
            console.log('  ℹ️  RLS policy check requires custom function - skipping')
        } else {
            console.log(`   Found ${policies?.length || 0} RLS policies`)
        }

        console.log('\n✅ Database inspection complete!')
        console.log('\n📝 Next steps:')
        console.log('   1. Verify all required tables exist')
        console.log('   2. Check RLS policies are properly configured')
        console.log('   3. Run migrations if needed')

    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

// Run the inspection
inspectDatabase()
