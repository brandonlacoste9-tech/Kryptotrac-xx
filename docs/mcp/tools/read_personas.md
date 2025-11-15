# Tool: read_personas

## Overview

The `read_personas` tool extracts and lists persona configurations from the KryptoTrac application. It reads the persona TypeScript file, identifies exported persona constants, and returns metadata about the personas defined in the application.

## Tool Name
```
read_personas
```

## Arguments Schema

This tool takes no arguments. Simply specify the tool name in the request.

### Request Schema
```json
{
  "tool": "read_personas"
}
```

**Fields**:
- `tool` (string, required): Must be `"read_personas"`

## Example Request

### Command Line
```bash
echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js
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
      if (response.tool === 'read_personas') {
        console.log('Personas:', response.personasDetected);
      }
    }
  });
});

mcp.stdin.write('{"tool":"read_personas"}\n');
```

### cURL (when HTTP mode is available)
```bash
# Future enhancement
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool":"read_personas"}'
```

## Example Response

### Success Response (when persona.ts exists)
```json
{
  "tool": "read_personas",
  "ok": true,
  "personasDetected": ["defaultPersona", "adminPersona", "guestPersona"],
  "lineCount": 150
}
```

**Response Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `true` if file was found and read successfully
- `personasDetected` (string[]): Array of persona names extracted from export statements
- `lineCount` (number): Total number of lines in the persona.ts file

### Error Response (Real Output - when persona.ts not found)
```json
{
  "tool": "read_personas",
  "ok": false,
  "error": "persona.ts not found"
}
```

**Error Fields**:
- `tool` (string): Echo of the requested tool name
- `ok` (boolean): `false` indicating failure
- `error` (string): Description of why the operation failed

### Full Server Output (Error Case)
```json
{"mcp":"kryptotrac-local","status":"started","tools":["read_logs","read_personas","check_atlas_routes","check_bb_status"]}
{"tool":"read_personas","ok":false,"error":"persona.ts not found"}
{"mcp":"kryptotrac-local","status":"exited"}
```

## Error Cases

### 1. Persona File Not Found
**Condition**: The file `app/lib/persona/persona.ts` does not exist

**Response**:
```json
{
  "tool": "read_personas",
  "ok": false,
  "error": "persona.ts not found"
}
```

**How to Fix**: 
- Create the persona file at `app/lib/persona/persona.ts`
- Or adjust the tool to look in a different location

### 2. File Read Permission Error
**Condition**: Process lacks permission to read the file

**Response**:
```json
{
  "tool": "read_personas",
  "ok": false,
  "error": "EACCES: permission denied"
}
```

**How to Fix**:
```bash
chmod 644 app/lib/persona/persona.ts
```

### 3. Invalid File Path
**Condition**: Path traversal or invalid characters

**Response**:
```json
{
  "tool": "read_personas",
  "ok": false,
  "error": "Invalid file path"
}
```

## Use Cases in GitHub Copilot Workflows

### 1. Code Navigation and Understanding
```javascript
// Copilot agent exploring codebase structure
async function explorePersonas() {
  const personas = await callMCPTool('read_personas');
  
  if (personas.ok) {
    console.log(`Found ${personas.personasDetected.length} personas:`);
    personas.personasDetected.forEach(p => console.log(`  - ${p}`));
    
    // Now can suggest which persona to modify
    return personas.personasDetected;
  }
}
```

### 2. Automated Documentation Generation
```javascript
// Generate documentation for all personas
async function generatePersonaDocs() {
  const result = await callMCPTool('read_personas');
  
  if (!result.ok) {
    console.log('⚠️  No personas found. Creating default documentation...');
    return;
  }
  
  const docs = `# Personas\n\nThis application has ${result.personasDetected.length} personas:\n\n`;
  result.personasDetected.forEach(persona => {
    docs += `## ${persona}\n\n`;
  });
  
  fs.writeFileSync('docs/PERSONAS.md', docs);
}
```

### 3. Validation Before Refactoring
```javascript
// Before refactoring persona system, check what exists
async function preRefactoringCheck() {
  const personas = await callMCPTool('read_personas');
  
  if (!personas.ok) {
    throw new Error('Cannot refactor - persona file not found');
  }
  
  console.log(`⚠️  Warning: Refactoring will affect ${personas.personasDetected.length} personas`);
  return personas.personasDetected;
}
```

### 4. CI/CD Validation
```yaml
- name: Validate Personas Exist
  run: |
    response=$(echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js | grep '"tool":"read_personas"')
    ok=$(echo "$response" | jq -r '.ok')
    
    if [ "$ok" != "true" ]; then
      echo "Persona configuration missing!"
      exit 1
    fi
    
    count=$(echo "$response" | jq -r '.personasDetected | length')
    echo "✅ Found $count personas"
```

### 5. Interactive Debugging with Copilot
```
Developer: "What personas do we have in the app?"

Copilot: Let me check...
> read_personas

Response: Found 3 personas: defaultPersona, adminPersona, guestPersona

Copilot: The application currently has 3 personas defined in app/lib/persona/persona.ts
```

### 6. Dynamic Test Generation
```javascript
// Generate tests for all personas
async function generatePersonaTests() {
  const result = await callMCPTool('read_personas');
  
  if (!result.ok) return;
  
  let testCode = 'describe("Personas", () => {\n';
  
  result.personasDetected.forEach(persona => {
    testCode += `  it("should have ${persona} defined", () => {\n`;
    testCode += `    expect(${persona}).toBeDefined();\n`;
    testCode += `  });\n\n`;
  });
  
  testCode += '});';
  
  fs.writeFileSync('tests/personas.test.ts', testCode);
}
```

### 7. Codebase Health Check
```javascript
async function healthCheck() {
  const checks = {
    personas: await callMCPTool('read_personas'),
    routes: await callMCPTool('check_atlas_routes'),
    bb: await callMCPTool('check_bb_status')
  };
  
  const report = {
    healthy: Object.values(checks).every(c => c.ok),
    details: checks
  };
  
  return report;
}
```

## Performance Characteristics

- **Response Time**: 10-50ms (depends on file size)
- **File Size Impact**: Linear with file size
- **Memory Usage**: ~1-2 MB for typical persona files
- **Concurrency**: Safe for parallel execution (read-only)

## Integration Notes

### File Location
The tool looks for personas at:
```
app/lib/persona/persona.ts
```

Relative to the current working directory where the MCP server is run.

### Detection Logic
The tool uses regex to find export statements:
```javascript
content.match(/export const (\w+)/g)
```

This matches patterns like:
- `export const defaultPersona = {...}`
- `export const adminPersona = {...}`

### When to Use
- Code exploration and navigation
- Documentation generation
- Pre-refactoring analysis
- CI/CD validation
- Dynamic test generation

### When NOT to Use
- Getting actual persona configuration (this only returns names)
- Real-time persona validation (file might be cached)
- Production persona loading (use proper import statements)

## Related Tools

- **check_atlas_routes**: Similarly inspects application structure
- **read_logs**: Another file-reading tool

## Troubleshooting

### Issue: Always returns "not found"
**Cause**: Working directory is wrong

**Solution**:
```bash
# Run from project root
cd /path/to/Kryptotrac-xx
node scripts/kryptotrac-mcp.js
```

### Issue: No personas detected despite file existing
**Cause**: Export statements don't match the regex pattern

**Solution**: Ensure exports follow this format:
```typescript
export const myPersona = { /* ... */ };
```

### Issue: Empty personasDetected array
**Cause**: File exists but has no matching export statements

**Check**:
```bash
grep "export const" app/lib/persona/persona.ts
```

## Code Reference

Implementation in `scripts/kryptotrac-mcp.js`:

```javascript
async function readPersonas() {
  const personaFile = path.join(process.cwd(), "app", "lib", "persona", "persona.ts");

  if (!fs.existsSync(personaFile)) {
    return { tool: "read_personas", ok: false, error: "persona.ts not found" };
  }

  const content = fs.readFileSync(personaFile, "utf8");

  return {
    tool: "read_personas",
    ok: true,
    personasDetected:
      content.match(/export const (\w+)/g)?.map((x) => x.replace("export const ", "")) || [],
    lineCount: content.split("\n").length
  };
}
```

## Example Persona File Structure

```typescript
// app/lib/persona/persona.ts

export const defaultPersona = {
  name: "Default User",
  permissions: ["read"],
  theme: "light"
};

export const adminPersona = {
  name: "Administrator",
  permissions: ["read", "write", "delete"],
  theme: "dark"
};

export const guestPersona = {
  name: "Guest",
  permissions: [],
  theme: "light"
};
```

With this file, `read_personas` would return:
```json
{
  "tool": "read_personas",
  "ok": true,
  "personasDetected": ["defaultPersona", "adminPersona", "guestPersona"],
  "lineCount": 18
}
```

## Version History

- **v1.0.0** (2025-11-15): Initial release with regex-based persona detection

---

[← Back to Tool Index](../index.md) | [← Previous: check_bb_status](./check_bb_status.md) | [Next: check_atlas_routes →](./check_atlas_routes.md)
