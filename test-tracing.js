#!/usr/bin/env tsx

/**
 * Simple test script to verify tracing is working
 * Run with: ENABLE_OTEL=true tsx test-tracing.js
 */

console.log("Testing OpenTelemetry tracing setup...\n");

// Test 1: Check if tracing module loads
try {
  console.log("✓ Test 1: Loading tracer module");
  const tracer = await import("./server/tracer.ts");
  console.log("  - Module loaded successfully");
  console.log(`  - Tracing enabled: ${tracer.isTracingEnabled}`);
} catch (error) {
  console.error("✗ Test 1 failed:", error.message);
  process.exit(1);
}

// Test 2: Check dependencies
try {
  console.log("\n✓ Test 2: Checking dependencies");
  await import("@opentelemetry/api");
  console.log("  - @opentelemetry/api found");
  await import("@vercel/otel");
  console.log("  - @vercel/otel found");
  await import("@opentelemetry/instrumentation-http");
  console.log("  - @opentelemetry/instrumentation-http found");
  await import("@opentelemetry/instrumentation-express");
  console.log("  - @opentelemetry/instrumentation-express found");
} catch (error) {
  console.error("✗ Test 2 failed:", error.message);
  process.exit(1);
}

// Test 3: Test traced function
try {
  console.log("\n✓ Test 3: Testing traced() function");
  const { traced } = await import("./server/tracer.ts");
  
  const result = await traced("test-operation", { test: "true" }, async (span) => {
    span.setAttributes({ custom_attr: "test_value" });
    return "success";
  });
  
  console.log(`  - Result: ${result}`);
} catch (error) {
  console.error("✗ Test 3 failed:", error.message);
  process.exit(1);
}

// Test 4: Test getTraceContext
try {
  console.log("\n✓ Test 4: Testing getTraceContext()");
  const { getTraceContext } = await import("./server/tracer.ts");
  
  const context = getTraceContext();
  console.log(`  - Trace ID: ${context.traceId || "none (expected in non-traced context)"}`);
  console.log(`  - Span ID: ${context.spanId || "none (expected in non-traced context)"}`);
} catch (error) {
  console.error("✗ Test 4 failed:", error.message);
  process.exit(1);
}

console.log("\n✅ All tracing tests passed!\n");
console.log("To enable tracing in development:");
console.log("  ENABLE_OTEL=true npm run dev\n");
console.log("To view traces in production:");
console.log("  Vercel Dashboard → Monitoring → Traces\n");
