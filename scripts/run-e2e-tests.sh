#!/usr/bin/env bash

# Comprehensive E2E Test Runner
# Runs all Playwright tests and generates detailed report

echo "🧪 Starting Comprehensive E2E Test Suite..."
echo ""

# Check if dev server is running
echo "📡 Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is not running!"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Running Playwright tests..."
echo ""

# Run Playwright tests with detailed output
npx playwright test tests/playwright/comprehensive-e2e.spec.ts \
  --reporter=list \
  --reporter=html \
  --reporter=json

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
    echo "📊 View detailed report:"
    echo "   npx playwright show-report"
else
    echo ""
    echo "❌ Some tests failed!"
    echo ""
    echo "📊 View detailed report:"
    echo "   npx playwright show-report"
    exit 1
fi
