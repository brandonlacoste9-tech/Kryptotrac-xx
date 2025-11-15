# Tool: check_bb_status

## Overview

The `check_bb_status` tool verifies that the BB (Backend Bot) system is active and synced with ATLAS. This is a health check tool that confirms the backend bot infrastructure is operational.

## Tool Name
```
check_bb_status
```

## Arguments Schema

This tool takes no arguments. Simply specify the tool name in the request.

### Request Schema
```json
{
  "tool": "check_bb_status"
}
```

**Fields**:
- `tool` (string, required): Must be `"check_bb_status"`

## Example Request

### Command Line
```bash
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
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
      if (response.tool === 'check_bb_status') {
        console.log('BB Status:', response);
      }
    }
  });
});

mcp.stdin.write('{"tool":"check_bb_status"}\n');
```

### Using stdin directly
```bash
node scripts/kryptotrac-mcp.js
{"tool":"check_bb_status"}
```

## Example Response

### Success Response (Real Output)
```json
{
  "tool": "check_bb_status",
  "ok": true,
  "status": "BB-ACTIVE",
  "message": "BB is awake, responding, and synced with ATLAS. I got you.",
  "timestamp": "2025-11-15T08:30:48.876Z"
}
```

**Response Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `true` if check succeeded
- `status` (string): Current BB status code (`"BB-ACTIVE"`)
- `message` (string): Human-readable status message
- `timestamp` (string): ISO 8601 timestamp of the check

### Full Server Output
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
{"tool":"check_bb_status","ok":true,"status":"BB-ACTIVE","message":"BB is awake, responding, and synced with ATLAS. I got you.","timestamp":"2025-11-15T08:30:48.876Z"}
{"mcp":"kryptotrac-local","status":"exited"}
```

## Error Cases

### No Known Error Cases
This tool always returns a successful response as it performs a simulated health check. In a production environment, this might connect to actual backend services.

### Potential Future Error Cases
If the tool is enhanced to check real services:

```json
{
  "tool": "check_bb_status",
  "ok": false,
  "error": "BB service unreachable",
  "details": "Connection timeout after 5000ms"
}
```

## Use Cases in GitHub Copilot Workflows

### 1. Pre-Deployment Health Check
```javascript
// Before deploying, verify BB is active
async function preDeploymentCheck() {
  const status = await callMCPTool('check_bb_status');
  
  if (!status.ok || status.status !== 'BB-ACTIVE') {
    throw new Error('BB not ready for deployment');
  }
  
  console.log('✅ BB is ready for deployment');
}
```

### 2. CI/CD Pipeline Validation
```yaml
- name: Verify BB Status
  run: |
    response=$(echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js | grep '"tool":"check_bb_status"')
    status=$(echo "$response" | jq -r '.status')
    
    if [ "$status" != "BB-ACTIVE" ]; then
      echo "BB is not active!"
      exit 1
    fi
```

### 3. Monitoring Dashboard
```javascript
// Periodic health check for dashboard
setInterval(async () => {
  const status = await callMCPTool('check_bb_status');
  
  updateDashboard({
    bb_status: status.status,
    last_check: status.timestamp,
    healthy: status.ok
  });
}, 60000); // Check every minute
```

### 4. Debugging Session Initialization
When starting a debugging session with Copilot:
```
Agent: Let me check the BB status first...
> check_bb_status
Response: BB-ACTIVE ✅

Agent: Great! BB is active. Now let's investigate the issue...
```

### 5. Automated Alert System
```javascript
async function checkSystemHealth() {
  const status = await callMCPTool('check_bb_status');
  
  if (!status.ok) {
    await sendAlert({
      severity: 'high',
      message: 'BB system check failed',
      details: status
    });
  }
}
```

## Performance Characteristics

- **Response Time**: < 100ms (simulated check)
- **Resource Usage**: Minimal (no external calls)
- **Reliability**: 100% (always returns success)
- **Concurrency**: Safe for parallel execution

## Integration Notes

### When to Use
- System health checks
- Pre-deployment validation
- Monitoring dashboards
- CI/CD pipelines
- Debugging initialization

### When NOT to Use
- Real-time backend service checks (this is simulated)
- Load testing (not representative of actual service)
- Production monitoring (if you need real BB service status)

## Related Tools

- None (standalone health check)

## Troubleshooting

### Issue: Response not received
**Solution**: Ensure you're reading from stdout and the process hasn't exited

### Issue: Different status code
**Solution**: This tool always returns `BB-ACTIVE`. If you see something else, the server code may have been modified.

## Code Reference

Implementation in `scripts/kryptotrac-mcp.js`:

```javascript
async function checkBBStatus() {
  // Simulate a deep BB check
  return {
    tool: "check_bb_status",
    ok: true,
    status: "BB-ACTIVE",
    message: "BB is awake, responding, and synced with ATLAS. I got you.",
    timestamp: new Date().toISOString()
  };
}
```

## Version History

- **v1.0.0** (2025-11-15): Initial release with simulated health check

---

[← Back to Tool Index](../index.md) | [Next Tool: read_personas →](./read_personas.md)
