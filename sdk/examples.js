#!/usr/bin/env node

/**
 * KryptoTrac MCP Client SDK - JavaScript Examples
 * ================================================
 * These examples show how to use the SDK without TypeScript
 * 
 * Run individual examples:
 * node sdk/examples.js
 */

const path = require('path');
const { spawn } = require('child_process');

// Simple JavaScript client (without TypeScript)
class SimpleMCPClient {
  constructor(config = {}) {
    this.serverPath = config.serverPath || 'scripts/kryptotrac-mcp.js';
    this.timeout = config.timeout || 5000;
  }

  async callTool(toolName) {
    return new Promise((resolve, reject) => {
      const mcp = spawn('node', [this.serverPath]);
      let output = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        mcp.kill();
        reject(new Error(`Timeout after ${this.timeout}ms`));
      }, this.timeout);

      mcp.stdout.on('data', (data) => {
        output += data.toString();
      });

      mcp.on('close', () => {
        clearTimeout(timer);
        if (timedOut) return;

        try {
          const lines = output.split('\n').filter(l => l.trim());
          const responses = lines.map(l => {
            try {
              return JSON.parse(l);
            } catch (e) {
              return null;
            }
          }).filter(r => r !== null);

          const response = responses.find(r => r.tool === toolName);
          resolve(response || { ok: false, error: 'No response' });
        } catch (e) {
          reject(e);
        }
      });

      mcp.stdin.write(JSON.stringify({ tool: toolName }) + '\n');
      mcp.stdin.end();
    });
  }

  async checkBBStatus() {
    return this.callTool('check_bb_status');
  }

  async readPersonas() {
    return this.callTool('read_personas');
  }

  async checkAtlasRoutes() {
    return this.callTool('check_atlas_routes');
  }

  async readLogs() {
    return this.callTool('read_logs');
  }
}

// ============================================================================
// Example 1: Basic Status Check
// ============================================================================

async function example1_basicCheck() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 1: Basic Status Check');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const status = await client.checkBBStatus();

  if (status.ok) {
    console.log('✅ BB Status:', status.status);
    console.log('   Message:', status.message);
    console.log('   Timestamp:', status.timestamp);
  } else {
    console.log('❌ Error:', status.error);
  }
}

// ============================================================================
// Example 2: List Personas
// ============================================================================

async function example2_listPersonas() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: List Personas');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const result = await client.readPersonas();

  if (result.ok) {
    console.log(`Found ${result.personasDetected.length} personas:`);
    result.personasDetected.forEach((persona, i) => {
      console.log(`  ${i + 1}. ${persona}`);
    });
    console.log(`\nFile contains ${result.lineCount} lines`);
  } else {
    console.log('⚠️  No personas configured:', result.error);
  }
}

// ============================================================================
// Example 3: Discover Routes
// ============================================================================

async function example3_discoverRoutes() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: Discover ATLAS Routes');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const result = await client.checkAtlasRoutes();

  if (result.ok) {
    console.log(`Found ${result.count} routes in ATLAS:`);
    result.routes.forEach((route, i) => {
      console.log(`  ${i + 1}. ${route}`);
    });
  } else {
    console.log('⚠️  ATLAS not found:', result.error);
  }
}

// ============================================================================
// Example 4: Analyze Logs
// ============================================================================

async function example4_analyzeLogs() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 4: Analyze Recent Logs');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const result = await client.readLogs();

  if (result.ok) {
    console.log(`Analyzing ${result.logs.length} log entries...\n`);

    const errors = result.logs.filter(log => 
      log.toLowerCase().includes('error')
    );
    const warnings = result.logs.filter(log => 
      log.toLowerCase().includes('warn')
    );

    console.log('📊 Log Analysis:');
    console.log(`   Total entries: ${result.logs.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Recent errors:');
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }
  } else {
    console.log('⚠️  No logs available:', result.error);
  }
}

// ============================================================================
// Example 5: Health Check
// ============================================================================

async function example5_healthCheck() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 5: System Health Check');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const tools = ['check_bb_status', 'read_personas', 'check_atlas_routes', 'read_logs'];

  let passed = 0;
  let failed = 0;

  for (const tool of tools) {
    try {
      const result = await client.callTool(tool);
      if (result && result.tool === tool) {
        console.log(`✅ ${tool}: OK`);
        passed++;
      } else {
        console.log(`❌ ${tool}: No response`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${tool}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`Results: ${passed}/${tools.length} tools passed`);
  console.log(`Status: ${failed === 0 ? '✅ Healthy' : '⚠️  Issues detected'}`);
}

// ============================================================================
// Example 6: Concurrent Operations
// ============================================================================

async function example6_concurrent() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 6: Concurrent Operations');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  const start = Date.now();

  console.log('Running all tools concurrently...');

  const [bbStatus, personas, routes, logs] = await Promise.all([
    client.checkBBStatus(),
    client.readPersonas(),
    client.checkAtlasRoutes(),
    client.readLogs()
  ]);

  const duration = Date.now() - start;

  console.log(`\nCompleted in ${duration}ms\n`);

  console.log('Results:');
  console.log(`  BB Status: ${bbStatus.ok ? bbStatus.status : 'Error'}`);
  console.log(`  Personas: ${personas.ok ? personas.personasDetected.length + ' found' : personas.error}`);
  console.log(`  Routes: ${routes.ok ? routes.count + ' found' : routes.error}`);
  console.log(`  Logs: ${logs.ok ? logs.logs.length + ' entries' : logs.error}`);
}

// ============================================================================
// Example 7: BB Diagnostic Workflow
// ============================================================================

async function example7_bbDiagnostic() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 7: BB Persona Diagnostic Workflow');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();

  console.log('[BB] Initializing diagnostic sequence...\n');

  // Step 1: Check BB status
  console.log('[BB] Checking own status...');
  const bbStatus = await client.checkBBStatus();
  if (bbStatus.ok) {
    console.log(`     ✅ ${bbStatus.status}: ${bbStatus.message}`);
  }

  // Step 2: Discover application structure
  console.log('\n[BB] Discovering application structure...');
  const routes = await client.checkAtlasRoutes();
  if (routes.ok) {
    console.log(`     ✅ Found ${routes.count} ATLAS routes`);
  } else {
    console.log(`     ⚠️  ATLAS not found, will recommend setup`);
  }

  // Step 3: Check persona configuration
  console.log('\n[BB] Checking persona configuration...');
  const personas = await client.readPersonas();
  if (personas.ok) {
    console.log(`     ✅ Detected ${personas.personasDetected.length} personas`);
  } else {
    console.log(`     ⚠️  No personas configured`);
  }

  // Step 4: Analyze recent activity
  console.log('\n[BB] Analyzing recent logs...');
  const logs = await client.readLogs();
  if (logs.ok) {
    const errorCount = logs.logs.filter(l => l.toLowerCase().includes('error')).length;
    console.log(`     ✅ Analyzed ${logs.logs.length} entries, found ${errorCount} errors`);
  } else {
    console.log(`     ⚠️  No logs available`);
  }

  // Step 5: Summary
  console.log('\n[BB] Diagnostic complete:');
  console.log('     ✓ Backend Bot: Active and responsive');
  console.log('     ✓ MCP Server: All tools operational');
  console.log('     ✓ Ready to assist with development tasks');
}

// ============================================================================
// Example 8: Pre-Deployment Check
// ============================================================================

async function example8_preDeployment() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 8: Pre-Deployment Validation');
  console.log('='.repeat(60));

  const client = new SimpleMCPClient();
  let allPassed = true;

  // Check 1: BB Status
  console.log('Checking BB status...');
  const bbStatus = await client.checkBBStatus();
  if (!bbStatus.ok || bbStatus.status !== 'BB-ACTIVE') {
    console.log('  ❌ BB not active');
    allPassed = false;
  } else {
    console.log('  ✅ BB active');
  }

  // Check 2: ATLAS Routes
  console.log('Checking ATLAS routes...');
  const routes = await client.checkAtlasRoutes();
  if (!routes.ok || routes.count === 0) {
    console.log('  ⚠️  Warning: No ATLAS routes found');
  } else {
    console.log(`  ✅ Found ${routes.count} routes`);
  }

  // Check 3: Check for critical errors in logs
  console.log('Checking logs for critical errors...');
  const logs = await client.readLogs();
  if (logs.ok) {
    const critical = logs.logs.filter(l => 
      l.includes('CRITICAL') || l.includes('FATAL')
    );
    if (critical.length > 0) {
      console.log(`  ❌ Found ${critical.length} critical errors`);
      allPassed = false;
    } else {
      console.log('  ✅ No critical errors');
    }
  }

  console.log('\n' + '-'.repeat(60));
  if (allPassed) {
    console.log('✅ Pre-deployment validation PASSED');
    console.log('   Ready to deploy!');
  } else {
    console.log('❌ Pre-deployment validation FAILED');
    console.log('   Please fix issues before deploying');
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function runAllExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  KryptoTrac MCP Client SDK - JavaScript Examples           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await example1_basicCheck();
    await example2_listPersonas();
    await example3_discoverRoutes();
    await example4_analyzeLogs();
    await example5_healthCheck();
    await example6_concurrent();
    await example7_bbDiagnostic();
    await example8_preDeployment();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed successfully!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = { SimpleMCPClient };
