/**
 * KryptoTrac MCP Client SDK
 * ==========================
 * Type-safe TypeScript client for interacting with the KryptoTrac MCP Server
 * 
 * @example
 * ```typescript
 * import { KryptotracMCPClient } from './sdk/kryptotrac-mcp-client';
 * 
 * const client = new KryptotracMCPClient();
 * 
 * const status = await client.checkBBStatus();
 * console.log('BB Status:', status.status);
 * ```
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Base response interface that all tool responses extend
 */
export interface MCPBaseResponse {
  tool: string;
  ok: boolean;
}

/**
 * Error response from MCP server
 */
export interface MCPErrorResponse extends MCPBaseResponse {
  ok: false;
  error: string;
  details?: string;
}

/**
 * check_bb_status tool response
 */
export interface BBStatusResponse extends MCPBaseResponse {
  tool: 'check_bb_status';
  ok: true;
  status: string;
  message: string;
  timestamp: string;
}

/**
 * read_personas tool response (success)
 */
export interface PersonasResponse extends MCPBaseResponse {
  tool: 'read_personas';
  ok: true;
  personasDetected: string[];
  lineCount: number;
}

/**
 * check_atlas_routes tool response (success)
 */
export interface AtlasRoutesResponse extends MCPBaseResponse {
  tool: 'check_atlas_routes';
  ok: true;
  routes: string[];
  count: number;
}

/**
 * read_logs tool response (success)
 */
export interface LogsResponse extends MCPBaseResponse {
  tool: 'read_logs';
  ok: true;
  logs: string[];
}

/**
 * Union type of all possible successful responses
 */
export type MCPSuccessResponse = 
  | BBStatusResponse 
  | PersonasResponse 
  | AtlasRoutesResponse 
  | LogsResponse;

/**
 * Union type of all possible responses
 */
export type MCPResponse = MCPSuccessResponse | MCPErrorResponse;

/**
 * MCP server lifecycle signals
 */
export interface MCPSignal {
  mcp: string;
  status: 'started' | 'exited';
  tools?: string[];
}

/**
 * Complete MCP server output
 */
export interface MCPServerOutput {
  startup?: MCPSignal;
  response: MCPResponse;
  exit?: MCPSignal;
  rawOutput: string;
}

/**
 * Client configuration options
 */
export interface MCPClientConfig {
  /**
   * Path to the MCP server script
   * @default 'scripts/kryptotrac-mcp.js'
   */
  serverPath?: string;

  /**
   * Timeout in milliseconds for tool execution
   * @default 5000
   */
  timeout?: number;

  /**
   * Enable debug logging to stderr
   * @default false
   */
  debug?: boolean;

  /**
   * Working directory for the MCP server process
   * @default process.cwd()
   */
  cwd?: string;
}

// ============================================================================
// Client Implementation
// ============================================================================

/**
 * Type-safe client for the KryptoTrac MCP Server
 * 
 * @example
 * ```typescript
 * const client = new KryptotracMCPClient();
 * 
 * // Check BB status
 * const status = await client.checkBBStatus();
 * if (status.ok) {
 *   console.log('BB is', status.status);
 * }
 * 
 * // Read personas
 * const personas = await client.readPersonas();
 * if (personas.ok) {
 *   console.log('Found personas:', personas.personasDetected);
 * }
 * ```
 */
export class KryptotracMCPClient {
  private config: Required<MCPClientConfig>;

  /**
   * Create a new MCP client
   * @param config Optional configuration
   */
  constructor(config: MCPClientConfig = {}) {
    this.config = {
      serverPath: config.serverPath || 'scripts/kryptotrac-mcp.js',
      timeout: config.timeout || 5000,
      debug: config.debug || false,
      cwd: config.cwd || process.cwd(),
    };

    this.debugLog('MCP Client initialized', this.config);
  }

  /**
   * Internal debug logging
   */
  private debugLog(...args: any[]): void {
    if (this.config.debug) {
      console.error('[MCP Client Debug]', ...args);
    }
  }

  /**
   * Core method to call any MCP tool
   * @param toolName Name of the tool to call
   * @returns Promise resolving to the tool response
   */
  private async callTool(toolName: string): Promise<MCPServerOutput> {
    return new Promise((resolve, reject) => {
      const serverPath = path.isAbsolute(this.config.serverPath)
        ? this.config.serverPath
        : path.join(this.config.cwd, this.config.serverPath);

      this.debugLog(`Spawning MCP server: ${serverPath}`);
      this.debugLog(`Calling tool: ${toolName}`);

      const mcp: ChildProcess = spawn('node', [serverPath], {
        cwd: this.config.cwd,
      });

      let output = '';
      let errorOutput = '';
      let timedOut = false;

      // Set timeout
      const timer = setTimeout(() => {
        timedOut = true;
        mcp.kill();
        reject(new Error(`Tool ${toolName} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);

      // Collect stdout
      mcp.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      // Collect stderr
      mcp.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
        if (this.config.debug) {
          console.error('[MCP Server Error]', data.toString());
        }
      });

      // Handle process completion
      mcp.on('close', (code: number | null) => {
        clearTimeout(timer);

        if (timedOut) return;

        try {
          this.debugLog('Raw output:', output);

          // Parse all JSON lines from output
          const lines = output.split('\n').filter(l => l.trim());
          const parsed: any[] = [];

          for (const line of lines) {
            try {
              parsed.push(JSON.parse(line));
            } catch (e) {
              this.debugLog('Failed to parse line:', line);
            }
          }

          // Extract signals and response
          const startup = parsed.find(
            r => r.mcp === 'kryptotrac-local' && r.status === 'started'
          );
          const response = parsed.find(r => r.tool === toolName || r.error);
          const exit = parsed.find(
            r => r.mcp === 'kryptotrac-local' && r.status === 'exited'
          );

          if (!response) {
            reject(new Error(`No response received for tool: ${toolName}`));
            return;
          }

          resolve({
            startup,
            response,
            exit,
            rawOutput: output,
          });
        } catch (e) {
          reject(new Error(`Failed to parse MCP response: ${(e as Error).message}`));
        }
      });

      // Handle process errors
      mcp.on('error', (error: Error) => {
        clearTimeout(timer);
        reject(new Error(`Failed to spawn MCP server: ${error.message}`));
      });

      // Send tool request
      const request = JSON.stringify({ tool: toolName });
      this.debugLog('Sending request:', request);
      mcp.stdin?.write(request + '\n');
      mcp.stdin?.end();
    });
  }

  /**
   * Check BB (Backend Bot) status
   * @returns Promise resolving to BB status or error
   * 
   * @example
   * ```typescript
   * const status = await client.checkBBStatus();
   * if (status.ok) {
   *   console.log('BB Status:', status.status);
   *   console.log('Message:', status.message);
   * }
   * ```
   */
  async checkBBStatus(): Promise<BBStatusResponse | MCPErrorResponse> {
    const result = await this.callTool('check_bb_status');
    return result.response as BBStatusResponse | MCPErrorResponse;
  }

  /**
   * Read persona configurations from the application
   * @returns Promise resolving to personas list or error
   * 
   * @example
   * ```typescript
   * const personas = await client.readPersonas();
   * if (personas.ok) {
   *   console.log('Personas:', personas.personasDetected);
   *   console.log('File lines:', personas.lineCount);
   * } else {
   *   console.error('Error:', personas.error);
   * }
   * ```
   */
  async readPersonas(): Promise<PersonasResponse | MCPErrorResponse> {
    const result = await this.callTool('read_personas');
    return result.response as PersonasResponse | MCPErrorResponse;
  }

  /**
   * Check available routes in the ATLAS subsystem
   * @returns Promise resolving to routes list or error
   * 
   * @example
   * ```typescript
   * const routes = await client.checkAtlasRoutes();
   * if (routes.ok) {
   *   console.log('Routes:', routes.routes);
   *   console.log('Total:', routes.count);
   * }
   * ```
   */
  async checkAtlasRoutes(): Promise<AtlasRoutesResponse | MCPErrorResponse> {
    const result = await this.callTool('check_atlas_routes');
    return result.response as AtlasRoutesResponse | MCPErrorResponse;
  }

  /**
   * Read recent application logs (last 20 lines)
   * @returns Promise resolving to logs array or error
   * 
   * @example
   * ```typescript
   * const logs = await client.readLogs();
   * if (logs.ok) {
   *   logs.logs.forEach((log, i) => {
   *     console.log(`${i + 1}. ${log}`);
   *   });
   * }
   * ```
   */
  async readLogs(): Promise<LogsResponse | MCPErrorResponse> {
    const result = await this.callTool('read_logs');
    return result.response as LogsResponse | MCPErrorResponse;
  }

  /**
   * Execute a health check on all tools
   * @returns Promise resolving to health check results
   * 
   * @example
   * ```typescript
   * const health = await client.healthCheck();
   * console.log(`Health: ${health.healthy ? 'OK' : 'ISSUES'}`);
   * console.log(`Working tools: ${health.workingTools}/${health.totalTools}`);
   * ```
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    workingTools: number;
    totalTools: number;
    results: Record<string, { ok: boolean; error?: string }>;
  }> {
    const tools = [
      'check_bb_status',
      'read_personas',
      'check_atlas_routes',
      'read_logs',
    ];

    const results: Record<string, { ok: boolean; error?: string }> = {};
    let workingTools = 0;

    for (const tool of tools) {
      try {
        const result = await this.callTool(tool);
        const ok = result.response.ok === true;
        results[tool] = {
          ok,
          error: ok ? undefined : (result.response as MCPErrorResponse).error,
        };
        if (ok) workingTools++;
      } catch (error) {
        results[tool] = {
          ok: false,
          error: (error as Error).message,
        };
      }
    }

    return {
      healthy: workingTools === tools.length,
      workingTools,
      totalTools: tools.length,
      results,
    };
  }

  /**
   * Execute all tools concurrently and return results
   * @returns Promise resolving to all tool responses
   * 
   * @example
   * ```typescript
   * const all = await client.getAllData();
   * console.log('BB:', all.bbStatus);
   * console.log('Personas:', all.personas);
   * console.log('Routes:', all.routes);
   * console.log('Logs:', all.logs);
   * ```
   */
  async getAllData(): Promise<{
    bbStatus: BBStatusResponse | MCPErrorResponse;
    personas: PersonasResponse | MCPErrorResponse;
    routes: AtlasRoutesResponse | MCPErrorResponse;
    logs: LogsResponse | MCPErrorResponse;
  }> {
    const [bbStatus, personas, routes, logs] = await Promise.all([
      this.checkBBStatus(),
      this.readPersonas(),
      this.checkAtlasRoutes(),
      this.readLogs(),
    ]);

    return { bbStatus, personas, routes, logs };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Type guard to check if response is an error
 */
export function isError(response: MCPResponse): response is MCPErrorResponse {
  return response.ok === false;
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess(response: MCPResponse): response is MCPSuccessResponse {
  return response.ok === true;
}

/**
 * Type guard for BB status response
 */
export function isBBStatusResponse(
  response: MCPResponse
): response is BBStatusResponse {
  return response.tool === 'check_bb_status' && response.ok === true;
}

/**
 * Type guard for personas response
 */
export function isPersonasResponse(
  response: MCPResponse
): response is PersonasResponse {
  return response.tool === 'read_personas' && response.ok === true;
}

/**
 * Type guard for ATLAS routes response
 */
export function isAtlasRoutesResponse(
  response: MCPResponse
): response is AtlasRoutesResponse {
  return response.tool === 'check_atlas_routes' && response.ok === true;
}

/**
 * Type guard for logs response
 */
export function isLogsResponse(response: MCPResponse): response is LogsResponse {
  return response.tool === 'read_logs' && response.ok === true;
}

// ============================================================================
// Default Export
// ============================================================================

export default KryptotracMCPClient;
