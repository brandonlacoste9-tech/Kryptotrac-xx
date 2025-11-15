# KryptoTrac MCP Client SDK

Type-safe TypeScript client library for interacting with the KryptoTrac MCP Server.

## Features

- ✅ **Type-Safe**: Full TypeScript type definitions for all responses
- ✅ **Promise-Based**: Modern async/await API
- ✅ **Error Handling**: Comprehensive error types and handling
- ✅ **Zero Config**: Works out of the box with sensible defaults
- ✅ **Debug Mode**: Optional debug logging for troubleshooting
- ✅ **Flexible**: Configurable timeouts and paths

## Installation

The SDK is included in the repository. No additional installation needed.

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';
```

## Quick Start

### Basic Usage

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

const client = new KryptotracMCPClient();

// Check BB status
const status = await client.checkBBStatus();
if (status.ok) {
  console.log('BB Status:', status.status);
  console.log('Message:', status.message);
}

// Read personas
const personas = await client.readPersonas();
if (personas.ok) {
  console.log('Personas:', personas.personasDetected);
}

// Check ATLAS routes
const routes = await client.checkAtlasRoutes();
if (routes.ok) {
  console.log('Routes:', routes.routes);
}

// Read logs
const logs = await client.readLogs();
if (logs.ok) {
  console.log('Recent logs:', logs.logs);
}
```

### With Configuration

```typescript
const client = new KryptotracMCPClient({
  serverPath: 'scripts/kryptotrac-mcp.js',
  timeout: 10000,  // 10 seconds
  debug: true,     // Enable debug logging
  cwd: process.cwd()
});
```

### Error Handling

```typescript
import { KryptotracMCPClient, isError } from './sdk/kryptotrac-mcp-client';

const client = new KryptotracMCPClient();

const personas = await client.readPersonas();

if (isError(personas)) {
  console.error('Error:', personas.error);
} else {
  console.log('Success:', personas.personasDetected);
}
```

## API Reference

### `KryptotracMCPClient`

Main client class for interacting with the MCP server.

#### Constructor

```typescript
constructor(config?: MCPClientConfig)
```

**Config Options:**
- `serverPath?: string` - Path to MCP server script (default: `'scripts/kryptotrac-mcp.js'`)
- `timeout?: number` - Timeout in milliseconds (default: `5000`)
- `debug?: boolean` - Enable debug logging (default: `false`)
- `cwd?: string` - Working directory (default: `process.cwd()`)

#### Methods

##### `checkBBStatus()`

Check Backend Bot status.

```typescript
async checkBBStatus(): Promise<BBStatusResponse | MCPErrorResponse>
```

**Returns:**
```typescript
{
  tool: 'check_bb_status',
  ok: true,
  status: string,
  message: string,
  timestamp: string
}
```

##### `readPersonas()`

Read persona configurations.

```typescript
async readPersonas(): Promise<PersonasResponse | MCPErrorResponse>
```

**Returns:**
```typescript
{
  tool: 'read_personas',
  ok: true,
  personasDetected: string[],
  lineCount: number
}
```

##### `checkAtlasRoutes()`

List ATLAS routes.

```typescript
async checkAtlasRoutes(): Promise<AtlasRoutesResponse | MCPErrorResponse>
```

**Returns:**
```typescript
{
  tool: 'check_atlas_routes',
  ok: true,
  routes: string[],
  count: number
}
```

##### `readLogs()`

Read recent application logs.

```typescript
async readLogs(): Promise<LogsResponse | MCPErrorResponse>
```

**Returns:**
```typescript
{
  tool: 'read_logs',
  ok: true,
  logs: string[]
}
```

##### `healthCheck()`

Check health of all tools.

```typescript
async healthCheck(): Promise<HealthCheckResult>
```

**Returns:**
```typescript
{
  healthy: boolean,
  workingTools: number,
  totalTools: number,
  results: Record<string, { ok: boolean; error?: string }>
}
```

##### `getAllData()`

Execute all tools concurrently.

```typescript
async getAllData(): Promise<AllDataResult>
```

**Returns:**
```typescript
{
  bbStatus: BBStatusResponse | MCPErrorResponse,
  personas: PersonasResponse | MCPErrorResponse,
  routes: AtlasRoutesResponse | MCPErrorResponse,
  logs: LogsResponse | MCPErrorResponse
}
```

## Examples

### Example 1: Simple Status Check

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function checkStatus() {
  const client = new KryptotracMCPClient();
  const status = await client.checkBBStatus();
  
  if (status.ok) {
    console.log(`✅ BB is ${status.status}`);
  } else {
    console.error(`❌ Error: ${status.error}`);
  }
}

checkStatus();
```

### Example 2: List All Personas

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function listPersonas() {
  const client = new KryptotracMCPClient();
  const result = await client.readPersonas();
  
  if (result.ok) {
    console.log('Found personas:');
    result.personasDetected.forEach((persona, i) => {
      console.log(`  ${i + 1}. ${persona}`);
    });
    console.log(`\nTotal: ${result.personasDetected.length} personas`);
  } else {
    console.log('No personas configured:', result.error);
  }
}

listPersonas();
```

### Example 3: Health Check All Tools

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function runHealthCheck() {
  const client = new KryptotracMCPClient();
  const health = await client.healthCheck();
  
  console.log('='.repeat(40));
  console.log('MCP Server Health Check');
  console.log('='.repeat(40));
  console.log(`Status: ${health.healthy ? '✅ Healthy' : '⚠️  Issues Detected'}`);
  console.log(`Working: ${health.workingTools}/${health.totalTools} tools`);
  console.log('\nDetails:');
  
  for (const [tool, result] of Object.entries(health.results)) {
    const icon = result.ok ? '✅' : '❌';
    const msg = result.ok ? 'OK' : result.error;
    console.log(`  ${icon} ${tool}: ${msg}`);
  }
}

runHealthCheck();
```

### Example 4: Get All Data Concurrently

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function getAllInfo() {
  const client = new KryptotracMCPClient();
  
  console.log('Fetching all data...');
  const start = Date.now();
  
  const data = await client.getAllData();
  
  const duration = Date.now() - start;
  console.log(`\nCompleted in ${duration}ms\n`);
  
  // BB Status
  if (data.bbStatus.ok) {
    console.log('BB Status:', data.bbStatus.status);
  }
  
  // Personas
  if (data.personas.ok) {
    console.log('Personas:', data.personas.personasDetected.length);
  }
  
  // Routes
  if (data.routes.ok) {
    console.log('ATLAS Routes:', data.routes.count);
  }
  
  // Logs
  if (data.logs.ok) {
    console.log('Log Entries:', data.logs.logs.length);
  }
}

getAllInfo();
```

### Example 5: Error Analysis from Logs

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function analyzeErrors() {
  const client = new KryptotracMCPClient();
  const result = await client.readLogs();
  
  if (!result.ok) {
    console.log('No logs available');
    return;
  }
  
  const errors = result.logs.filter(log => 
    log.toLowerCase().includes('error') ||
    log.toLowerCase().includes('fail')
  );
  
  console.log(`📊 Error Analysis`);
  console.log(`Total logs: ${result.logs.length}`);
  console.log(`Errors found: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nRecent errors:');
    errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
}

analyzeErrors();
```

### Example 6: With TypeScript Type Guards

```typescript
import { 
  KryptotracMCPClient,
  isBBStatusResponse,
  isPersonasResponse,
  isError
} from './sdk/kryptotrac-mcp-client';

async function typeSafeExample() {
  const client = new KryptotracMCPClient();
  
  const response = await client.checkBBStatus();
  
  if (isBBStatusResponse(response)) {
    // TypeScript knows this is BBStatusResponse
    console.log('BB Status:', response.status);
    console.log('Timestamp:', response.timestamp);
  }
  
  if (isError(response)) {
    // TypeScript knows this is MCPErrorResponse
    console.error('Error:', response.error);
  }
}
```

### Example 7: CI/CD Integration

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function cicdValidation() {
  const client = new KryptotracMCPClient({ timeout: 10000 });
  
  // Run health check
  const health = await client.healthCheck();
  
  if (!health.healthy) {
    console.error('❌ MCP health check failed');
    console.error('Details:', health.results);
    process.exit(1);
  }
  
  // Validate ATLAS routes exist
  const routes = await client.checkAtlasRoutes();
  if (!routes.ok || routes.count === 0) {
    console.error('❌ No ATLAS routes found');
    process.exit(1);
  }
  
  console.log('✅ All validations passed');
  process.exit(0);
}

cicdValidation();
```

### Example 8: Monitoring Dashboard

```typescript
import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';

async function updateMonitoringDashboard() {
  const client = new KryptotracMCPClient();
  
  setInterval(async () => {
    const data = await client.getAllData();
    
    const dashboard = {
      timestamp: new Date().toISOString(),
      bb: {
        active: data.bbStatus.ok,
        status: data.bbStatus.ok ? data.bbStatus.status : 'UNKNOWN'
      },
      application: {
        personasCount: data.personas.ok ? data.personas.personasDetected.length : 0,
        routesCount: data.routes.ok ? data.routes.count : 0,
        recentLogCount: data.logs.ok ? data.logs.logs.length : 0
      }
    };
    
    console.log('Dashboard Update:', dashboard);
    // Send to monitoring system...
  }, 60000); // Update every minute
}

updateMonitoringDashboard();
```

## Type Definitions

All response types are fully typed:

```typescript
// BB Status
interface BBStatusResponse {
  tool: 'check_bb_status';
  ok: true;
  status: string;
  message: string;
  timestamp: string;
}

// Personas
interface PersonasResponse {
  tool: 'read_personas';
  ok: true;
  personasDetected: string[];
  lineCount: number;
}

// ATLAS Routes
interface AtlasRoutesResponse {
  tool: 'check_atlas_routes';
  ok: true;
  routes: string[];
  count: number;
}

// Logs
interface LogsResponse {
  tool: 'read_logs';
  ok: true;
  logs: string[];
}

// Error
interface MCPErrorResponse {
  tool: string;
  ok: false;
  error: string;
  details?: string;
}
```

## Type Guards

Use provided type guards for type narrowing:

```typescript
import {
  isError,
  isSuccess,
  isBBStatusResponse,
  isPersonasResponse,
  isAtlasRoutesResponse,
  isLogsResponse
} from './sdk/kryptotrac-mcp-client';

const response = await client.checkBBStatus();

if (isError(response)) {
  // Handle error
}

if (isBBStatusResponse(response)) {
  // TypeScript knows exact type
}
```

## Error Handling

The SDK provides comprehensive error handling:

### Tool-Level Errors

```typescript
const result = await client.readPersonas();

if (!result.ok) {
  console.error('Tool error:', result.error);
  // result.error could be: "persona.ts not found"
}
```

### SDK-Level Errors

```typescript
try {
  const result = await client.checkBBStatus();
} catch (error) {
  console.error('SDK error:', error.message);
  // Possible errors:
  // - "Timeout after 5000ms"
  // - "Failed to spawn MCP server"
  // - "No response received for tool"
}
```

## Best Practices

1. **Always check `ok` field** before accessing response data
2. **Use type guards** for type-safe code
3. **Set appropriate timeouts** for your use case
4. **Enable debug mode** when troubleshooting
5. **Handle both tool and SDK errors**
6. **Use `healthCheck()`** before critical operations
7. **Use `getAllData()`** for batch operations

## Troubleshooting

### Issue: Timeout errors

**Solution**: Increase timeout in config
```typescript
const client = new KryptotracMCPClient({ timeout: 10000 });
```

### Issue: Cannot find MCP server

**Solution**: Specify correct path
```typescript
const client = new KryptotracMCPClient({ 
  serverPath: '/absolute/path/to/scripts/kryptotrac-mcp.js' 
});
```

### Issue: Need to debug

**Solution**: Enable debug mode
```typescript
const client = new KryptotracMCPClient({ debug: true });
```

## Related Documentation

- [MCP Server Documentation](../docs/mcp/README.md)
- [Getting Started Guide](../docs/mcp/getting-started.md)
- [Tool API Reference](../docs/mcp/tools/)
- [Architecture Overview](../docs/mcp/architecture.md)

## License

Part of the KryptoTrac project. Same license applies.
