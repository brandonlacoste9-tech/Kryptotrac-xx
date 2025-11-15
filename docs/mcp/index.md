# KryptoTrac MCP Server - Tool Index

Welcome to the KryptoTrac MCP (Model Context Protocol) Server documentation. This server provides GitHub Copilot Agents with specialized tools to interact with the KryptoTrac application.

## Quick Links

- [Overview](./overview.md) - What is the MCP server and how does it work
- [Getting Started](./getting-started.md) - How to run the server locally
- [Architecture](./architecture.md) - Technical details, design, and diagrams (with Mermaid visualizations)

## Available Tools

The KryptoTrac MCP Server provides four specialized tools:

### 1. 🔍 [check_bb_status](./tools/check_bb_status.md)
**Status**: ✅ Active  
**Purpose**: Verify that the BB (Backend Bot) system is active and synced with ATLAS

**Quick Example**:
```bash
echo '{"tool":"check_bb_status"}' | node scripts/kryptotrac-mcp.js
```

[📖 Full Documentation](./tools/check_bb_status.md)

---

### 2. 👤 [read_personas](./tools/read_personas.md)
**Status**: ✅ Active  
**Purpose**: Extract and list persona configurations from the application

**Quick Example**:
```bash
echo '{"tool":"read_personas"}' | node scripts/kryptotrac-mcp.js
```

[📖 Full Documentation](./tools/read_personas.md)

---

### 3. 🗺️ [check_atlas_routes](./tools/check_atlas_routes.md)
**Status**: ✅ Active  
**Purpose**: Inspect and list all routes defined in the ATLAS directory

**Quick Example**:
```bash
echo '{"tool":"check_atlas_routes"}' | node scripts/kryptotrac-mcp.js
```

[📖 Full Documentation](./tools/check_atlas_routes.md)

---

### 4. 📋 [read_logs](./tools/read_logs.md)
**Status**: ✅ Active  
**Purpose**: Read and return the last 20 lines from the application log file

**Quick Example**:
```bash
echo '{"tool":"read_logs"}' | node scripts/kryptotrac-mcp.js
```

[📖 Full Documentation](./tools/read_logs.md)

---

## Tool Response Format

All tools follow a consistent response format:

### Success Response
```json
{
  "tool": "<tool_name>",
  "ok": true,
  "...": "tool-specific data"
}
```

### Error Response
```json
{
  "tool": "<tool_name>",
  "ok": false,
  "error": "Error description"
}
```

## Testing All Tools

Use the provided test script to validate all tools:

```bash
npm run test:mcp
```

Or test manually:

```bash
# Test all tools at once
for tool in check_bb_status read_personas check_atlas_routes read_logs; do
  echo "Testing $tool..."
  echo "{\"tool\":\"$tool\"}" | node scripts/kryptotrac-mcp.js | grep "\"tool\""
done
```

## CI/CD Integration

The MCP server is automatically validated in CI/CD:

- Workflow: `.github/workflows/mcp-validation.yml`
- Runs on: Push to main/develop, Pull Requests
- Validates: JSON responses, tool availability, error handling

## Next Steps

1. [Read the Overview](./overview.md) to understand the MCP server architecture
2. [Follow Getting Started](./getting-started.md) to run the server locally
3. [Explore Individual Tools](./tools/) for detailed API documentation
4. Check [Troubleshooting](./README.md#troubleshooting) if you encounter issues

## Support

- GitHub Issues: Report bugs or request features
- Documentation: [Main README](./README.md)
- Tests: `tests/mcp/`

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Maintainer**: KryptoTrac Development Team
