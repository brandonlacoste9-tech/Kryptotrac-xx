# Tool: check_atlas_routes

## Overview

The `check_atlas_routes` tool inspects and lists all routes defined in the ATLAS directory. ATLAS is a routing subsystem in KryptoTrac, and this tool provides visibility into the available routes/pages without manually browsing the filesystem.

## Tool Name
```
check_atlas_routes
```

## Arguments Schema

This tool takes no arguments. Simply specify the tool name in the request.

### Request Schema
```json
{
  "tool": "check_atlas_routes"
}
```

**Fields**:
- `tool` (string, required): Must be `"check_atlas_routes"`

## Example Request

### Command Line
```bash
echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js
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
      if (response.tool === 'check_atlas_routes') {
        console.log('ATLAS Routes:', response.routes);
      }
    }
  });
});

mcp.stdin.write('{"tool":"check_atlas_routes"}\n');
```

### Using stdin directly
```bash
node scripts/kryptotrac-mcp.js
{"tool":"check_atlas_routes"}
```

## Example Response

### Success Response (Real Output)
```json
{
  "tool": "check_atlas_routes",
  "ok": true,
  "routes": ["page.tsx"],
  "count": 1
}
```

**Response Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `true` if directory was found and read successfully
- `routes` (string[]): Array of filenames in the ATLAS directory
- `count` (number): Total number of routes/files found

### Success Response (Multiple Routes)
```json
{
  "tool": "check_atlas_routes",
  "ok": true,
  "routes": ["page.tsx", "layout.tsx", "api.ts", "dashboard", "settings"],
  "count": 5
}
```

### Error Response (Real Output - when ATLAS directory not found)
```json
{
  "tool": "check_atlas_routes",
  "ok": false,
  "error": "ATLAS directory not found"
}
```

**Error Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `false` indicating failure
- `error` (string): Description of why the operation failed

### Full Server Output (Success Case)
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
{"tool":"check_atlas_routes","ok":true,"routes":["page.tsx"],"count":1}
{"mcp":"kryptotrac-local","status":"exited"}
```

## Error Cases

### 1. ATLAS Directory Not Found
**Condition**: The directory `app/atlas` does not exist

**Response**:
```json
{
  "tool": "check_atlas_routes",
  "ok": false,
  "error": "ATLAS directory not found"
}
```

**How to Fix**: 
- Create the ATLAS directory at `app/atlas`
- Verify you're running from the correct working directory

### 2. Permission Denied
**Condition**: Process lacks permission to read the directory

**Response**:
```json
{
  "tool": "check_atlas_routes",
  "ok": false,
  "error": "EACCES: permission denied"
}
```

**How to Fix**:
```bash
chmod 755 app/atlas
```

### 3. Empty Directory
**Condition**: ATLAS directory exists but is empty

**Response**:
```json
{
  "tool": "check_atlas_routes",
  "ok": true,
  "routes": [],
  "count": 0
}
```

**Note**: This is a successful response (ok: true) but with zero routes.

## Use Cases in GitHub Copilot Workflows

### 1. Route Discovery and Navigation
```javascript
// Discover available routes in the application
async function discoverRoutes() {
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) {
    console.log('ATLAS subsystem not initialized');
    return [];
  }
  
  console.log(`Found ${result.count} routes in ATLAS:`);
  result.routes.forEach(route => {
    console.log(`  /${route}`);
  });
  
  return result.routes;
}
```

### 2. API Endpoint Validation
```javascript
// Verify all expected routes exist
async function validateRoutes() {
  const expected = ['api.ts', 'page.tsx', 'layout.tsx'];
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) {
    throw new Error('Cannot validate routes - ATLAS not found');
  }
  
  const missing = expected.filter(r => !result.routes.includes(r));
  
  if (missing.length > 0) {
    console.error(`❌ Missing routes: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ All expected routes present');
  return true;
}
```

### 3. Documentation Auto-Generation
```javascript
// Generate route documentation
async function generateRoutesDocs() {
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) return;
  
  let docs = '# ATLAS Routes\n\n';
  docs += `Total routes: ${result.count}\n\n`;
  
  result.routes.forEach(route => {
    const routeName = route.replace(/\.(tsx?|jsx?)$/, '');
    docs += `## /${routeName}\n\n`;
    docs += `File: \`app/atlas/${route}\`\n\n`;
  });
  
  fs.writeFileSync('docs/ROUTES.md', docs);
}
```

### 4. CI/CD Health Check
```yaml
- name: Validate ATLAS Routes
  run: |
    response=$(echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js | grep '"tool":"check_atlas_routes"')
    ok=$(echo "$response" | jq -r '.ok')
    count=$(echo "$response" | jq -r '.count')
    
    if [ "$ok" != "true" ]; then
      echo "❌ ATLAS directory not found!"
      exit 1
    fi
    
    if [ "$count" -eq "0" ]; then
      echo "⚠️  Warning: ATLAS directory is empty"
    fi
    
    echo "✅ Found $count ATLAS routes"
```

### 5. Pre-Deployment Route Check
```javascript
// Before deploying, ensure critical routes exist
async function preDeployCheck() {
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) {
    throw new Error('Deployment blocked - ATLAS not found');
  }
  
  const criticalRoutes = ['api.ts', 'page.tsx'];
  const hasCritical = criticalRoutes.every(r => result.routes.includes(r));
  
  if (!hasCritical) {
    throw new Error('Deployment blocked - missing critical routes');
  }
  
  console.log('✅ Pre-deployment route check passed');
}
```

### 6. Interactive Route Exploration with Copilot
```
Developer: "What routes are in ATLAS?"

Copilot: Let me check...
> check_atlas_routes

Response: Found 1 route: page.tsx

Copilot: The ATLAS subsystem currently has 1 route defined at app/atlas/page.tsx
```

### 7. Route Change Detection
```javascript
// Detect new or removed routes
async function detectRouteChanges(previousRoutes) {
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) return { added: [], removed: previousRoutes };
  
  const current = result.routes;
  const added = current.filter(r => !previousRoutes.includes(r));
  const removed = previousRoutes.filter(r => !current.includes(r));
  
  return { added, removed, total: current.length };
}
```

### 8. Automated Test Generation
```javascript
// Generate route tests
async function generateRouteTests() {
  const result = await callMCPTool('check_atlas_routes');
  
  if (!result.ok) return;
  
  let testCode = 'describe("ATLAS Routes", () => {\n';
  
  result.routes.forEach(route => {
    testCode += `  it("should have ${route} route", () => {\n`;
    testCode += `    expect(fs.existsSync("app/atlas/${route}")).toBe(true);\n`;
    testCode += `  });\n\n`;
  });
  
  testCode += '});';
  
  fs.writeFileSync('tests/routes.test.ts', testCode);
}
```

## Performance Characteristics

- **Response Time**: 5-20ms (depends on number of files)
- **Directory Size Impact**: Linear with file count
- **Memory Usage**: Minimal (~1 MB)
- **Concurrency**: Safe for parallel execution (read-only)

## Integration Notes

### Directory Location
The tool looks for routes at:
```
app/atlas/
```

Relative to the current working directory where the MCP server is run.

### What Gets Listed
- All files and directories in `app/atlas/`
- No filtering applied (includes hidden files if present)
- No recursive directory scanning (only top level)

### Route Types
The tool returns raw filenames. Common patterns:
- `page.tsx` - Next.js page component
- `layout.tsx` - Next.js layout component
- `api.ts` - API route handler
- `[id]` - Dynamic route segment
- `(group)` - Route group (Next.js 13+)

### When to Use
- Route discovery and navigation
- API endpoint validation
- Documentation generation
- CI/CD health checks
- Pre-deployment validation

### When NOT to Use
- Getting route content (use file reading tools)
- Deep directory scanning (only scans top level)
- Route execution/testing (this is inspection only)

## Related Tools

- **read_personas**: Similarly inspects application structure
- **read_logs**: Another inspection tool

## Troubleshooting

### Issue: Always returns "not found"
**Cause**: Working directory is wrong or ATLAS not at expected path

**Solution**:
```bash
# Verify ATLAS directory exists
ls -la app/atlas

# Run from project root
cd /path/to/Kryptotrac-xx
node scripts/kryptotrac-mcp.js
```

### Issue: Empty routes array
**Cause**: ATLAS directory exists but is empty

**Solution**: This is valid but unexpected. Verify:
```bash
ls -la app/atlas/
```

### Issue: Hidden files not showing
**Cause**: By design, all files are shown including hidden ones

**Check**:
```bash
ls -la app/atlas/
```

### Issue: Nested routes not appearing
**Cause**: Tool only scans top level (non-recursive)

**Workaround**: For nested route discovery, you'll need to enhance the tool or manually inspect subdirectories.

## Code Reference

Implementation in `scripts/kryptotrac-mcp.js`:

```javascript
async function checkAtlasRoutes() {
  const atlasPath = path.join(process.cwd(), "app", "atlas");

  if (!fs.existsSync(atlasPath)) {
    return { tool: "check_atlas_routes", ok: false, error: "ATLAS directory not found" };
  }

  const files = fs.readdirSync(atlasPath);

  return {
    tool: "check_atlas_routes",
    ok: true,
    routes: files,
    count: files.length
  };
}
```

## Example ATLAS Directory Structure

```
app/atlas/
├── page.tsx              # Main ATLAS page
├── layout.tsx            # ATLAS layout
├── api.ts                # ATLAS API endpoint
├── dashboard/            # Dashboard subroute
│   └── page.tsx
└── settings/             # Settings subroute
    └── page.tsx
```

With this structure, `check_atlas_routes` would return:
```json
{
  "tool": "check_atlas_routes",
  "ok": true,
  "routes": ["page.tsx", "layout.tsx", "api.ts", "dashboard", "settings"],
  "count": 5
}
```

**Note**: Subdirectories appear as items but their contents are not included.

## Version History

- **v1.0.0** (2025-11-15): Initial release with top-level directory listing

## Future Enhancements

Potential improvements for future versions:
1. **Recursive Scanning**: List nested routes
2. **Route Filtering**: Filter by file type (.tsx, .ts, etc.)
3. **Route Metadata**: Include file sizes, modification dates
4. **Route Validation**: Check for Next.js conventions
5. **Route Dependencies**: Analyze imports and dependencies

---

[← Back to Tool Index](../index.md) | [← Previous: read_personas](./read_personas.md) | [Next: read_logs →](./read_logs.md)
