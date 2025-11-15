# Testing the KryptoTrac MCP Server

This guide covers all aspects of testing the MCP server, from manual testing to automated CI/CD validation.

## Table of Contents

- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Postman/Thunder Client Collection](#postmanthunder-client-collection)
- [CI/CD Testing](#cicd-testing)
- [Performance Testing](#performance-testing)
- [Integration Testing](#integration-testing)

## Manual Testing

### Command Line Testing

The simplest way to test individual tools:

```bash
# Test check_bb_status
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js

# Test read_personas
echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js

# Test check_atlas_routes
echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js

# Test read_logs
echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js
```

### Interactive Testing

Start the server in interactive mode:

```bash
node scripts/kryptotrac-mcp.js
```

Then type tool requests (one per line):
```json
{"tool":"check_bb_status"}
{"tool":"read_personas"}
{"tool":"check_atlas_routes"}
{"tool":"read_logs"}
```

Press Ctrl+D to exit.

### Quick Test Script

Create a test script `test-mcp-quick.sh`:

```bash
#!/bin/bash
echo "Testing all MCP tools..."

for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  echo "Testing: $tool"
  response=$(echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js | grep '"tool"')
  
  if [ -n "$response" ]; then
    echo "✅ $tool passed"
  else
    echo "❌ $tool failed"
  fi
  echo ""
done
```

Make it executable and run:
```bash
chmod +x test-mcp-quick.sh
./test-mcp-quick.sh
```

## Automated Testing

### Test Suite

Run the comprehensive test suite:

```bash
npm run test:mcp
```

Or directly:
```bash
node tests/mcp/test-mcp-server.js
```

This runs 39 tests covering:
- Server startup and lifecycle
- All 4 tools
- Error handling
- BB persona simulation
- Concurrent operations
- Performance benchmarks

### Test Output Example

```
KryptoTrac MCP Server
Running at: 2025-11-15T08:40:36.850Z

============================================================
Test 1: Server Startup
============================================================
✅ Server emits startup signal
✅ Server advertises all 4 tools
✅ Server emits exit signal
✅ Server exits with code 0

...

============================================================
Test Summary
============================================================
Total Tests: 39
✅ Passed: 39
❌ Failed: 0
⊘ Skipped: 0
Pass Rate: 100.0%

Tool Coverage:
Tested: 4/4 tools
  ✓ check_bb_status
  ✓ read_personas
  ✓ check_atlas_routes
  ✓ read_logs
```

## Postman/Thunder Client Collection

### Importing the Collection

The repository includes a Postman/Thunder Client collection for reference and testing.

#### For Postman

1. Open Postman
2. Click "Import" in the top left
3. Select "File"
4. Navigate to `.postman/kryptotrac-mcp-collection.json`
5. Click "Import"

#### For Thunder Client (VS Code)

1. Install Thunder Client extension in VS Code
2. Click on Thunder Client icon in sidebar
3. Click "Collections"
4. Click "..." menu → "Import"
5. Select `.postman/kryptotrac-mcp-collection.json`
6. Click "Import"

### About the Collection

**Important Note**: The MCP server uses stdin/stdout communication, not HTTP. The Postman collection is provided for:

- **Reference**: Shows JSON format for each tool
- **Documentation**: Describes request/response schemas
- **Templates**: Use as templates for building clients

### Collection Contents

The collection includes 4 requests:

1. **check_bb_status** - Backend bot health check
2. **read_personas** - List persona configurations
3. **check_atlas_routes** - Discover ATLAS routes
4. **read_logs** - Read recent logs

Each request includes:
- Full documentation
- Request JSON schema
- Example success responses
- Example error responses
- Command line equivalents
- SDK usage examples

### Using the Collection for Reference

When building MCP clients, use the collection to:

1. **View Request Format**: See exact JSON structure needed
2. **Understand Responses**: Review all possible response types
3. **Copy JSON**: Copy request bodies for command line testing
4. **Learn the API**: Comprehensive documentation for each tool

### Example: Using Collection JSON in Command Line

From Postman/Thunder Client, copy the request body and use it:

```bash
# Copy this from the collection:
# {"tool":"check_bb_status"}

# Use it in terminal:
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

### Collection Variables

The collection includes a `baseUrl` variable set to `http://localhost:3000`. This is for documentation purposes only - the actual MCP server doesn't use HTTP.

## CI/CD Testing

### GitHub Actions Workflow

The repository includes a comprehensive CI/CD workflow at `.github/workflows/mcp-validation.yml`.

#### What It Tests

1. **Server Existence**: Verifies MCP server file exists
2. **Server Startup**: Tests server starts correctly
3. **Tool Validation**: Tests all 4 tools return valid JSON
4. **Error Handling**: Tests invalid tool and malformed JSON handling
5. **Response Format**: Validates JSON structure

#### Running Locally

Simulate CI/CD workflow locally:

```bash
# Test server exists
test -f scripts/kryptotrac-mcp.js && echo "✅ Server found"

# Test each tool
for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  response=$(echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js | grep '"tool"')
  echo "$response" | python3 -m json.tool > /dev/null && echo "✅ $tool valid JSON"
done
```

#### Workflow Triggers

The workflow runs on:
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`
- Manual trigger via `workflow_dispatch`

#### Viewing Results

1. Go to GitHub Actions tab
2. Select "MCP Server Validation" workflow
3. View latest run
4. Check step-by-step results
5. Download artifacts if available

## Performance Testing

### Response Time Testing

Test individual tool performance:

```bash
#!/bin/bash
for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  echo "Testing $tool performance..."
  
  start=$(date +%s%N)
  echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js > /dev/null
  end=$(date +%s%N)
  
  duration=$(( (end - start) / 1000000 ))
  echo "  Duration: ${duration}ms"
done
```

### Concurrent Performance Testing

Test multiple tools simultaneously:

```bash
#!/bin/bash
echo "Running concurrent performance test..."

start=$(date +%s%N)

(echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js > /dev/null) &
(echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js > /dev/null) &
(echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js > /dev/null) &
(echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js > /dev/null) &

wait

end=$(date +%s%N)
duration=$(( (end - start) / 1000000 ))

echo "4 tools completed concurrently in ${duration}ms"
```

### Load Testing

Test server under load:

```bash
#!/bin/bash
echo "Load testing MCP server..."

count=100
success=0
failed=0

for i in $(seq 1 $count); do
  result=$(echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js | grep '"ok":true')
  
  if [ -n "$result" ]; then
    ((success++))
  else
    ((failed++))
  fi
  
  if [ $((i % 10)) -eq 0 ]; then
    echo "Progress: $i/$count"
  fi
done

echo "Results: $success success, $failed failed"
```

## Integration Testing

### Testing with SDK

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

describe('MCP Integration Tests', () => {
  let client: KryptotracMCPClient;

  beforeEach(() => {
    client = new KryptotracMCPClient();
  });

  test('should check BB status', async () => {
    const result = await client.checkBBStatus();
    expect(result.ok).toBe(true);
    expect(result.status).toBe('BB-ACTIVE');
  });

  test('should handle missing files gracefully', async () => {
    const result = await client.readPersonas();
    // Should not throw, either ok=true or ok=false with error
    expect(result).toHaveProperty('ok');
  });

  test('should list ATLAS routes', async () => {
    const result = await client.checkAtlasRoutes();
    expect(result).toHaveProperty('ok');
    if (result.ok) {
      expect(Array.isArray(result.routes)).toBe(true);
    }
  });
});
```

### Testing in Different Environments

#### Development
```bash
NODE_ENV=development npm run test:mcp
```

#### Staging
```bash
NODE_ENV=staging npm run test:mcp
```

#### Production Validation
```bash
NODE_ENV=production npm run test:mcp
```

## Debugging Failed Tests

### Enable Debug Mode

```bash
# For SDK
MCP_DEBUG=true node your-test-script.js

# For direct testing
DEBUG=* echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

### Common Issues

#### 1. Timeout Errors

**Symptom**: Tests fail with timeout errors

**Solution**:
```bash
# Increase timeout in test suite
# Edit tests/mcp/test-mcp-server.js
const TIMEOUT_MS = 10000; // Increase from 5000
```

#### 2. File Not Found Errors

**Symptom**: Tools return "not found" errors

**Solution**:
```bash
# Verify working directory
pwd

# Should be at project root
cd /path/to/Kryptotrac-xx

# Run tests from correct location
npm run test:mcp
```

#### 3. Permission Errors

**Symptom**: Cannot execute MCP server

**Solution**:
```bash
chmod +x scripts/kryptotrac-mcp.js
```

#### 4. JSON Parse Errors

**Symptom**: Failed to parse response

**Solution**:
```bash
# Test JSON validity
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js | python3 -m json.tool
```

## Test Coverage

### Current Coverage

- ✅ Server lifecycle (startup, exit)
- ✅ All 4 tools (check_bb_status, read_personas, check_atlas_routes, read_logs)
- ✅ Success responses
- ✅ Error responses
- ✅ Invalid tool handling
- ✅ Malformed JSON handling
- ✅ Concurrent operations
- ✅ Performance benchmarks
- ✅ BB persona simulation

### Coverage Report

Run tests with coverage output:

```bash
npm run test:mcp 2>&1 | tee test-results.txt

# View summary
tail -n 20 test-results.txt
```

## Continuous Testing

### Watch Mode

For development, run tests on file changes:

```bash
# Using nodemon
npx nodemon --watch scripts --watch tests --exec "npm run test:mcp"
```

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running MCP tests..."
npm run test:mcp

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi

echo "✅ Tests passed."
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Best Practices

1. **Run Tests Locally First**: Always test locally before pushing
2. **Check All Tools**: Don't assume if one tool works, all work
3. **Test Error Cases**: Verify error handling works correctly
4. **Performance Baseline**: Keep track of performance metrics
5. **Document New Tests**: Add documentation for any new tests
6. **Use CI/CD**: Let automated tests catch issues early

## Related Documentation

- [Getting Started](./getting-started.md) - Setup guide
- [Tool Documentation](./tools/) - Individual tool references
- [SDK Documentation](../../sdk/README.md) - TypeScript SDK
- [Architecture](./architecture.md) - System design

---

**Need Help?** Check the [troubleshooting section](./README.md#troubleshooting) in the main documentation.
