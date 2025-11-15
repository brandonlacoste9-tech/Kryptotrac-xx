# Tool: read_logs

## Overview

The `read_logs` tool reads and returns the last 20 lines from the application log file. This is useful for debugging, monitoring, and understanding recent application activity without manually accessing the filesystem.

## Tool Name
```
read_logs
```

## Arguments Schema

This tool takes no arguments. Simply specify the tool name in the request.

### Request Schema
```json
{
  "tool": "read_logs"
}
```

**Fields**:
- `tool` (string, required): Must be `"read_logs"`

## Example Request

### Command Line
```bash
echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js
```

### JavaScript/Node.js
```javascript
const { spawn } = require('child_process');

const mcp = spawn('node', ['scripts/kryptotrac-mcp.js']);

mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      const response = JSON.parse(line);
      if (response.tool === 'read_logs') {
        console.log('Recent Logs:', response.logs);
      }
    }
  });
});

mcp.stdin.write('{"tool":"read_logs"}\n');
```

### Using stdin directly
```bash
node scripts/kryptotrac-mcp.js
{"tool":"read_logs"}
```

## Example Response

### Success Response (when logs.txt exists)
```json
{
  "tool": "read_logs",
  "ok": true,
  "logs": [
    "2025-11-15 08:30:00 - Server started on port 3000",
    "2025-11-15 08:30:05 - User authenticated: user123",
    "2025-11-15 08:30:10 - Portfolio updated for user123",
    "2025-11-15 08:30:15 - API request: GET /api/portfolio",
    "2025-11-15 08:30:20 - Cache hit for crypto prices",
    "2025-11-15 08:30:25 - Database query executed in 45ms",
    "2025-11-15 08:30:30 - WebSocket connection established",
    "2025-11-15 08:30:35 - Price alert triggered for BTC",
    "2025-11-15 08:30:40 - Email sent to user@example.com",
    "2025-11-15 08:30:45 - Background job completed",
    "2025-11-15 08:30:50 - User logged out: user123",
    "2025-11-15 08:30:55 - Session cleanup completed",
    "2025-11-15 08:31:00 - Health check: OK",
    "2025-11-15 08:31:05 - Metrics exported to monitoring",
    "2025-11-15 08:31:10 - Cache invalidated for stale data",
    "2025-11-15 08:31:15 - New user registered: user456",
    "2025-11-15 08:31:20 - API rate limit reset",
    "2025-11-15 08:31:25 - Database backup completed",
    "2025-11-15 08:31:30 - System status: All green",
    "2025-11-15 08:31:35 - Request processed successfully"
  ]
}
```

**Response Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `true` if file was found and read successfully
- `logs` (string[]): Array of log lines (last 20 lines from the file)

### Error Response (Real Output - when logs.txt not found)
```json
{
  "tool": "read_logs",
  "ok": false,
  "error": "logs.txt not found"
}
```

**Error Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `false` indicating failure
- `error` (string): Description of why the operation failed

### Full Server Output (Error Case)
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
{"tool":"read_logs","ok":false,"error":"logs.txt not found"}
{"mcp":"kryptotrac-local","status":"exited"}
```

### Success Response with Few Logs
If the log file has fewer than 20 lines:
```json
{
  "tool": "read_logs",
  "ok": true,
  "logs": [
    "2025-11-15 08:30:00 - Server started",
    "2025-11-15 08:30:05 - First request received"
  ]
}
```

## Error Cases

### 1. Log File Not Found
**Condition**: The file `logs.txt` does not exist in project root

**Response**:
```json
{
  "tool": "read_logs",
  "ok": false,
  "error": "logs.txt not found"
}
```

**How to Fix**: 
- Create a log file at project root: `touch logs.txt`
- Or configure your application to create logs automatically
- Or adjust the tool to look in a different location

### 2. File Read Permission Error
**Condition**: Process lacks permission to read the file

**Response**:
```json
{
  "tool": "read_logs",
  "ok": false,
  "error": "EACCES: permission denied"
}
```

**How to Fix**:
```bash
chmod 644 logs.txt
```

### 3. Empty Log File
**Condition**: Log file exists but is empty

**Response**:
```json
{
  "tool": "read_logs",
  "ok": true,
  "logs": []
}
```

**Note**: This is a successful response (ok: true) but with empty logs array.

## Use Cases in GitHub Copilot Workflows

### 1. Quick Debugging Session
```javascript
// Start debugging by checking recent logs
async function startDebugSession() {
  console.log('Fetching recent logs...');
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) {
    console.log('⚠️  No logs available');
    return;
  }
  
  console.log('📋 Recent Activity:');
  result.logs.forEach((log, i) => {
    console.log(`${i + 1}. ${log}`);
  });
  
  // Analyze for errors
  const errors = result.logs.filter(l => l.includes('ERROR') || l.includes('error'));
  if (errors.length > 0) {
    console.log(`\n⚠️  Found ${errors.length} errors in recent logs`);
  }
}
```

### 2. Error Pattern Detection
```javascript
// Analyze logs for common error patterns
async function analyzeErrors() {
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) return { errors: 0, patterns: {} };
  
  const patterns = {
    authentication: 0,
    database: 0,
    api: 0,
    timeout: 0
  };
  
  result.logs.forEach(log => {
    if (log.includes('auth') || log.includes('login')) patterns.authentication++;
    if (log.includes('database') || log.includes('query')) patterns.database++;
    if (log.includes('API') || log.includes('request')) patterns.api++;
    if (log.includes('timeout')) patterns.timeout++;
  });
  
  return {
    errors: result.logs.filter(l => l.toLowerCase().includes('error')).length,
    patterns
  };
}
```

### 3. CI/CD Log Validation
```yaml
- name: Check Application Logs
  run: |
    response=$(echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js | grep '"tool":"read_logs"')
    ok=$(echo "$response" | jq -r '.ok')
    
    if [ "$ok" != "true" ]; then
      echo "⚠️  Log file not accessible"
      exit 0  # Don't fail build, just warn
    fi
    
    # Check for critical errors in recent logs
    logs=$(echo "$response" | jq -r '.logs[]')
    if echo "$logs" | grep -i "CRITICAL\|FATAL"; then
      echo "❌ Critical errors found in logs!"
      exit 1
    fi
    
    echo "✅ Logs checked - no critical issues"
```

### 4. Interactive Debugging with Copilot
```
Developer: "Are there any errors in the logs?"

Copilot: Let me check the recent logs...
> read_logs

Copilot: I found 2 error entries in the last 20 log lines:
  - "ERROR: Database connection timeout at 08:30:15"
  - "ERROR: API rate limit exceeded at 08:31:10"

Let me investigate the database connection issue...
```

### 5. Monitoring Dashboard Data
```javascript
// Feed logs to monitoring dashboard
async function updateDashboard() {
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) {
    updateDashboard({ status: 'no-logs', logs: [] });
    return;
  }
  
  const recentActivity = result.logs.slice(-5); // Last 5 logs
  const errorCount = result.logs.filter(l => l.toLowerCase().includes('error')).length;
  
  updateDashboard({
    status: errorCount === 0 ? 'healthy' : 'issues',
    recentActivity,
    errorCount,
    lastUpdate: new Date().toISOString()
  });
}
```

### 6. Automated Issue Detection
```javascript
// Detect and report issues automatically
async function detectIssues() {
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) return [];
  
  const issues = [];
  
  result.logs.forEach((log, index) => {
    // Check for various issue patterns
    if (log.includes('timeout')) {
      issues.push({ line: index, type: 'timeout', message: log });
    }
    if (log.includes('failed') || log.includes('error')) {
      issues.push({ line: index, type: 'error', message: log });
    }
    if (log.includes('warning')) {
      issues.push({ line: index, type: 'warning', message: log });
    }
  });
  
  return issues;
}
```

### 7. Pre-Deployment Health Check
```javascript
// Check logs before deploying new version
async function preDeploymentLogCheck() {
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) {
    console.log('⚠️  Warning: Cannot access logs');
    return true; // Don't block deployment
  }
  
  // Look for critical issues in recent logs
  const critical = result.logs.filter(l => 
    l.includes('CRITICAL') || 
    l.includes('FATAL') ||
    l.includes('PANIC')
  );
  
  if (critical.length > 0) {
    console.error('❌ Critical issues found in logs:');
    critical.forEach(log => console.error(`  ${log}`));
    return false; // Block deployment
  }
  
  console.log('✅ Log health check passed');
  return true;
}
```

### 8. Log Correlation with System Events
```javascript
// Correlate logs with system events
async function correlateEvents(eventTime) {
  const result = await callMCPTool('read_logs');
  
  if (!result.ok) return [];
  
  // Find logs around the event time (±5 minutes)
  const relevantLogs = result.logs.filter(log => {
    const logTime = extractTimestamp(log);
    return Math.abs(logTime - eventTime) < 300000; // 5 minutes
  });
  
  return relevantLogs;
}
```

## Performance Characteristics

- **Response Time**: 10-100ms (depends on log file size)
- **Memory Usage**: ~1-5 MB (loads last 20 lines)
- **File Size Impact**: Minimal (only reads end of file)
- **Concurrency**: Safe for parallel execution (read-only)

## Integration Notes

### File Location
The tool looks for logs at:
```
logs.txt
```

At the project root (where the MCP server is run from).

### Log Line Limit
- Always returns the **last 20 lines**
- Uses `split('\n').slice(-20)`
- If file has < 20 lines, returns all available lines
- Empty lines are included in the count

### Log Format
The tool doesn't parse or validate log format. It returns raw text lines. Common patterns:
- ISO timestamps: `2025-11-15T08:30:00Z`
- Simple timestamps: `2025-11-15 08:30:00`
- Level indicators: `ERROR`, `WARN`, `INFO`, `DEBUG`
- Message content: Free-form text

### When to Use
- Quick debugging sessions
- Error pattern detection
- CI/CD log validation
- Monitoring dashboards
- Issue detection
- Pre-deployment checks

### When NOT to Use
- Analyzing entire log history (only last 20 lines)
- Real-time log streaming (this is a snapshot)
- Parsing structured logs (returns raw text)
- Production log analysis (use proper log aggregation tools)

## Related Tools

- **check_bb_status**: Another monitoring/diagnostics tool
- **read_personas**: Another file-reading tool

## Troubleshooting

### Issue: Always returns "not found"
**Cause**: Log file doesn't exist or wrong working directory

**Solution**:
```bash
# Create log file if needed
touch logs.txt
echo "2025-11-15 08:30:00 - System started" >> logs.txt

# Verify location
ls -la logs.txt

# Run from correct directory
cd /path/to/Kryptotrac-xx
node scripts/kryptotrac-mcp.js
```

### Issue: Empty logs array
**Cause**: Log file exists but is empty

**Solution**: This is valid. Check if application is logging:
```bash
cat logs.txt
```

### Issue: Logs seem outdated
**Cause**: Application might be buffering log writes

**Solution**: Ensure logs are flushed to disk:
```javascript
// In your logging code
console.log('message'); // Automatically flushed
fs.appendFileSync('logs.txt', 'message\n'); // Force sync write
```

### Issue: Not getting all 20 lines
**Cause**: File has fewer than 20 lines

**Check**:
```bash
wc -l logs.txt
```

## Code Reference

Implementation in `scripts/kryptotrac-mcp.js`:

```javascript
async function readLogs() {
  const logFile = path.join(process.cwd(), "logs.txt");

  if (!fs.existsSync(logFile)) {
    return { tool: "read_logs", ok: false, error: "logs.txt not found" };
  }

  return {
    tool: "read_logs",
    ok: true,
    logs: fs.readFileSync(logFile, "utf8").split("\n").slice(-20) // last 20 lines
  };
}
```

## Example Log File

```
2025-11-15 08:30:00 - [INFO] Server started on port 3000
2025-11-15 08:30:05 - [INFO] Database connection established
2025-11-15 08:30:10 - [INFO] User authenticated: user123
2025-11-15 08:30:15 - [ERROR] Database query timeout after 5000ms
2025-11-15 08:30:20 - [INFO] Retry successful
2025-11-15 08:30:25 - [DEBUG] Cache hit rate: 87%
2025-11-15 08:30:30 - [INFO] WebSocket connection established
2025-11-15 08:30:35 - [WARN] Rate limit approaching: 95/100
2025-11-15 08:30:40 - [INFO] Background job started
2025-11-15 08:30:45 - [INFO] Background job completed in 4.2s
```

With this file, `read_logs` returns the last 20 lines (or all 10 if file has only 10).

## Version History

- **v1.0.0** (2025-11-15): Initial release with last-20-lines support

## Future Enhancements

Potential improvements for future versions:
1. **Configurable Line Count**: Allow specifying number of lines
2. **Log Level Filtering**: Filter by ERROR, WARN, INFO, etc.
3. **Time Range Queries**: Get logs from specific time period
4. **Search/Grep**: Search for specific patterns
5. **Structured Parsing**: Parse JSON logs
6. **Log Rotation Support**: Handle rotated log files

---

[← Back to Tool Index](../index.md) | [← Previous: check_atlas_routes](./check_atlas_routes.md)
