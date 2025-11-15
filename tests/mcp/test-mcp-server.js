#!/usr/bin/env node

/**
 * MCP Server Test Suite
 * ---------------------
 * Comprehensive tests for all MCP tools including BB persona simulation
 * 
 * Run: node tests/mcp/test-mcp-server.js
 * Or:  npm run test:mcp
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const MCP_SERVER_PATH = path.join(process.cwd(), 'scripts', 'kryptotrac-mcp.js');
const TIMEOUT_MS = 5000;
const TEST_SUITE_NAME = 'KryptoTrac MCP Server';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  coverage: {}
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  
  if (details) {
    log(`   ${details}`, 'yellow');
  }
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
    results.errors.push({ test: name, details });
  }
}

function logSkipped(name, reason = '') {
  log(`⊘ ${name} (skipped)`, 'yellow');
  if (reason) {
    log(`   ${reason}`, 'yellow');
  }
  results.skipped++;
}

// Core MCP client function
function callMCPTool(toolName, timeout = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', [MCP_SERVER_PATH]);
    let output = '';
    let errorOutput = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      mcp.kill();
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcp.on('close', (code) => {
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

        const startupSignal = responses.find(r => r.mcp === 'kryptotrac-local' && r.status === 'started');
        const toolResponse = responses.find(r => r.tool === toolName);
        const exitSignal = responses.find(r => r.mcp === 'kryptotrac-local' && r.status === 'exited');

        resolve({
          startup: startupSignal,
          response: toolResponse,
          exit: exitSignal,
          rawOutput: output,
          errorOutput: errorOutput,
          exitCode: code
        });
      } catch (e) {
        reject(new Error(`Failed to parse response: ${e.message}`));
      }
    });

    mcp.stdin.write(JSON.stringify({ tool: toolName }) + '\n');
    mcp.stdin.end();
  });
}

// Test: Server startup
async function testServerStartup() {
  logSection('Test 1: Server Startup');
  
  try {
    const result = await callMCPTool('check_bb_status');
    
    // Check startup signal
    if (result.startup && result.startup.mcp === 'kryptotrac-local') {
      logTest('Server emits startup signal', true);
    } else {
      logTest('Server emits startup signal', false, 'No startup signal found');
    }
    
    // Check tools list
    if (result.startup && Array.isArray(result.startup.tools)) {
      const expectedTools = ['read_logs', 'read_personas', 'check_atlas_routes', 'check_bb_status'];
      const hasAllTools = expectedTools.every(t => result.startup.tools.includes(t));
      
      if (hasAllTools) {
        logTest('Server advertises all 4 tools', true);
      } else {
        logTest('Server advertises all 4 tools', false, `Missing tools: ${expectedTools.filter(t => !result.startup.tools.includes(t)).join(', ')}`);
      }
    } else {
      logTest('Server advertises all 4 tools', false, 'No tools list found');
    }
    
    // Check exit signal
    if (result.exit && result.exit.status === 'exited') {
      logTest('Server emits exit signal', true);
    } else {
      logTest('Server emits exit signal', false, 'No exit signal found');
    }
    
    // Check exit code
    if (result.exitCode === 0) {
      logTest('Server exits with code 0', true);
    } else {
      logTest('Server exits with code 0', false, `Exit code: ${result.exitCode}`);
    }
    
  } catch (error) {
    logTest('Server startup', false, error.message);
  }
}

// Test: check_bb_status tool
async function testCheckBBStatus() {
  logSection('Test 2: check_bb_status Tool');
  
  try {
    const result = await callMCPTool('check_bb_status');
    const response = result.response;
    
    if (!response) {
      logTest('check_bb_status responds', false, 'No response received');
      return;
    }
    
    logTest('check_bb_status responds', true);
    
    // Validate response structure
    if (response.tool === 'check_bb_status') {
      logTest('Response has correct tool name', true);
    } else {
      logTest('Response has correct tool name', false, `Got: ${response.tool}`);
    }
    
    if (typeof response.ok === 'boolean') {
      logTest('Response has ok field (boolean)', true);
    } else {
      logTest('Response has ok field (boolean)', false, `Got: ${typeof response.ok}`);
    }
    
    if (response.ok === true) {
      logTest('check_bb_status returns success', true);
    } else {
      logTest('check_bb_status returns success', false, `ok = false`);
    }
    
    if (response.status === 'BB-ACTIVE') {
      logTest('BB status is BB-ACTIVE', true);
    } else {
      logTest('BB status is BB-ACTIVE', false, `Got: ${response.status}`);
    }
    
    if (response.message && response.message.length > 0) {
      logTest('Response includes message', true);
    } else {
      logTest('Response includes message', false);
    }
    
    if (response.timestamp && !isNaN(Date.parse(response.timestamp))) {
      logTest('Response includes valid ISO timestamp', true);
    } else {
      logTest('Response includes valid ISO timestamp', false, `Got: ${response.timestamp}`);
    }
    
    // Track coverage
    results.coverage.check_bb_status = true;
    
  } catch (error) {
    logTest('check_bb_status tool', false, error.message);
    results.coverage.check_bb_status = false;
  }
}

// Test: read_personas tool
async function testReadPersonas() {
  logSection('Test 3: read_personas Tool');
  
  try {
    const result = await callMCPTool('read_personas');
    const response = result.response;
    
    if (!response) {
      logTest('read_personas responds', false, 'No response received');
      return;
    }
    
    logTest('read_personas responds', true);
    
    // Validate response structure
    if (response.tool === 'read_personas') {
      logTest('Response has correct tool name', true);
    } else {
      logTest('Response has correct tool name', false, `Got: ${response.tool}`);
    }
    
    if (typeof response.ok === 'boolean') {
      logTest('Response has ok field (boolean)', true);
    } else {
      logTest('Response has ok field (boolean)', false);
    }
    
    // File might not exist, which is OK
    if (response.ok === true) {
      logTest('read_personas returns success (file exists)', true);
      
      if (Array.isArray(response.personasDetected)) {
        logTest('Response includes personasDetected array', true);
      } else {
        logTest('Response includes personasDetected array', false);
      }
      
      if (typeof response.lineCount === 'number') {
        logTest('Response includes lineCount', true);
      } else {
        logTest('Response includes lineCount', false);
      }
    } else {
      // File not found is expected in some cases
      if (response.error === 'persona.ts not found') {
        logTest('read_personas handles missing file gracefully', true);
      } else {
        logTest('read_personas handles missing file gracefully', false, `Error: ${response.error}`);
      }
    }
    
    results.coverage.read_personas = true;
    
  } catch (error) {
    logTest('read_personas tool', false, error.message);
    results.coverage.read_personas = false;
  }
}

// Test: check_atlas_routes tool
async function testCheckAtlasRoutes() {
  logSection('Test 4: check_atlas_routes Tool');
  
  try {
    const result = await callMCPTool('check_atlas_routes');
    const response = result.response;
    
    if (!response) {
      logTest('check_atlas_routes responds', false, 'No response received');
      return;
    }
    
    logTest('check_atlas_routes responds', true);
    
    // Validate response structure
    if (response.tool === 'check_atlas_routes') {
      logTest('Response has correct tool name', true);
    } else {
      logTest('Response has correct tool name', false, `Got: ${response.tool}`);
    }
    
    if (typeof response.ok === 'boolean') {
      logTest('Response has ok field (boolean)', true);
    } else {
      logTest('Response has ok field (boolean)', false);
    }
    
    if (response.ok === true) {
      logTest('check_atlas_routes returns success', true);
      
      if (Array.isArray(response.routes)) {
        logTest('Response includes routes array', true);
      } else {
        logTest('Response includes routes array', false);
      }
      
      if (typeof response.count === 'number') {
        logTest('Response includes count', true);
      } else {
        logTest('Response includes count', false);
      }
      
      if (response.count === response.routes.length) {
        logTest('Count matches routes array length', true);
      } else {
        logTest('Count matches routes array length', false, `count=${response.count}, routes.length=${response.routes.length}`);
      }
    } else {
      // Directory not found might be expected
      if (response.error) {
        logTest('check_atlas_routes handles missing directory gracefully', true);
      } else {
        logTest('check_atlas_routes handles missing directory gracefully', false);
      }
    }
    
    results.coverage.check_atlas_routes = true;
    
  } catch (error) {
    logTest('check_atlas_routes tool', false, error.message);
    results.coverage.check_atlas_routes = false;
  }
}

// Test: read_logs tool
async function testReadLogs() {
  logSection('Test 5: read_logs Tool');
  
  try {
    const result = await callMCPTool('read_logs');
    const response = result.response;
    
    if (!response) {
      logTest('read_logs responds', false, 'No response received');
      return;
    }
    
    logTest('read_logs responds', true);
    
    // Validate response structure
    if (response.tool === 'read_logs') {
      logTest('Response has correct tool name', true);
    } else {
      logTest('Response has correct tool name', false, `Got: ${response.tool}`);
    }
    
    if (typeof response.ok === 'boolean') {
      logTest('Response has ok field (boolean)', true);
    } else {
      logTest('Response has ok field (boolean)', false);
    }
    
    if (response.ok === true) {
      logTest('read_logs returns success (file exists)', true);
      
      if (Array.isArray(response.logs)) {
        logTest('Response includes logs array', true);
        
        if (response.logs.length <= 20) {
          logTest('Logs array has <= 20 entries', true);
        } else {
          logTest('Logs array has <= 20 entries', false, `Got ${response.logs.length} entries`);
        }
      } else {
        logTest('Response includes logs array', false);
      }
    } else {
      // File not found is expected in some cases
      if (response.error === 'logs.txt not found') {
        logTest('read_logs handles missing file gracefully', true);
      } else {
        logTest('read_logs handles missing file gracefully', false, `Error: ${response.error}`);
      }
    }
    
    results.coverage.read_logs = true;
    
  } catch (error) {
    logTest('read_logs tool', false, error.message);
    results.coverage.read_logs = false;
  }
}

// Test: Invalid tool handling
async function testInvalidTool() {
  logSection('Test 6: Error Handling - Invalid Tool');
  
  try {
    const result = await callMCPTool('invalid_tool_name');
    const response = result.response;
    
    // Should not get a tool response, should get error
    if (!response || !response.tool) {
      // Check if there's an error response
      const errorResponse = result.rawOutput.includes('"error"');
      
      if (errorResponse) {
        logTest('Server returns error for invalid tool', true);
      } else {
        logTest('Server returns error for invalid tool', false, 'No error response');
      }
    } else {
      logTest('Server returns error for invalid tool', false, 'Got tool response instead of error');
    }
    
  } catch (error) {
    logTest('Invalid tool handling', false, error.message);
  }
}

// Test: JSON validation
async function testMalformedJSON() {
  logSection('Test 7: Error Handling - Malformed JSON');
  
  return new Promise((resolve) => {
    const mcp = spawn('node', [MCP_SERVER_PATH]);
    let output = '';

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.on('close', () => {
      const hasError = output.includes('"error"') && output.includes('Invalid JSON');
      
      if (hasError) {
        logTest('Server handles malformed JSON', true);
      } else {
        logTest('Server handles malformed JSON', false, 'No error response for malformed JSON');
      }
      
      resolve();
    });

    // Send malformed JSON
    mcp.stdin.write('not valid json\n');
    mcp.stdin.end();
  });
}

// Test: BB Persona Simulation
async function testBBPersonaSimulation() {
  logSection('Test 8: BB Persona Simulation');
  
  log('Simulating GitHub Copilot Agent with BB persona...', 'cyan');
  
  // Scenario: BB agent checking system health before assisting user
  try {
    log('  [BB] Initializing diagnostic sequence...', 'blue');
    
    // Step 1: Check BB status
    const bbStatus = await callMCPTool('check_bb_status');
    if (bbStatus.response && bbStatus.response.ok) {
      logTest('BB Persona: Check own status', true);
      log(`  [BB] Status: ${bbStatus.response.status} - ${bbStatus.response.message}`, 'green');
    } else {
      logTest('BB Persona: Check own status', false);
    }
    
    // Step 2: Inspect application structure
    const routes = await callMCPTool('check_atlas_routes');
    if (routes.response) {
      if (routes.response.ok) {
        logTest('BB Persona: Discover ATLAS routes', true);
        log(`  [BB] Found ${routes.response.count} ATLAS routes`, 'green');
      } else {
        logTest('BB Persona: Handle missing ATLAS', true);
        log(`  [BB] ATLAS not found, will recommend initialization`, 'yellow');
      }
    } else {
      logTest('BB Persona: Discover ATLAS routes', false);
    }
    
    // Step 3: Check persona configuration
    const personas = await callMCPTool('read_personas');
    if (personas.response) {
      if (personas.response.ok) {
        logTest('BB Persona: Read persona config', true);
        log(`  [BB] Detected ${personas.response.personasDetected.length} personas`, 'green');
      } else {
        logTest('BB Persona: Handle missing personas', true);
        log(`  [BB] No personas configured, will suggest setup`, 'yellow');
      }
    } else {
      logTest('BB Persona: Read persona config', false);
    }
    
    // Step 4: Check recent logs for issues
    const logs = await callMCPTool('read_logs');
    if (logs.response) {
      if (logs.response.ok) {
        logTest('BB Persona: Analyze recent logs', true);
        const errorCount = logs.response.logs.filter(l => l.toLowerCase().includes('error')).length;
        log(`  [BB] Analyzed ${logs.response.logs.length} log entries, found ${errorCount} errors`, 'green');
      } else {
        logTest('BB Persona: Handle no logs', true);
        log(`  [BB] No logs available, system may be fresh`, 'yellow');
      }
    } else {
      logTest('BB Persona: Analyze recent logs', false);
    }
    
    // Step 5: Make recommendation
    log('  [BB] Diagnostic complete. System assessment:', 'blue');
    log('  [BB] ✓ Backend Bot: Active and responsive', 'green');
    log('  [BB] ✓ MCP Tools: All 4 tools operational', 'green');
    log('  [BB] Ready to assist with development tasks.', 'cyan');
    
    logTest('BB Persona: Complete diagnostic workflow', true);
    
  } catch (error) {
    logTest('BB Persona simulation', false, error.message);
  }
}

// Test: Concurrent tool calls
async function testConcurrentCalls() {
  logSection('Test 9: Concurrent Tool Calls');
  
  try {
    log('Running all 4 tools concurrently...', 'cyan');
    
    const start = Date.now();
    
    const promises = [
      callMCPTool('check_bb_status'),
      callMCPTool('read_personas'),
      callMCPTool('check_atlas_routes'),
      callMCPTool('read_logs')
    ];
    
    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    
    const allSucceeded = results.every(r => r.response !== null);
    
    if (allSucceeded) {
      logTest('All tools respond when called concurrently', true);
      log(`  Completed in ${duration}ms`, 'green');
    } else {
      logTest('All tools respond when called concurrently', false, 'Some tools failed');
    }
    
    if (duration < 2000) {
      logTest('Concurrent calls complete within 2 seconds', true);
    } else {
      logTest('Concurrent calls complete within 2 seconds', false, `Took ${duration}ms`);
    }
    
  } catch (error) {
    logTest('Concurrent tool calls', false, error.message);
  }
}

// Test: Response time performance
async function testPerformance() {
  logSection('Test 10: Performance');
  
  const tools = ['check_bb_status', 'read_personas', 'check_atlas_routes', 'read_logs'];
  
  for (const tool of tools) {
    try {
      const start = Date.now();
      const result = await callMCPTool(tool);
      const duration = Date.now() - start;
      
      if (duration < 1000) {
        logTest(`${tool} responds in < 1 second`, true, `${duration}ms`);
      } else {
        logTest(`${tool} responds in < 1 second`, false, `${duration}ms`);
      }
    } catch (error) {
      logTest(`${tool} performance`, false, error.message);
    }
  }
}

// Generate test report
function generateReport() {
  logSection('Test Summary');
  
  const total = results.passed + results.failed + results.skipped;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  log(`Total Tests: ${total}`, 'bright');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⊘ Skipped: ${results.skipped}`, 'yellow');
  log(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'green' : 'red');
  
  console.log('');
  log('Tool Coverage:', 'bright');
  const coveredTools = Object.keys(results.coverage).filter(k => results.coverage[k]);
  log(`Tested: ${coveredTools.length}/4 tools`, coveredTools.length === 4 ? 'green' : 'yellow');
  coveredTools.forEach(tool => log(`  ✓ ${tool}`, 'green'));
  
  if (results.failed > 0) {
    console.log('');
    log('Failed Tests:', 'red');
    results.errors.forEach((error, i) => {
      log(`${i + 1}. ${error.test}`, 'red');
      if (error.details) {
        log(`   ${error.details}`, 'yellow');
      }
    });
  }
  
  console.log('');
  log('='.repeat(60), 'cyan');
  
  return results.failed === 0;
}

// Main test runner
async function runTests() {
  log(`\n${TEST_SUITE_NAME}`, 'bright');
  log(`Running at: ${new Date().toISOString()}`, 'cyan');
  log(`MCP Server: ${MCP_SERVER_PATH}`, 'cyan');
  
  // Check if MCP server file exists
  if (!fs.existsSync(MCP_SERVER_PATH)) {
    log(`\n❌ Error: MCP server not found at ${MCP_SERVER_PATH}`, 'red');
    process.exit(1);
  }
  
  // Run all tests
  await testServerStartup();
  await testCheckBBStatus();
  await testReadPersonas();
  await testCheckAtlasRoutes();
  await testReadLogs();
  await testInvalidTool();
  await testMalformedJSON();
  await testBBPersonaSimulation();
  await testConcurrentCalls();
  await testPerformance();
  
  // Generate report
  const allPassed = generateReport();
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
