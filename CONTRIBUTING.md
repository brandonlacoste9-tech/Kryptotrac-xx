# Contributing to KryptoTrac

Thank you for your interest in contributing to KryptoTrac! We welcome contributions from the community.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We're building a tool for the global crypto community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, browser, Node version)

### Suggesting Features

1. Check [Discussions](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions) for similar ideas
2. Open a new discussion with:
   - Feature description
   - Use case/problem it solves
   - Proposed implementation (if you have ideas)

### Submitting Code

#### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Kryptotrac-xx.git
   cd Kryptotrac-xx
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development

1. Make your changes
2. Follow existing code style
3. Add tests if applicable
4. Run linting:
   ```bash
   npm run lint
   ```

5. Test your changes:
   ```bash
   npm run build
   npm run test
   ```

#### Commit Guidelines

Use clear, descriptive commit messages:

```
feat: Add BB personality switching
fix: Resolve portfolio calculation bug
docs: Update database setup guide
style: Format code with prettier
refactor: Simplify watchlist component
test: Add tests for auth flow
```

#### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG.md (if applicable)
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request with:
   - Clear title and description
   - Link to related issue (if any)
   - Screenshots/videos for UI changes
   - Checklist of what was changed

6. Wait for review and address feedback

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Keep functions small and focused
- Add comments for complex logic
- Use meaningful variable names

### Component Structure

```typescript
// Good
export function WatchlistCard({ coin, onRemove }: WatchlistCardProps) {
  // Component logic
  return (
    // JSX
  );
}

// Avoid
export default function Card(props: any) {
  // Component logic
}
```

### API Routes

- Use proper HTTP methods (GET, POST, etc.)
- Return consistent error formats
- Add rate limiting where needed
- Validate input data
- Use TypeScript types

### Database

- Always use RLS policies
- Write migrations, don't modify existing ones
- Test migrations on a test project first
- Document schema changes

### Security

- Never commit secrets or API keys
- Use environment variables
- Validate all user input
- Use prepared statements/parameterized queries
- Follow Supabase RLS best practices

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Sign up flow
- [ ] Login flow
- [ ] Add/remove watchlist items
- [ ] BB chat responds correctly
- [ ] Payment flow (use Stripe test cards)
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Links work correctly

## Documentation

When contributing features:

- Update relevant documentation files
- Add JSDoc comments to functions
- Update README.md if needed
- Add examples for new features

## Questions?

- Join discussions in [GitHub Discussions](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/discussions)
- Review existing [Issues](https://github.com/brandonlacoste9-tech/Kryptotrac-xx/issues)
- Check [Documentation](./README.md)

## Recognition

Contributors will be:
- Listed in a CONTRIBUTORS.md file
- Mentioned in release notes
- Given credit in the project

Thank you for helping make KryptoTrac better! 🐝
