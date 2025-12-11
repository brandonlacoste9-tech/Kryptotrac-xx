# Changelog

All notable changes to KryptoTrac will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security - ChartStyle Component Hardening (2025-12-11)

#### Added
- **Runtime Validation in ChartStyle Component** - Implemented strict input validation for `dangerouslySetInnerHTML` usage
  - Chart ID validation: Only alphanumeric characters, hyphens, and underscores allowed
  - Config key validation: Prevents CSS injection through malformed property names
  - Color value validation: Strict regex patterns for hex, rgb, rgba, hsl, hsla, CSS variables, and color keywords
  - Automatic rejection of malicious inputs with console error logging
  
- **Comprehensive Security Documentation** - Added detailed JSDoc comments explaining:
  - Security requirements and constraints
  - Current implementation safety measures
  - Risk mitigation strategies
  - Prohibited actions and modification guidelines
  
- **Security Test Suite** - Created `tests/unit/chart-style-security.test.tsx` with:
  - 20+ test cases covering injection attack vectors
  - Validation tests for chart IDs, config keys, and color values
  - Edge case handling tests
  - Integration tests with real-world usage patterns

#### Security Risk Assessment
**Vulnerability**: Potential SSR/RCE through unsanitized `dangerouslySetInnerHTML` injection in ChartStyle component

**Risk Level**: MEDIUM (mitigated to LOW after changes)
- Original implementation used only static THEMES and controlled config, but lacked explicit validation
- No user-supplied content currently flows into the component
- Risk was primarily from future code changes introducing untrusted data

**Mitigation Strategy**:
1. ✅ Added runtime validation rejecting any malformed inputs
2. ✅ Implemented strict regex patterns for all injected values
3. ✅ Added comprehensive documentation warning about security risks
4. ✅ Created automated tests to prevent regression
5. ✅ Logged all rejected inputs for security monitoring

**Validation Patterns**:
- Chart IDs: `/^[a-zA-Z0-9_-]+$/`
- Config keys: `/^[a-zA-Z0-9_-]+$/`
- Hex colors: `/^#[0-9a-fA-F]{3,8}$/`
- RGB: `/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/`
- RGBA: `/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|0?\.\d+|1(?:\.0+)?)\s*\)$/` (alpha 0-1)
- HSL: `/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/`
- HSLA: `/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*(?:0|0?\.\d+|1(?:\.0+)?)\s*\)$/` (alpha 0-1)
- CSS variables: `/^var\(--[a-zA-Z0-9_-]+\)$/` plus variants with hsl/rgb wrappers
- Color keywords: `/^[a-z]+$/` (lowercase only)

**Test Plan**:
1. ✅ Unit tests verify rejection of malicious inputs
2. ✅ Integration tests confirm normal chart rendering works
3. ⏳ Manual smoke tests for chart theming in light/dark modes
4. ⏳ CodeQL security scan to verify vulnerability elimination

**Breaking Changes**: None - all valid existing configurations continue to work

### Added - Customer-Ready Improvements (2025-11-28)

#### Documentation
- **GETTING_STARTED.md** - Comprehensive setup guide for new users
- **DATABASE_SETUP.md** - Step-by-step database configuration guide
- **MIGRATION_GUIDE.md** - Quick reference for database migrations
- **DEPLOYMENT.md** - Complete deployment guide for multiple platforms
- **TROUBLESHOOTING.md** - Solutions to common issues and problems
- **FAQ.md** - Frequently asked questions with detailed answers
- **QUICK_REFERENCE.md** - Essential commands and tips for developers
- **CONTRIBUTING.md** - Contribution guidelines for the community
- **LICENSE** - MIT License file

#### Configuration
- **ESLint Configuration** - Added `.eslintrc.json` for code quality
- **Enhanced .env.example** - Detailed comments and setup instructions
- **Testing Dependencies** - Added Jest, Testing Library, and related packages

#### Organization
- **Documentation Structure** - Moved legacy docs to `docs/legacy/` folder
- **docs/README.md** - Documentation index and navigation guide
- **Cleaner Root Directory** - Only essential documentation in root

### Changed

#### Documentation
- **README.md** - Complete rewrite to be customer-focused and professional
  - Added feature highlights
  - Improved quick start section
  - Better organized documentation links
  - Added technology stack table
  - Enhanced with badges and visual elements

#### Configuration
- **package.json** - Added missing development dependencies
  - eslint and eslint-config-next
  - jest and jest-environment-jsdom
  - @testing-library packages
  - @types/jest

- **jest.setup.js** - Enabled @testing-library/jest-dom import

### Fixed
- **Missing ESLint** - Now properly configured for Next.js 16
- **Missing Test Dependencies** - Jest and Testing Library now included
- **Documentation Clutter** - Root directory cleaned up, legacy docs archived
- **Environment Setup Confusion** - Clear instructions in .env.example

## Architecture Decisions

### Why Move Documentation?
Legacy documentation files contained conflicting information and made the project appear cluttered. Moving them to `docs/legacy/` preserves history while presenting a clean, professional face to new users.

### Why Add So Much Documentation?
The project had extensive technical documentation but lacked customer-facing guides. New users need:
- Clear setup instructions
- Troubleshooting help
- FAQ for common questions
- Quick references for development

### Why These Dependencies?
- **ESLint**: Code quality and consistency (referenced in package.json but missing)
- **Jest**: Testing framework (referenced in package.json but missing)
- **Testing Library**: React component testing (best practice for Next.js)

## Migration Notes

### For Existing Developers
1. All legacy documentation is preserved in `docs/legacy/`
2. Start with the new GETTING_STARTED.md
3. Use QUICK_REFERENCE.md for daily commands
4. Check TROUBLESHOOTING.md if you hit issues

### For New Users
1. Read README.md for overview
2. Follow GETTING_STARTED.md for setup
3. Use FAQ.md for common questions
4. Reference DEPLOYMENT.md when ready to deploy

## Next Steps

### Recommended Improvements
- [ ] Add integration tests for critical paths
- [ ] Set up continuous integration (GitHub Actions)
- [ ] Add Prettier for code formatting
- [ ] Create API documentation
- [ ] Add performance monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add end-to-end tests with Playwright
- [ ] Create video tutorials for setup

### Future Documentation
- [ ] API Reference documentation
- [ ] Component Storybook
- [ ] Architecture Decision Records (ADRs)
- [ ] Performance optimization guide
- [ ] Security best practices guide

## Links

- **Repository**: https://github.com/brandonlacoste9-tech/Kryptotrac-xx
- **Issues**: https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues
- **Discussions**: https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions

---

**Note**: This project is under active development. Version numbers will be added when the first official release is tagged.
