# Getting Started with KryptoTrac MCP Server

This guide will help you set up and start using the KryptoTrac MCP Server in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 14 or higher (check with `node --version`)
- **Git**: For cloning the repository
- **Terminal**: Command line access

That's it! No additional packages or dependencies needed.

## Quick Start (30 seconds)

### 1. Navigate to Project Root
```bash
cd /path/to/Kryptotrac-xx
```

### 2. Run the MCP Server
```bash
npm run mcp:dev
```

You should see:
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
```

### 3. Test a Tool
Open a new terminal and try:
```bash
echo '{"tool":"check_bb_status"}' | npm run mcp:dev
```

Expected output:
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
{"tool":"check_bb_status","ok":true,"status":"BB-ACTIVE","message":"BB is awake, responding, and synced with ATLAS. I got you.","timestamp":"2025-11-15T08:30:48.876Z"}
{"mcp":"kryptotrac-local","status":"exited"}
```

✅ **Success!** Your MCP server is running.

## Installation Verification

### Check MCP Server File
```bash
ls -la scripts/kryptotrac-mcp.js
```

Should show:
```
-rwxrwxr-x 1 user user 3152 Nov 15 08:28 scripts/kryptotrac-mcp.js
```

### Verify Node.js Version
```bash
node --version
```

Should be v14.0.0 or higher.

### Check NPM Scripts
```bash
npm run
```

Should list `mcp:dev` and `test:mcp` in available scripts.

## Basic Usage

### Method 1: Using NPM Script (Recommended)
```bash
# Start the server
npm run mcp:dev

# In another terminal, send requests
echo '{"tool":"check_bb_status"}' | npm run mcp:dev
```

### Method 2: Direct Node Execution
```bash
# Start the server
node scripts/kryptotrac-mcp.js

# Send request (while server is running in same terminal)
{"tool":"check_bb_status"}
```

### Method 3: Using Echo Pipe (Best for Testing)
```bash
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

### Method 4: Using a Test File
Create a file `test-request.json`:
```json
{"tool":"read_personas"}
```

Run:
```bash
cat test-request.json | node scripts/kryptotrac-mcp.js
```

## Testing All Tools

### Quick Test Script
```bash
#!/bin/bash
echo "Testing all MCP tools..."

for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  echo "----------------------------------------"
  echo "Testing: $tool"
  echo '{"tool":"'$tool'"}' | node scripts/kryptotrac-mcp.js | grep '"tool"'
  echo ""
done

echo "All tests complete!"
```

Save as `test-mcp.sh`, make executable (`chmod +x test-mcp.sh`), and run:
```bash
./test-mcp.sh
```

### Using the Test Suite
```bash
npm run test:mcp
```

This runs the comprehensive test suite that validates all tools.

## Tool Examples

### Example 1: Check BB Status
```bash
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

**Expected Output**:
```json
{"tool":"check_bb_status","ok":true,"status":"BB-ACTIVE","message":"BB is awake, responding, and synced with ATLAS. I got you.","timestamp":"2025-11-15T08:30:48.876Z"}
```

### Example 2: Read Personas
```bash
echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js
```

**Possible Outputs**:
- If personas exist:
  ```json
  {"tool":"read_personas","ok":true,"personasDetected":["defaultPersona","adminPersona"],"lineCount":150}
  ```
- If file not found:
  ```json
  {"tool":"read_personas","ok":false,"error":"persona.ts not found"}
  ```

### Example 3: Check ATLAS Routes
```bash
echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js
```

**Expected Output**:
```json
{"tool":"check_atlas_routes","ok":true,"routes":["page.tsx"],"count":1}
```

### Example 4: Read Logs
```bash
echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js
```

**Possible Outputs**:
- If logs exist:
  ```json
  {"tool":"read_logs","ok":true,"logs":["2025-11-15 08:30:00 - Server started",...]}
  ```
- If file not found:
  ```json
  {"tool":"read_logs","ok":false,"error":"logs.txt not found"}
  ```

## Programmatic Usage (JavaScript)

### Basic Example
```javascript
const { spawn } = require('child_process');

function callMCPTool(toolName) {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', ['scripts/kryptotrac-mcp.js']);
    let output = '';

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.on('close', (code) => {
      const lines = output.split('\n').filter(l => l.trim());
      const responses = lines.map(l => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      }).filter(r => r !== null);

      const toolResponse = responses.find(r => r.tool === toolName);
      resolve(toolResponse || { error: 'No response' });
    });

    mcp.stdin.write(JSON.stringify({ tool: toolName }) + '\n');
    mcp.stdin.end();
  });
}

// Usage
(async () => {
  const status = await callMCPTool('check_bb_status');
  console.log('BB Status:', status);

  const routes = await callMCPTool('check_atlas_routes');
  console.log('ATLAS Routes:', routes);
})();
```

### Advanced Example with Error Handling
```javascript
const { spawn } = require('child_process');

class MCPClient {
  constructor() {
    this.serverPath = 'scripts/kryptotrac-mcp.js';
  }

  async callTool(toolName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const mcp = spawn('node', [this.serverPath]);
      let output = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        mcp.kill();
        reject(new Error(`Tool ${toolName} timed out after ${timeout}ms`));
      }, timeout);

      mcp.stdout.on('data', (data) => {
        output += data.toString();
      });

      mcp.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      mcp.on('close', (code) => {
        clearTimeout(timer);
        
        if (timedOut) return;

        try {
          const lines = output.split('\n').filter(l => l.trim());
          const responses = lines.map(l => JSON.parse(l));
          const toolResponse = responses.find(r => r.tool === toolName);

          if (toolResponse) {
            resolve(toolResponse);
          } else {
            reject(new Error(`No response for tool: ${toolName}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse MCP response: ${e.message}`));
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

// Usage
(async () => {
  const client = new MCPClient();

  try {
    const status = await client.checkBBStatus();
    console.log('✅ BB Status:', status.status);

    const routes = await client.checkAtlasRoutes();
    console.log(`✅ Found ${routes.count} ATLAS routes`);

    const personas = await client.readPersonas();
    if (personas.ok) {
      console.log(`✅ Found ${personas.personasDetected.length} personas`);
    } else {
      console.log('⚠️  No personas configured');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
```

## Common Tasks

### Task 1: Health Check All Tools
```bash
#!/bin/bash
echo "🔍 MCP Health Check"
echo "===================="

declare -a tools=("check_bb_status" "read_personas" "check_atlas_routes" "read_logs")
passed=0
failed=0

for tool in "${tools[@]}"; do
  response=$(echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js | grep "\"tool\"")
  
  if [ -n "$response" ]; then
    echo "✅ $tool - OK"
    ((passed++))
  else
    echo "❌ $tool - FAILED"
    ((failed++))
  fi
done

echo "===================="
echo "Results: $passed passed, $failed failed"
```

### Task 2: Continuous Monitoring
```bash
#!/bin/bash
echo "Starting MCP monitoring..."

while true; do
  echo "$(date): Checking BB status..."
  response=$(echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js | grep '"ok":true')
  
  if [ -n "$response" ]; then
    echo "✅ System healthy"
  else
    echo "⚠️  System check failed"
  fi
  
  sleep 60  # Check every minute
done
```

### Task 3: Log Analysis
```bash
#!/bin/bash
echo "Analyzing recent logs..."

response=$(echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js | grep '"logs"')

if [ -n "$response" ]; then
  # Extract and analyze logs using jq
  logs=$(echo "$response" | jq -r '.logs[]')
  
  error_count=$(echo "$logs" | grep -i "error" | wc -l)
  warn_count=$(echo "$logs" | grep -i "warn" | wc -l)
  
  echo "📊 Log Analysis:"
  echo "  Errors: $error_count"
  echo "  Warnings: $warn_count"
else
  echo "⚠️  No logs available"
fi
```

## Troubleshooting

### Issue: "command not found: npm"
**Solution**: Install Node.js and npm
```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# macOS
brew install node

# Windows
# Download from nodejs.org
```

### Issue: "Cannot find module"
**Solution**: Make sure you're in the project root
```bash
pwd  # Should show /path/to/Kryptotrac-xx
ls scripts/kryptotrac-mcp.js  # Should exist
```

### Issue: Permission denied
**Solution**: Make the script executable
```bash
chmod +x scripts/kryptotrac-mcp.js
```

### Issue: No output from server
**Solution**: Check if Node.js is working
```bash
node --version  # Should show version
node -e "console.log('test')"  # Should print 'test'
```

### Issue: Invalid JSON error
**Solution**: Ensure request format is correct
```bash
# Correct:
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js

# Incorrect (missing quotes):
echo '{tool:check_bb_status}' | node scripts/kryptotrac-mcp.js
```

## Next Steps

Now that you're set up, explore:

1. **[Tool Documentation](./tools/)** - Detailed docs for each tool
2. **[Architecture](./architecture.md)** - How the system works
3. **[Main README](./README.md)** - Complete reference guide
4. **[TypeScript SDK](../../sdk/)** - Type-safe client library

## Integration with GitHub Copilot

The MCP server is designed to work seamlessly with GitHub Copilot. When Copilot needs to inspect your codebase, it will automatically spawn the MCP server and communicate with it.

### Example Copilot Session
```
Developer: "What personas do we have?"

Copilot: Let me check...
> Spawning MCP server...
> Calling read_personas tool...
> Response: Found 3 personas

Copilot: The application has 3 personas defined:
  - defaultPersona
  - adminPersona  
  - guestPersona
```

## Development Tips

### Debugging MCP Server
Add debug logging:
```javascript
// In scripts/kryptotrac-mcp.js
const DEBUG = process.env.MCP_DEBUG === 'true';
function debug(msg) {
  if (DEBUG) console.error('[MCP DEBUG]', msg);
}
```

Run with debug:
```bash
MCP_DEBUG=true node scripts/kryptotrac-mcp.js
```

### Testing Individual Functions
```javascript
// test-individual.js
const fs = require('fs');
const path = require('path');

// Copy function from kryptotrac-mcp.js
async function checkBBStatus() {
  return {
    tool: "check_bb_status",
    ok: true,
    status: "BB-ACTIVE",
    message: "BB is awake, responding, and synced with ATLAS. I got you.",
    timestamp: new Date().toISOString()
  };
}

// Test it
(async () => {
  const result = await checkBBStatus();
  console.log(JSON.stringify(result, null, 2));
})();
```

## Best Practices

1. **Always validate responses**: Check the `ok` field before using data
2. **Handle timeouts**: Tools should respond within 5 seconds
3. **Parse carefully**: Use try-catch when parsing JSON responses
4. **Close connections**: End stdin when done sending requests
5. **Log for debugging**: Keep logs of all MCP interactions

## Getting Help

- **Documentation**: Complete docs in `docs/mcp/`
- **Examples**: Check `tests/mcp/` for examples
- **Issues**: Report problems on GitHub
- **Tests**: Run `npm run test:mcp` to verify setup

---

**Ready to dive deeper?** Check out the [Architecture documentation](./architecture.md) for technical details.
