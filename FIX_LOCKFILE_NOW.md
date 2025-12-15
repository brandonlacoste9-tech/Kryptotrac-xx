# URGENT: Fix pnpm-lock.yaml Sync Issue

## Current Status
**Build Status**: ❌ FAILING  
**Error**: `ERR_PNPM_OUTDATED_LOCKFILE`  
**Branch**: `copilot/fix-ui-button-authentication`  
**Affected Files**: `pnpm-lock.yaml`, `package.json`

## Problem
The `pnpm-lock.yaml` file is out of sync with `package.json`. The lockfile is missing:
- `@playwright/test@^1.48.0` (added to devDependencies)
- Updated `typescript` version from `^5` to `^5.1.0`

This causes Vercel builds to fail at the dependency installation stage.

## Quick Fix Options

### Option 1: Use GitHub Actions (RECOMMENDED - No Local Setup Required)
1. Go to [Actions Tab](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/actions/workflows/update-pnpm-lockfile.yml)
2. Click **"Run workflow"**
3. Select branch: `copilot/fix-ui-button-authentication` (or current branch)
4. Click **"Run workflow"**

The workflow will automatically:
- Install dependencies with `pnpm install`
- Update `pnpm-lock.yaml`
- Verify with `--frozen-lockfile`
- Commit and push changes

### Option 2: Local Fix (Requires pnpm)
```bash
# Ensure you're on the correct branch
git checkout copilot/fix-ui-button-authentication

# Update the lockfile
pnpm install

# Verify it works
pnpm install --frozen-lockfile

# Commit the changes
git add pnpm-lock.yaml
git commit -m "fix: update pnpm-lock.yaml for @playwright/test and typescript"
git push
```

### Option 3: Quick Command (One-liner)
```bash
cd /path/to/Kryptotrac-xx && pnpm install && git add pnpm-lock.yaml && git commit -m "fix: sync pnpm-lock.yaml with package.json" && git push
```

## Verification
After fixing, verify the build succeeds:
```bash
# Local verification
pnpm install --frozen-lockfile
pnpm run build

# Check Vercel
# Visit: https://vercel.com/brandons-projects-7c6e25ca/v0-kryptotrac
```

## Why This Happened
The dependencies in `package.json` were modified without running `pnpm install` to update the lockfile:
- `@playwright/test` was added for E2E testing
- `typescript` version was updated

## Prevention
Always use package manager commands to add/update dependencies:
```bash
# ✅ Correct
pnpm add @playwright/test -D
pnpm update typescript

# ❌ Avoid
# Manually editing package.json without running pnpm install
```

## Related Files
- `package.json` (line 98: `@playwright/test`, line 113: `typescript`)
- `pnpm-lock.yaml` (needs update)
- `.github/workflows/update-pnpm-lockfile.yml` (automated fix workflow)

## Technical Details
- **Package Manager**: pnpm@9.0.0
- **Lockfile Version**: 9.0
- **Node Version**: 20.x
- **Error Code**: ERR_PNPM_OUTDATED_LOCKFILE
