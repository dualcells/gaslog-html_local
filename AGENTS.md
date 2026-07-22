# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

gaslog-html_local is a fuel consumption tracker built with AI assistance. The project uses HTML-based web technologies.

## Build/Lint/Test Commands

_Note: These commands should be updated once the project structure is established._

### Development Server
```bash
# Serve locally (update based on chosen framework)
npm run dev
# or
python -m http.server 8000
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Running Tests
```bash
# Run all tests
npm test

# Run a single test file
npm test -- path/to/test.spec.js

# Run a single test by name
npm test -- --grep "test name"
```

### Type Check
```bash
npm run typecheck
```

## Project Structure

_(To be defined as the project grows)_

```
/
├── src/           # Source code
├── tests/         # Test files
├── public/        # Static assets
└── dist/          # Build output
```

## Code Style Guidelines

### Imports
- Group imports logically: external dependencies first, then internal modules
- Use consistent import style across the codebase
- Prefer named imports when importing specific functions
- Example:
  ```javascript
  // External
  import { something } from 'library';
  
  // Internal
  import { helper } from './utils.js';
  ```

### Formatting
- Use 2 spaces for indentation (consistent with HTML/JS conventions)
- Use Unix line endings (LF)
- Maximum line length: 100 characters
- Use single quotes for strings unless double quotes are required
- Add trailing commas in multi-line objects/arrays
- Add blank lines between logical sections of code

### Types (JavaScript/TypeScript)
- Use TypeScript if the project adopts it
- Prefer explicit types over `any`
- Use descriptive interface/type names with PascalCase
- Document complex types with JSDoc comments

### Naming Conventions
- **Variables/Functions**: camelCase (`getUserData`, `isLoggedIn`)
- **Classes/Types/Interfaces**: PascalCase (`UserAccount`, `FuelEntry`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ENTRIES`, `API_BASE_URL`)
- **Files**: camelCase for modules (`fuelTracker.js`), PascalCase for components (`FuelEntry.tsx`)
- **CSS Classes**: Use kebab-case (`fuel-entry`, `input-field`)

### Error Handling
- Always handle errors gracefully
- Use try-catch for async operations
- Provide meaningful error messages
- Log errors appropriately (use console.error in development)
- Example:
  ```javascript
  try {
    await saveFuelEntry(data);
  } catch (error) {
    console.error('Failed to save fuel entry:', error.message);
    throw new Error('Could not save entry. Please try again.');
  }
  ```

### Code Comments
- Write self-documenting code; avoid obvious comments
- Use JSDoc for public functions and complex logic
- Comment "why" not "what"

### HTML/CSS Guidelines
- Use semantic HTML elements (`<header>`, `<main>`, `<article>`, etc.)
- Ensure accessibility: use proper ARIA labels and roles
- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Validate HTML for proper structure

### Git Commit Messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for maintenance tasks
- Keep commit messages concise and descriptive
- Reference issue numbers when applicable

## Release Process

1. Update version in source files (`index.html`, etc.)
2. Run `sha256sum index.html styles.css app.js` and update `checksums.txt`
3. Commit changes
4. Create a GitHub release with the title `Gas Log vX.Y.Z` and tag `vX.Y.Z`
5. Write release notes following the template below

### Checksums

`checksums.txt` is manually maintained. To update it:

```bash
sha256sum index.html styles.css app.js
```

Replace the contents of `checksums.txt` with the output, keeping the header comment updated with the current version:

```
# Gas Log vX.Y.Z SHA256 Checksums
# Use: sha256sum -c checksums.txt

<hash>  index.html
<hash>  styles.css
<hash>  app.js
```

### Release Notes Template

Use this structure for the GitHub release body:

```markdown
## What's New in vX.Y.Z

### Bug Fixes

- **#N:** Short description of the fix
  - Sub-bullet explaining the user-facing impact or behaviour change

### Features

- **#N:** Short description of the feature
  - Sub-bullet explaining how it works or what it adds

### Refactoring

- Description of code cleanup or structural improvements

### Security

- ASVS Level 1: XX% pass rate
- ASVS Level 2: XX% pass rate

_(Include this section only when security-relevant changes are made)_

### Files

- index.html (version bump to vX.Y.Z)
- styles.css
- app.js
- checksums.txt (updated for vX.Y.Z)

Verify integrity with: `sha256sum -c checksums.txt`
```

**Guidelines:**

- Use `## What's New in vX.Y.Z` as the top-level heading in the body
- Reference issue numbers with `**#N:**` in bold at the start of the line
- Add sub-bullets under each item to explain the user-facing impact
- Use `### Bug Fixes`, `### Features`, `### Refactoring` as category headings (omit empty categories)
- Include `### Security` only when ASVS scores have changed or security fixes are made
- Always include `### Files` listing all changed files and the `sha256sum -c checksums.txt` verification command
- Keep descriptions concise and user-facing (what changed, not how)

## Security Considerations

- Never expose API keys or secrets in client-side code
- Validate all user inputs before processing
- Sanitize data before rendering to prevent XSS
- Use HTTPS for any API calls

## Testing Guidelines

- Write tests for all critical functionality
- Place tests in `tests/` directory mirroring `src/` structure
- Use descriptive test names that explain expected behavior
- Test edge cases and error conditions
- Keep tests focused and independent

---

_This file should be updated as the project evolves and conventions are established._