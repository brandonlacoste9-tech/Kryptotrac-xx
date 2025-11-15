# KryptoTrac MCP Server - Architecture

## Overview

The KryptoTrac MCP (Model Context Protocol) Server is a lightweight, standalone Node.js server that provides GitHub Copilot Agents with specialized tools for interacting with the KryptoTrac application. This document details the technical architecture, data flows, and system design.

## System Architecture

### High-Level System Overview

```mermaid
graph TB
    subgraph "GitHub Copilot Environment"
        A[GitHub Copilot Agent]
    end
    
    subgraph "MCP Server Process"
        B[stdin/stdout Handler]
        C[Request Parser]
        D[Tool Router]
        E[Tool: check_bb_status]
        F[Tool: read_personas]
        G[Tool: check_atlas_routes]
        H[Tool: read_logs]
    end
    
    subgraph "KryptoTrac Application"
        I[app/lib/persona/persona.ts]
        J[app/atlas/*]
        K[logs.txt]
        L[Backend Services]
    end
    
    A -->|JSON Request via stdin| B
    B --> C
    C --> D
    D -->|Route to Tool| E
    D -->|Route to Tool| F
    D -->|Route to Tool| G
    D -->|Route to Tool| H
    
    E -->|Simulate Check| L
    F -->|Read File| I
    G -->|List Directory| J
    H -->|Read File| K
    
    E -->|JSON Response| B
    F -->|JSON Response| B
    G -->|JSON Response| B
    H -->|JSON Response| B
    
    B -->|via stdout| A
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style D fill:#d4edda
    style E fill:#f8d7da
    style F fill:#f8d7da
    style G fill:#f8d7da
    style H fill:#f8d7da
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **Copilot Agent** | Initiates tool requests, processes responses | GitHub Copilot Runtime |
| **stdin/stdout Handler** | Manages I/O streams for IPC | Node.js streams |
| **Request Parser** | Parses and validates JSON requests | Native JSON.parse |
| **Tool Router** | Directs requests to appropriate tool handlers | Switch statement |
| **Tool Handlers** | Execute tool logic and return results | Async functions |
| **File System** | Source of truth for application data | Node.js fs module |

## Tool Invocation Flow

### Sequence Diagram: Complete Request-Response Cycle

```mermaid
sequenceDiagram
    participant Agent as GitHub Copilot Agent
    participant Process as MCP Server Process
    participant Parser as Request Parser
    participant Router as Tool Router
    participant Tool as Tool Handler
    participant FS as File System
    
    Note over Process: Server starts
    Process->>Agent: {"mcp":"kryptotrac-local","status":"started",...}
    
    Note over Agent: Agent needs to check BB status
    Agent->>Process: {"tool":"check_bb_status"}
    
    Process->>Parser: Raw stdin data
    Parser->>Parser: JSON.parse()
    
    alt Invalid JSON
        Parser->>Agent: {"error":"Invalid JSON input"}
    else Valid JSON
        Parser->>Router: Parsed request object
        
        Router->>Router: Switch on tool name
        
        alt Unknown Tool
            Router->>Agent: {"error":"Unknown tool: xyz"}
        else Known Tool
            Router->>Tool: Invoke tool handler
            
            alt Tool needs filesystem
                Tool->>FS: fs.readFileSync() or fs.readdirSync()
                FS-->>Tool: File contents / Directory listing
            end
            
            Tool->>Tool: Process data
            Tool-->>Router: Tool response object
            Router-->>Parser: Response ready
            Parser-->>Process: JSON response
            Process->>Agent: {"tool":"check_bb_status","ok":true,...}
        end
    end
    
    Note over Agent: Process response
    Agent->>Agent: Use tool data
    
    Note over Process: Agent closes connection
    Process->>Agent: {"mcp":"kryptotrac-local","status":"exited"}
```

### Request Flow Steps

1. **Initialization**
   - MCP server starts via `node scripts/kryptotrac-mcp.js`
   - Emits startup signal with available tools
   - Begins listening on stdin

2. **Request Reception**
   - Agent writes JSON to server's stdin
   - Server's data event handler captures input
   - Input is trimmed and validated

3. **Parsing & Validation**
   - JSON.parse() attempts to parse request
   - Validates presence of `tool` property
   - Returns error if invalid

4. **Routing**
   - Switch statement matches tool name
   - Routes to appropriate async handler function
   - Returns error for unknown tools

5. **Tool Execution**
   - Tool handler performs its operation
   - May interact with filesystem
   - Builds response object

6. **Response Delivery**
   - Response object serialized to JSON
   - Written to stdout with newline
   - Agent receives and processes response

7. **Cleanup**
   - On exit, server emits exit signal
   - Resources cleaned up automatically

## Internal File System Layout

### KryptoTrac Project Structure

```mermaid
graph TB
    subgraph "Project Root: /Kryptotrac-xx"
        ROOT[.]
        
        subgraph "Application Code"
            APP[app/]
            APP_ATLAS[app/atlas/]
            APP_LIB[app/lib/]
            APP_PERSONA[app/lib/persona/]
            PERSONA_FILE[app/lib/persona/persona.ts]
        end
        
        subgraph "MCP Server"
            SCRIPTS[scripts/]
            MCP_SERVER[scripts/kryptotrac-mcp.js]
        end
        
        subgraph "Documentation"
            DOCS[docs/]
            DOCS_MCP[docs/mcp/]
            DOCS_INDEX[docs/mcp/index.md]
            DOCS_TOOLS[docs/mcp/tools/]
        end
        
        subgraph "Testing"
            TESTS[tests/]
            TESTS_MCP[tests/mcp/]
            TEST_SERVER[tests/mcp/test-mcp-server.js]
        end
        
        subgraph "CI/CD"
            GITHUB[.github/]
            WORKFLOWS[.github/workflows/]
            MCP_WORKFLOW[.github/workflows/mcp-validation.yml]
        end
        
        subgraph "Runtime Data"
            LOGS[logs.txt]
        end
        
        subgraph "Config"
            PKG[package.json]
            TSCONFIG[tsconfig.json]
        end
    end
    
    ROOT --> APP
    ROOT --> SCRIPTS
    ROOT --> DOCS
    ROOT --> TESTS
    ROOT --> GITHUB
    ROOT --> LOGS
    ROOT --> PKG
    ROOT --> TSCONFIG
    
    APP --> APP_ATLAS
    APP --> APP_LIB
    APP_LIB --> APP_PERSONA
    APP_PERSONA --> PERSONA_FILE
    
    SCRIPTS --> MCP_SERVER
    
    DOCS --> DOCS_MCP
    DOCS_MCP --> DOCS_INDEX
    DOCS_MCP --> DOCS_TOOLS
    
    TESTS --> TESTS_MCP
    TESTS_MCP --> TEST_SERVER
    
    GITHUB --> WORKFLOWS
    WORKFLOWS --> MCP_WORKFLOW
    
    style MCP_SERVER fill:#ffd700
    style PERSONA_FILE fill:#90EE90
    style APP_ATLAS fill:#90EE90
    style LOGS fill:#90EE90
    style MCP_WORKFLOW fill:#87CEEB
    style TEST_SERVER fill:#FFB6C1
```

### Tool to Filesystem Mapping

```mermaid
graph LR
    subgraph "MCP Tools"
        T1[check_bb_status]
        T2[read_personas]
        T3[check_atlas_routes]
        T4[read_logs]
    end
    
    subgraph "File System Access"
        F1[No filesystem access<br/>Simulated check]
        F2[app/lib/persona/persona.ts<br/>Read file]
        F3[app/atlas/<br/>List directory]
        F4[logs.txt<br/>Read file]
    end
    
    T1 -.->|Simulates| F1
    T2 -->|fs.readFileSync| F2
    T3 -->|fs.readdirSync| F3
    T4 -->|fs.readFileSync| F4
    
    style T1 fill:#e1f5ff
    style T2 fill:#e1f5ff
    style T3 fill:#e1f5ff
    style T4 fill:#e1f5ff
    style F1 fill:#f0f0f0
    style F2 fill:#d4edda
    style F3 fill:#d4edda
    style F4 fill:#d4edda
```

## Data Flow Architecture

### Tool Execution Data Flow

```mermaid
flowchart TD
    Start([Agent Request]) --> Receive[Receive on stdin]
    Receive --> Parse{Valid JSON?}
    
    Parse -->|No| ErrorJSON[Return JSON error]
    Parse -->|Yes| CheckTool{Tool exists?}
    
    CheckTool -->|No| ErrorTool[Return unknown tool error]
    CheckTool -->|Yes| Execute[Execute tool handler]
    
    Execute --> FileCheck{Needs file access?}
    
    FileCheck -->|No| Simulate[Simulate/Compute result]
    FileCheck -->|Yes| FileExists{File exists?}
    
    FileExists -->|No| ErrorFile[Return file not found error]
    FileExists -->|Yes| ReadFile[Read file/directory]
    
    ReadFile --> Process[Process data]
    Simulate --> Process
    
    Process --> BuildResponse[Build JSON response]
    BuildResponse --> Send[Write to stdout]
    
    ErrorJSON --> Send
    ErrorTool --> Send
    ErrorFile --> Send
    
    Send --> End([Response delivered])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style ErrorJSON fill:#f8d7da
    style ErrorTool fill:#f8d7da
    style ErrorFile fill:#f8d7da
    style Execute fill:#fff3cd
    style Process fill:#fff3cd
```

## Communication Protocol

### JSON Message Format

#### Request Schema
```json
{
  "tool": "string (required)"
}
```

#### Response Schema (Success)
```json
{
  "tool": "string",
  "ok": true,
  "...": "tool-specific fields"
}
```

#### Response Schema (Error)
```json
{
  "error": "string",
  "detail": "string (optional)"
}
```

### Message Flow States

```mermaid
stateDiagram-v2
    [*] --> Idle: Server starts
    Idle --> Listening: stdin ready
    Listening --> Parsing: Data received
    
    Parsing --> Validating: JSON valid
    Parsing --> Error: JSON invalid
    
    Validating --> Routing: Tool specified
    Validating --> Error: No tool
    
    Routing --> Executing: Tool found
    Routing --> Error: Unknown tool
    
    Executing --> Success: Operation completed
    Executing --> Error: Operation failed
    
    Success --> Responding: Build response
    Error --> Responding: Build error response
    
    Responding --> Listening: Send to stdout
    Listening --> [*]: Exit signal
```

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Input Validation"
        A[JSON Schema Validation]
        B[Tool Name Whitelist]
    end
    
    subgraph "Execution Sandbox"
        C[File System Scope Limits]
        D[No Shell Execution]
        E[Read-Only Operations]
    end
    
    subgraph "Output Sanitization"
        F[JSON Serialization]
        G[Error Message Filtering]
    end
    
    INPUT[User Input] --> A
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> OUTPUT[Safe Output]
    
    style A fill:#d4edda
    style B fill:#d4edda
    style C fill:#fff3cd
    style D fill:#fff3cd
    style E fill:#fff3cd
    style F fill:#e1f5ff
    style G fill:#e1f5ff
```

### Security Constraints

1. **No Command Execution**: Server never executes shell commands
2. **Path Restrictions**: Only accesses specific whitelisted paths
3. **Read-Only**: All filesystem operations are read-only
4. **No Network**: No external network connections
5. **JSON-Only**: All I/O is JSON-serialized, preventing injection
6. **Process Isolation**: Runs in its own process space

## Performance Characteristics

### Resource Usage

| Metric | Value | Notes |
|--------|-------|-------|
| **Startup Time** | < 50ms | Node.js process initialization |
| **Memory Footprint** | ~10-20 MB | No external dependencies |
| **Response Time** | 10-100ms | Varies by tool and file size |
| **CPU Usage** | Minimal | I/O bound operations |
| **Concurrency** | Single-threaded | One request at a time via stdin |

### Scalability Considerations

```mermaid
graph LR
    subgraph "Current Design"
        A[Single Process] --> B[Sequential Processing]
        B --> C[stdin/stdout IPC]
    end
    
    subgraph "Potential Enhancements"
        D[Multiple Instances] --> E[Parallel Processing]
        E --> F[HTTP/WebSocket API]
    end
    
    C -.->|Future enhancement| F
    
    style A fill:#e1f5ff
    style D fill:#fff3cd
```

## Deployment Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Developer Machine"
        DEV[Developer]
        IDE[VS Code + Copilot]
        LOCAL[Local MCP Server]
        FILES[Project Files]
    end
    
    DEV --> IDE
    IDE --> LOCAL
    LOCAL --> FILES
    
    style IDE fill:#e1f5ff
    style LOCAL fill:#ffd700
```

### CI/CD Environment

```mermaid
graph TB
    subgraph "GitHub Actions Runner"
        RUNNER[Ubuntu Runner]
        NODE[Node.js 20]
        CHECKOUT[Checked out repo]
        MCP[MCP Server Instance]
        TESTS[Test Suite]
    end
    
    TRIGGER[Git Push/PR] --> RUNNER
    RUNNER --> NODE
    NODE --> CHECKOUT
    CHECKOUT --> MCP
    MCP --> TESTS
    TESTS --> RESULT[Pass/Fail]
    
    style RUNNER fill:#e1f5ff
    style MCP fill:#ffd700
    style RESULT fill:#d4edda
```

## Extension Points

### Adding New Tools

```mermaid
flowchart TD
    Start([Want new tool]) --> Define[Define tool purpose]
    Define --> Schema[Design request/response schema]
    Schema --> Implement[Implement tool function]
    Implement --> Register[Add to tool list and router]
    Register --> Document[Create documentation]
    Document --> Test[Add tests]
    Test --> CI[Update CI validation]
    CI --> Done([Tool ready])
    
    style Start fill:#e1f5ff
    style Done fill:#d4edda
    style Implement fill:#fff3cd
```

### Integration Points

1. **Tool Router** (`switch` statement in main file)
2. **Tool List** (startup signal)
3. **Documentation** (docs/mcp/tools/)
4. **Tests** (tests/mcp/)
5. **CI Validation** (.github/workflows/)

## Technology Stack

### Core Technologies

```mermaid
graph TB
    subgraph "Runtime"
        A[Node.js v14+]
    end
    
    subgraph "Standard Library"
        B[fs - File System]
        C[path - Path Operations]
        D[process - Process Control]
    end
    
    subgraph "Protocol"
        E[stdin/stdout]
        F[JSON]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    E --> F
    
    style A fill:#90EE90
    style F fill:#ffd700
```

### Dependencies

- **Runtime**: Node.js (no version constraint, v14+ recommended)
- **External Packages**: None (fully self-contained)
- **OS**: Cross-platform (Linux, macOS, Windows)

## Future Architecture Enhancements

### Potential Improvements

1. **HTTP Server Mode**: Alternative to stdin/stdout
2. **Tool Plugins**: Dynamic tool loading system
3. **Authentication**: Token-based tool access
4. **Caching**: Response caching for expensive operations
5. **Async Tools**: Support for long-running operations
6. **Streaming**: Stream large files instead of reading entirely

### Migration Path

```mermaid
graph LR
    V1[v1.0<br/>stdin/stdout] --> V2[v2.0<br/>+ HTTP API]
    V2 --> V3[v3.0<br/>+ Plugins]
    V3 --> V4[v4.0<br/>+ Auth + Cache]
    
    style V1 fill:#90EE90
    style V2 fill:#fff3cd
    style V3 fill:#e1f5ff
    style V4 fill:#d4edda
```

---

## Related Documentation

- [Tool Index](./index.md) - List of all available tools
- [Getting Started](./getting-started.md) - How to run the MCP server
- [README](./README.md) - Main documentation and troubleshooting

---

**Document Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Maintainer**: KryptoTrac Development Team
