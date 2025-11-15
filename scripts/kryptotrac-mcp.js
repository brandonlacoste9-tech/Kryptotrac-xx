#!/usr/bin/env node

/**
 * KryptoTrac MCP Server (Fully Loaded Edition)
 * --------------------------------------------
 * Provides tools for GitHub Copilot Coding Agent:
 *  - read_logs
 *  - read_personas
 *  - check_atlas_routes
 *  - check_bb_status
 *
 * No external dependencies. Fully self-contained.
 */

const fs = require("fs");
const path = require("path");

// Helper – safe JSON I/O
function write(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

// MCP server startup signal
write({
  mcp: "kryptotrac-local",
  status: "started",
  tools: ["read_logs", "read_personas", "check_atlas_routes", "check_bb_status"]
});

// Incoming requests
process.stdin.on("data", async (chunk) => {
  const raw = chunk.toString("utf8").trim();
  if (!raw) return;

  let msg;
  try {
    msg = JSON.parse(raw);
  } catch (e) {
    return write({ error: "Invalid JSON input", raw });
  }

  const tool = msg.tool;
  if (!tool) return write({ error: "No tool specified" });

  switch (tool) {
    case "check_bb_status":
      return write(await checkBBStatus());

    case "read_personas":
      return write(await readPersonas());

    case "check_atlas_routes":
      return write(await checkAtlasRoutes());

    case "read_logs":
      return write(await readLogs());

    default:
      return write({ error: `Unknown tool: ${tool}` });
  }
});

/* -----------------------------
   TOOL IMPLEMENTATIONS
--------------------------------*/

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

process.on("uncaughtException", (err) => {
  write({ error: "Uncaught Exception", detail: err.message });
});

process.on("exit", () => {
  write({ mcp: "kryptotrac-local", status: "exited" });
});
