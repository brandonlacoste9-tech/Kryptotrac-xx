---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: enterprise-3i-atlas-fusion-agent
description: >
  Enterprise 3I / ATLAS Fusion Operator for Kryptotrac-xx.
  Automates branch creation, atomic commit sequences, PR creation with the
  ENTERPRISE-3I-ATLAS-FUSION PR body, runs smoke tests (health/prices/BB),
  monitors CI, and posts status back to PRs/issues. Safe-by-default: never
  writes secrets, respects feature flags, and emits human-review prompts
  before destructive actions.
---

# My Agent
#
# What this agent does (summary for humans / agent runners):
#
# 1) When triggered (issue comment "/run fusion" or label "run-fusion" on an issue),
#    the agent:
#      - Creates branch: feature/enterprise-3i-atlas-fusion-kryptotrac
#      - Writes starter packages (atlas, orbitalprop, microsaas), APIs and UI stubs
#      - Commits the atomic commits described in the Super Task and pushes the branch
#      - Creates PR with ENTERPRISE-3I-ATLAS-FUSION.md as the body
#
# 2) After PR is opened, the agent:
#      - Kicks off CI (enterprise-3i-atlas workflow) and watches checks
#      - Runs smoke tests against preview site or local dev (health / prices / bb)
#      - Posts results as PR comments and marks required follow-ups
#
# 3) Continuous governance:
#      - Ensures .env.example is used (no secrets stored)
#      - Adds reviewer checklist to PR
#      - If CI fails, opens an auto-draft fix PR for trivial issues (lint/type fixes)
#
# Safety & policy:
#  - The agent will never commit secrets or overwrite protected branches.
#  - For any potentially destructive action (force-push, release tag), the agent
#    will pause and request explicit human confirmation in the PR or issue.
#
# How to trigger:
#  - Create an issue titled "Run enterprise fusion" and comment: /run fusion
#  - Or add label: run-fusion  (if your runner supports label-triggered automation)
#
# Example: If you want scripted/CLI invocation:
#  gh issue create --title "Run enterprise fusion" --body "/run fusion"
#
# Example of the minimal shell commands the agent will execute (safe, non-destructive):
#  - git fetch origin main
#  - git checkout -b feature/enterprise-3i-atlas-fusion-kryptotrac origin/main
#  - Create files (packages/atlas, packages/orbitalprop, lib/crypto/prices.ts, etc.)
#  - git add -A && git commit -m "chore: start enterprise fusion skeleton"
#  - git push -u origin feature/enterprise-3i-atlas-fusion-kryptotrac
#  - gh pr create --base main --head feature/enterprise-3i-atlas-fusion-kryptotrac --title "<PR title>" --body-file ENTERPRISE-3I-ATLAS-FUSION.md
#
# Recommended minimal permissions (set in repo/agent runner):
#  - contents: read + write (for branch/PR)
#  - issues: write (to post status/comments)
#  - pull_requests: write
#  - actions: read (monitor CI)
#
# Reviewer checklist automatically added by the agent to each PR:
#  - [ ] CI (build/test/lint) is green
#  - [ ] Smoke tests pass (api/health, api/prices, api/bb/message)
#  - [ ] .env.example present and contains placeholders
#  - [ ] No secrets committed
#  - [ ] Feature flags added (FEATURE_BB, FEATURE_MICROSAAS, FEATURE_ATLAS)
#
# Logs / outputs:
#  - The agent will post a summary comment on the PR with a per-commit list,
#    CI status, smoke-test output, and next recommended steps.
#
# Notes for implementer:
#  - If your agent runner supports a richer config schema, add these keys:
#      triggers:
#        - issue_comment: "/run fusion"
#        - label_added: "run-fusion"
#      runs:
#        command: ./scripts/run-enterprise-fusion.sh
#      env:
#        - name: DRY_RUN
#          default: "true"
#  - Keep DRY_RUN=true for first runs to verify behavior (agent only simulates changes).
#
# End of agent config
