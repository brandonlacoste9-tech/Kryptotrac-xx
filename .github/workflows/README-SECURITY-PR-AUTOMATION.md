# Security PR Automation Workflow - Maintainer Guide

## Overview

The Security PR Automation workflow (`security-pr-automation.yml`) provides automated handling of security-related pull requests from trusted sources. It aims to reduce manual intervention for routine security updates while maintaining high code quality and security standards.

## Features

### 1. **Trusted Bot Detection**
Automatically identifies and processes PRs from:
- Dependabot
- GitHub Security
- Vercel bot

### 2. **Automatic Conflict Resolution**
- **Dependency Files**: Automatically resolves conflicts in `package.json`, `yarn.lock`, `pnpm-lock.yaml`, and `package-lock.json` by preferring incoming (bot) changes
- **Code Files**: Applies smart resolution strategies with detailed logging for manual review

### 3. **CI/Test Execution**
- Installs dependencies
- Runs linter (`npm run lint`)
- Executes test suite (`npm test`)
- Logs all failures with detailed output

### 4. **Automated Fixes**
- Attempts to auto-fix lint errors using `--fix` flag
- Simulates test fixes (requires manual intervention for actual fixes)
- Commits and pushes fixes automatically (production mode only)

### 5. **Auto-Merge**
- Merges PR automatically when all checks pass
- Uses squash merge strategy
- Only active in production mode

### 6. **Audit Logging**
- Posts detailed audit log as PR comment
- Includes:
  - PR source detection
  - Conflict resolution details
  - CI/test results
  - Actions taken
  - Final summary

## Configuration

### Test Mode vs Production Mode

The workflow operates in two modes:

#### Test Mode (Default)
- **Purpose**: Safe testing and validation
- **Behavior**: 
  - Performs all checks
  - Simulates actions (no actual changes)
  - Logs what would happen
  - Posts audit log
  - **Does NOT auto-merge**
- **Setting**: `TEST_MODE: "true"`

#### Production Mode
- **Purpose**: Live automation
- **Behavior**:
  - Performs all checks
  - Executes actual changes
  - Resolves conflicts
  - Auto-fixes errors
  - **Auto-merges when eligible**
- **Setting**: `TEST_MODE: "false"`

### Enabling Production Mode

To switch from test mode to production mode:

1. **Via Workflow Dispatch** (Recommended for testing):
   ```
   Go to Actions → Security PR Automation → Run workflow
   Select "false" for test_mode parameter
   ```

2. **Via Environment Variable** (For permanent change):
   Edit the workflow file to change the default:
   ```yaml
   env:
     TEST_MODE: "false"  # Change from "true" to "false"
   ```

## Workflow Steps

### Step-by-Step Process

1. **PR Detection**
   - Triggers on PR events (opened, synchronize, reopened)
   - Verifies PR author is a trusted bot
   - Logs PR source

2. **Conflict Detection**
   - Attempts to merge base branch
   - Identifies conflicted files
   - Categorizes conflicts (dependency vs code)

3. **Dependency Conflict Resolution**
   - Auto-resolves conflicts in dependency files
   - Accepts incoming (bot) changes
   - Commits resolution (production mode)

4. **Code Conflict Resolution**
   - Logs code conflicts for review
   - Applies smart resolution strategy
   - Flags for manual review if needed

5. **Dependency Installation**
   - Runs `pnpm install --frozen-lockfile`
   - Logs installation status

6. **Linting**
   - Executes `pnpm run lint`
   - Captures lint errors

7. **Lint Auto-Fix**
   - Attempts `pnpm run lint --fix`
   - Commits fixes (production mode)

8. **Testing**
   - Runs `pnpm test`
   - Logs test results

9. **Test Auto-Fix**
   - Simulates test fixes
   - Requires manual intervention for complex issues

10. **Auto-Merge Eligibility**
    - Checks all conditions:
      - Dependencies installed
      - No lint errors (or auto-fixed)
      - Tests passing
      - No unresolved conflicts
    - Determines merge eligibility

11. **Auto-Merge**
    - Merges PR using squash strategy
    - Only in production mode
    - Only if eligible

12. **Audit Log**
    - Posts comprehensive log as PR comment
    - Includes all actions and results

## Required Permissions

The workflow requires the following GitHub permissions:

```yaml
permissions:
  contents: write           # For conflict resolution and fixes
  pull-requests: write      # For comments and auto-merge
  checks: read             # For reading CI status
  statuses: read           # For reading commit statuses
```

## Trigger Conditions

The workflow triggers on:

1. **Pull Request Events**:
   - `opened`: When a new PR is created
   - `synchronize`: When new commits are pushed
   - `reopened`: When a closed PR is reopened

2. **Workflow Dispatch**:
   - Manual trigger with test mode option

3. **Actor Filter**:
   - Only runs for trusted bots
   - Skips PRs from other users

## Customization

### Adding New Trusted Bots

To add a new trusted bot, edit the workflow condition:

```yaml
if: |
  github.event_name == 'workflow_dispatch' ||
  github.actor == 'dependabot[bot]' ||
  github.actor == 'github-actions[bot]' ||
  github.actor == 'vercel[bot]' ||
  github.actor == 'your-new-bot[bot]'
```

### Modifying Dependency Files

To add new dependency files for auto-resolution:

```bash
if [[ "$file" == "package.json" ]] || \
   [[ "$file" == "yarn.lock" ]] || \
   [[ "$file" == "pnpm-lock.yaml" ]] || \
   [[ "$file" == "package-lock.json" ]] || \
   [[ "$file" == "your-new-file" ]]; then
```

### Changing Merge Strategy

To change from squash to merge or rebase:

```bash
# In the auto-merge step
curl -X PUT \
  -d '{"merge_method":"merge"}'  # Options: "merge", "squash", "rebase"
```

### Customizing CI Commands

Modify the lint and test steps:

```yaml
# For different linter
- name: Run linter
  run: pnpm run your-lint-command

# For different test runner
- name: Run tests
  run: pnpm run your-test-command
```

## Troubleshooting

### Common Issues

#### 1. **Workflow Not Triggering**
- **Cause**: PR author is not a trusted bot
- **Solution**: Check actor filter condition
- **Debug**: View workflow logs for trigger evaluation

#### 2. **Auto-Merge Not Working**
- **Cause**: Test mode is enabled
- **Solution**: Disable test mode or use workflow dispatch
- **Debug**: Check audit log for mode indicator

#### 3. **Conflict Resolution Failing**
- **Cause**: Complex conflicts beyond dependency files
- **Solution**: Manual resolution required
- **Debug**: Check audit log for conflict details

#### 4. **Lint/Test Fixes Not Applied**
- **Cause**: Test mode enabled or fixes unsuccessful
- **Solution**: Review audit log, may need manual fixes
- **Debug**: Check fix attempt logs in audit

#### 5. **Permissions Error**
- **Cause**: Insufficient GitHub token permissions
- **Solution**: Verify workflow permissions in workflow file
- **Debug**: Check error message in workflow logs

### Debug Mode

To enable verbose logging:

```yaml
# Add to workflow environment
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## Best Practices

### Initial Deployment

1. **Start in Test Mode**
   - Deploy with `TEST_MODE: "true"`
   - Monitor several PRs
   - Review audit logs
   - Verify behavior

2. **Gradual Rollout**
   - Test with Dependabot PRs first
   - Verify conflict resolution
   - Check lint/test fixes
   - Monitor for issues

3. **Enable Production Mode**
   - After successful test period
   - Continue monitoring
   - Be ready to disable if needed

### Ongoing Maintenance

1. **Regular Monitoring**
   - Review audit logs weekly
   - Check for patterns in failures
   - Update resolution strategies

2. **Version Updates**
   - Keep actions up to date
   - Test in staging environment
   - Roll out gradually

3. **Security**
   - Review auto-merge eligibility criteria
   - Audit successful merges
   - Investigate failures

## Security Considerations

### What Gets Auto-Merged

Only PRs that meet ALL criteria:
- From trusted bot
- No unresolved conflicts
- Dependencies installed successfully
- Linter passes (or auto-fixed)
- Tests pass
- Production mode enabled

### What Requires Manual Review

- Code conflicts that can't be auto-resolved
- Test failures that can't be auto-fixed
- Any PR with eligibility check failures
- PRs in test mode

### Security Best Practices

1. **Trust But Verify**
   - Even trusted bots can introduce issues
   - Monitor merged PRs
   - Have rollback plan

2. **Limit Scope**
   - Only enable for security/dependency PRs
   - Keep list of trusted bots minimal
   - Review merged changes periodically

3. **Maintain Control**
   - Keep test mode as default
   - Enable production mode selectively
   - Monitor audit logs

## Support and Maintenance

### Workflow Updates

The workflow should be reviewed and updated:
- Quarterly for dependency updates
- When GitHub Actions introduces breaking changes
- When new security requirements emerge
- Based on incident learnings

### Contact

For issues or questions:
1. Review audit logs in PR comments
2. Check workflow run logs in Actions tab
3. Review this documentation
4. Contact repository maintainers

## Version History

### Version 1.0.0
- Initial release
- Trusted bot detection (Dependabot, GitHub Security, Vercel)
- Dependency file conflict resolution
- Smart code conflict strategy
- CI/test execution with auto-fix
- Test mode / production mode support
- Comprehensive audit logging

## License

This workflow is part of the Kryptotrac-xx project and subject to the project's license terms.
