# CI/CD Package Manager Setup Guide

## Overview

This repository uses **pnpm v9.0.0** as its package manager. All CI/CD workflows must use pnpm consistently to ensure reliable builds and avoid network-related failures.

## Package Manager Configuration

### Package Manager Specification

The package manager is explicitly declared in `package.json`:

```json
{
  "packageManager": "pnpm@9.0.0"
}
```

This ensures that all developers and CI systems use the same version of pnpm.

### Why pnpm?

1. **Faster installs**: Uses content-addressable storage for packages
2. **Disk space efficiency**: Hard links packages instead of duplicating
3. **Strict dependency management**: Prevents phantom dependencies
4. **Lockfile reliability**: pnpm-lock.yaml ensures consistent installs

## CI/CD Workflow Setup

### Required Steps for All Workflows

Every GitHub Actions workflow must include these steps in order:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'

- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 9

- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Setup pnpm cache
  uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Why These Steps Matter

1. **Setup pnpm**: Installs pnpm in the CI environment
2. **Cache setup**: Reduces network calls by caching the pnpm store
3. **--frozen-lockfile**: Ensures lockfile and package.json are in sync
4. **Cache key**: Uses lockfile hash to invalidate cache when dependencies change

## Common Issues and Solutions

### Issue: npm vs pnpm Inconsistency

**Problem**: Using `npm ci` or `npm install` in a pnpm project
**Symptoms**: Missing package-lock.json, dependency installation failures
**Solution**: Always use `pnpm install --frozen-lockfile` in CI

### Issue: Firewall Blocking npm Registry

**Problem**: Network firewalls block access to registry.npmjs.org
**Symptoms**: `ENOTFOUND registry.npmjs.org` errors
**Solution**: Use GitHub Actions caching to minimize registry access

### Issue: Outdated pnpm-lock.yaml

**Problem**: Lockfile doesn't match package.json
**Symptoms**: `ERR_PNPM_OUTDATED_LOCKFILE` error
**Solution**: 
- Locally: Run `pnpm install` and commit the updated lockfile
- In CI: Use the "Update pnpm Lockfile" workflow (see below)

## Automated Lockfile Updates

### Using the Update pnpm Lockfile Workflow

When you cannot update the lockfile locally (e.g., in restricted environments):

1. Navigate to GitHub Actions in your repository
2. Select "Update pnpm Lockfile" workflow
3. Click "Run workflow"
4. Select the target branch
5. Click "Run workflow" button

The workflow will:
- Install all dependencies from package.json
- Update pnpm-lock.yaml
- Verify with --frozen-lockfile
- Commit and push changes automatically

## Current Workflows Using pnpm

### 1. CI Pipeline (enterprise-3i-atlas.yml)
- ✅ Uses pnpm
- ✅ Has caching
- ✅ Uses --frozen-lockfile

### 2. Playwright E2E Tests (playwright.yml)
- ✅ Uses pnpm (fixed in this PR)
- ✅ Has caching
- ✅ Uses --frozen-lockfile

### 3. Update pnpm Lockfile (update-pnpm-lockfile.yml)
- ✅ Uses pnpm
- ✅ Automated lockfile maintenance

## Best Practices

### For Developers

1. **Adding dependencies**: Always use `pnpm add <package>`
   ```bash
   # ✅ Correct
   pnpm add ethers
   
   # ❌ Wrong - doesn't update lockfile
   # Edit package.json manually
   ```

2. **Installing dependencies**: Use `pnpm install`
   ```bash
   # ✅ Correct
   pnpm install
   
   # ❌ Wrong - creates npm lockfile
   npm install
   ```

3. **Committing changes**: Always commit lockfile with package.json
   ```bash
   # ✅ Correct
   git add package.json pnpm-lock.yaml
   git commit -m "feat: add new dependency"
   ```

### For CI/CD Maintainers

1. **Never use npm commands** in workflows for this project
2. **Always include caching** to improve performance and reduce network calls
3. **Use --frozen-lockfile** to catch lockfile mismatches early
4. **Test workflow changes** with workflow_dispatch trigger before merging

## Troubleshooting

### Command Not Found: pnpm

If you see `pnpm: command not found`:

```bash
# Install pnpm globally
npm install -g pnpm@9

# Or use corepack (Node.js 16.9+)
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

### Cache Not Working

If dependencies are being downloaded every run:

1. Check cache key includes lockfile hash
2. Verify pnpm store path is correct
3. Check GitHub Actions cache storage limits

### Frozen Lockfile Failure

If `pnpm install --frozen-lockfile` fails:

1. Check if package.json was modified without updating lockfile
2. Run `pnpm install` locally to update lockfile
3. Commit and push pnpm-lock.yaml
4. Or use the "Update pnpm Lockfile" workflow

## References

- [pnpm Documentation](https://pnpm.io/)
- [GitHub Actions: pnpm/action-setup](https://github.com/pnpm/action-setup)
- [GitHub Actions: Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

## Related Documentation

- `CI_FIX_SUMMARY.md` - Historical CI/CD fixes
- `FIX_LOCKFILE_INSTRUCTIONS.md` - Lockfile troubleshooting
- `.github/workflows/` - All workflow configurations
