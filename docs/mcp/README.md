# KryptoTrac MCP Server Documentation

## Overview

The KryptoTrac MCP (Model Context Protocol) Server is a custom tool server that provides GitHub Copilot Agents with access to project-specific utilities and diagnostics. It implements four specialized tools for monitoring and inspecting the KryptoTrac application.

## Architecture

The MCP server is a Node.js script that:
- Listens on stdin for JSON-formatted tool requests
- Processes requests using built-in Node.js APIs (no external dependencies)
- Returns JSON responses to stdout
- Self-contained and portable

### Location
```
scripts/kryptotrac-mcp.js
```

## Available Tools

### 1. `check_bb_status`
**Purpose**: Verify that the BB (Backend Bot) system is active and synced with ATLAS.

**Request**:
```json
{"tool": "check_bb_status"}
```

**Response**:
```json
{
  "tool": "check_bb_status",
  "ok": true,
  "status": "BB-ACTIVE",
  "message": "BB is awake, responding, and synced with ATLAS. I got you.",
  "timestamp": "2025-11-15T08:30:48.876Z"
}
```

**Use Cases**:
- Health check for backend bot
- System diagnostics
- CI/CD validation

---

### 2. `read_personas`
**Purpose**: Extract and list persona configurations from the application.

**Request**:
```json
{"tool": "read_personas"}
```

**Success Response**:
```json
{
  "tool": "read_personas",
  "ok": true,
  "personasDetected": ["defaultPersona", "adminPersona"],
  "lineCount": 150
}
```

**Error Response** (if persona.ts not found):
```json
{
  "tool": "read_personas",
  "ok": false,
  "error": "persona.ts not found"
}
```

**Use Cases**:
- Analyze available user personas
- Validate persona configuration
- Code navigation assistance

---

### 3. `check_atlas_routes`
**Purpose**: Inspect and list all routes defined in the ATLAS directory.

**Request**:
```json
{"tool": "check_atlas_routes"}
```

**Success Response**:
```json
{
  "tool": "check_atlas_routes",
  "ok": true,
  "routes": ["page.tsx", "api.ts", "layout.tsx"],
  "count": 3
}
```

**Error Response** (if ATLAS directory not found):
```json
{
  "tool": "check_atlas_routes",
  "ok": false,
  "error": "ATLAS directory not found"
}
```

**Use Cases**:
- Route discovery
- API endpoint validation
- Application structure analysis

---

### 4. `read_logs`
**Purpose**: Read and return the last 20 lines from the application log file.

**Request**:
```json
{"tool": "read_logs"}
```

**Success Response**:
```json
{
  "tool": "read_logs",
  "ok": true,
  "logs": [
    "2025-11-15 08:30:00 - Server started",
    "2025-11-15 08:30:05 - User authenticated",
    "..."
  ]
}
```

**Error Response** (if logs.txt not found):
```json
{
  "tool": "read_logs",
  "ok": false,
  "error": "logs.txt not found"
}
```

**Use Cases**:
- Debugging issues
- Monitoring application activity
- Error diagnosis

---

## Running the MCP Server

### Prerequisites
- Node.js (v14 or higher)
- No additional npm packages required

### Local Development

#### Using NPM Script
```bash
npm run mcp:dev
```

#### Direct Execution
```bash
node scripts/kryptotrac-mcp.js
```

### Testing Individual Tools

#### Using Echo
```bash
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

#### Using a Test File
Create a file `test-request.json`:
```json
{"tool":"read_personas"}
```

Run:
```bash
cat test-request.json | node scripts/kryptotrac-mcp.js
```

---

## How Copilot Agents Should Use This Server

### 1. Starting the Server
Copilot Agents should invoke the MCP server as a child process and communicate via stdin/stdout:

```javascript
const { spawn } = require('child_process');
const mcpProcess = spawn('node', ['scripts/kryptotrac-mcp.js']);

// Listen for responses
mcpProcess.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('MCP Response:', response);
});

// Send tool request
mcpProcess.stdin.write(JSON.stringify({ tool: 'check_bb_status' }) + '\n');
```

### 2. Request Format
All requests must be valid JSON with a `tool` property:
```json
{
  "tool": "<tool_name>"
}
```

### 3. Response Handling
- All responses are JSON objects
- Check the `ok` field to determine success/failure
- Handle both success and error cases gracefully
- Parse responses with error handling

### 4. Best Practices for Agents
- Always validate JSON before parsing
- Handle timeout scenarios (tool should respond within 5 seconds)
- Log all interactions for debugging
- Close the process when done to free resources

---

## Integration with GitHub Actions

The MCP server is validated in CI/CD using the workflow:
```
.github/workflows/mcp-validation.yml
```

This workflow:
1. Starts the MCP server
2. Sends a test request to each tool
3. Validates that responses are valid JSON
4. Fails the build if any tool returns invalid data

---

## Troubleshooting

### Common Issues

#### 1. Server Not Starting
**Symptom**: No output when running the server

**Solution**:
```bash
# Check Node.js version
node --version

# Verify file exists and is executable
ls -la scripts/kryptotrac-mcp.js
chmod +x scripts/kryptotrac-mcp.js
```

#### 2. Invalid JSON Response
**Symptom**: Parse errors when reading responses

**Possible Causes**:
- Malformed tool request
- Server crashed during execution
- Invalid input encoding

**Solution**:
```bash
# Test with a known-good request
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js

# Check for syntax errors
node --check scripts/kryptotrac-mcp.js
```

#### 3. Tool Returns Error
**Symptom**: `"ok": false` in response

**Common Reasons**:
- `read_personas`: File `app/lib/persona/persona.ts` doesn't exist
- `check_atlas_routes`: Directory `app/atlas` doesn't exist
- `read_logs`: File `logs.txt` doesn't exist in project root

**Solution**: Ensure required files/directories exist or handle the error gracefully

#### 4. Timeout Issues
**Symptom**: No response after sending request

**Solution**:
```bash
# Test with timeout
timeout 5 bash -c 'echo "{\"tool\":\"check_bb_status\"}" | node scripts/kryptotrac-mcp.js'

# Check for hanging processes
ps aux | grep kryptotrac-mcp
```

#### 5. Permission Denied
**Symptom**: Cannot execute the script

**Solution**:
```bash
chmod +x scripts/kryptotrac-mcp.js
```

### Debug Mode

To enable verbose logging, modify the script to include debug output:

```javascript
// Add at the top of kryptotrac-mcp.js
const DEBUG = process.env.MCP_DEBUG === 'true';
function debug(msg) {
  if (DEBUG) console.error('[MCP DEBUG]', msg);
}
```

Run with debug enabled:
```bash
MCP_DEBUG=true node scripts/kryptotrac-mcp.js
```

### Health Check

Quick health check script:
```bash
#!/bin/bash
echo "Testing MCP Server..."
for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  echo "Testing $tool..."
  response=$(echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js | grep "\"tool\"")
  if [ -n "$response" ]; then
    echo "✓ $tool responded"
  else
    echo "✗ $tool failed"
  fi
done
```

---

## Advanced Usage

### Extending the Server

To add a new tool:

1. Add the tool name to the startup message:
```javascript
write({
  mcp: "kryptotrac-local",
  status: "started",
  tools: ["read_logs", "read_personas", "check_atlas_routes", "check_bb_status", "your_new_tool"]
});
```

2. Add a case in the switch statement:
```javascript
case "your_new_tool":
  return write(await yourNewTool());
```

3. Implement the tool function:
```javascript
async function yourNewTool() {
  return {
    tool: "your_new_tool",
    ok: true,
    data: "your result"
  };
}
```

### Security Considerations

- The MCP server runs with the same permissions as the Node.js process
- File system access is limited to the project directory
- No network operations are performed
- No user input is executed as shell commands
- All responses are JSON-serialized to prevent injection

---

## API Reference

### Startup Signal
When the server starts, it emits:
```json
{
  "mcp": "kryptotrac-local",
  "status": "started",
  "tools": ["read_logs", "read_personas", "check_atlas_routes", "check_bb_status"]
}
```

### Exit Signal
When the server exits, it emits:
```json
{
  "mcp": "kryptotrac-local",
  "status": "exited"
}
```

### Error Response Format
```json
{
  "error": "Error description",
  "detail": "Additional context (optional)"
}
```

---

## Changelog

### v1.0.0 (2025-11-15)
- Initial release
- Four core tools implemented
- Zero external dependencies
- Full documentation

---

## Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Contact the development team
- Refer to the main project README

---

## License

This MCP server is part of the KryptoTrac project and follows the same license terms.
