#!/bin/bash
# Script to fix pnpm-lock.yaml sync issue
# Run this script with network access to update the lockfile

set -e

echo "🔧 Fixing pnpm-lock.yaml sync issue..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    echo "Installing pnpm..."
    npm install -g pnpm@9.0.0
fi

# Verify pnpm version
PNPM_VERSION=$(pnpm --version)
echo "✓ Using pnpm version: $PNPM_VERSION"
echo ""

# Update lockfile
echo "📦 Updating pnpm-lock.yaml..."
pnpm install

# Verify the lockfile is now correct
echo ""
echo "✅ Verifying lockfile with --frozen-lockfile..."
pnpm install --frozen-lockfile

echo ""
echo "🎉 Success! The lockfile has been updated and verified."
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff pnpm-lock.yaml"
echo "2. Commit the changes: git add pnpm-lock.yaml && git commit -m 'fix: update pnpm-lock.yaml for @playwright/test and typescript'"
echo "3. Push to remote: git push"
