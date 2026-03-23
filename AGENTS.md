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