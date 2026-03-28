# CLAUDE.md - Coding Guidelines for Clavis

This document provides coding guidelines and instructions for Claude Code working on the Clavis project.

## Project Overview
Clavis is a token management system with a TUI interface. The codebase uses modern JavaScript (ES6+) with a focus on simplicity and maintainability.

## Code Style Guidelines

### Language & Syntax
- **Use modern JavaScript only** - ES6+ features are encouraged
- **No TypeScript** - This is a pure JavaScript project
- **Use `import/export` syntax** - Not `require()`
- **Prefer arrow functions** over `function` declarations for consistency
- **Use template literals** for string interpolation

### Asynchronous Programming
- **Prefer Promises over async/await** for consistency
- Chain `.then()` and `.catch()` instead of `async/await`
- Use `Promise.all()` for parallel operations
- Handle errors with `.catch()` or try-catch for async/await when necessary

### Comments & Documentation
- **English comments only** - All comments must be in English
- Use JSDoc-style comments for functions: `/** Description */`
- Keep comments concise and meaningful
- Document complex logic, but avoid stating the obvious

### Naming Conventions
- **camelCase** for variables, functions, and methods
- **PascalCase** for classes and constructors
- **UPPER_SNAKE_CASE** for constants
- Use descriptive names that indicate purpose
- Avoid single-letter variables except in loops

### File Organization
- One class per file when possible
- Group related functions together
- Keep files focused and manageable (under 500 lines)
- Use meaningful file names that reflect content

### Error Handling
- Use `try/catch` for synchronous code that may throw
- Always handle Promise rejections with `.catch()`
- Provide meaningful error messages
- Log errors appropriately for debugging

### TUI-Specific Guidelines
- Use ANSI escape codes for colors and formatting
- **Terminal size baseline is 80×24** — the app must display correctly at this size; terminals smaller than 80×24 are not supported
- **Responsive layout for larger terminals** — when the user resizes the terminal beyond 80×24, the app should adapt and make good use of the extra space
- Ensure responsive keyboard navigation
- Clear console only when necessary to avoid flickering

## Testing & Quality
- Run tests before committing changes
- Use the following commands:
  - `npm test` - Run test suite
  - `npm run lint` - Check code style
  - `npm run format` - Format code
- Ensure all tests pass before considering work complete

## Git Commit Guidelines
- Write clear, concise commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues when applicable
- Keep commits focused on single changes

## Project Structure
```
clavis/
├── src/
│   ├── tui/            # React-based TUI application
│   │   ├── index.js    # TUI entry point
│   │   └── components/ # React components
│   └── services/       # Business logic and storage
├── tests/              # Test files
├── package.json        # Project dependencies
└── CLAUDE.md          # This file
```

## Common Patterns

### Function Declaration
```javascript
// Prefer arrow functions
const processToken = (token) => {
  // Implementation
}

// Over function declarations
function processToken(token) {
  // Avoid this pattern
}
```

### Promise Usage
```javascript
// Prefer Promise chains
fetchData()
  .then(processData)
  .then(saveData)
  .catch(handleError)

// Over async/await
// Avoid unless necessary for complex flow control
```

### Error Handling
```javascript
// Good - Promise chain with error handling
loadTokens()
  .then(displayTokens)
  .catch((error) => {
    console.error('Failed to load tokens:', error)
    showErrorMessage(error.message)
  })

// Good - try/catch for synchronous operations
try {
  const result = riskyOperation()
  processResult(result)
} catch (error) {
  handleError(error)
}
```

## Important Notes for Claude Code
1. **Always check existing code patterns** before making changes
2. **Follow the established style** even if it differs from your preferences
3. **Test your changes** before considering work complete
4. **Ask for clarification** if guidelines are unclear
5. **Document non-obvious decisions** in code comments

## Quick Reference Commands
```bash
# Check code style
npm run lint

# Format code
npm run format

# Run tests
npm test

# Start TUI application
npm run dev:tui
```

## Gist Sync Commands

Clavis can back up and restore `tokens.json` via a private GitHub Gist.
Credentials are stored in `~/.config/clavis/config.toml` as `gist_token` and `gist_id`.

```bash
# Set GitHub Personal Access Token (needs gist scope)
clavis add gist-token

# Set an existing Gist ID manually (optional)
clavis add gist-id <id>

# Upload tokens.json to Gist (creates gist automatically if none exists)
clavis upload

# Download tokens.json from Gist and overwrite local file
clavis download
```

On first `upload` or `download`:
- If `gist_token` is missing, you will be prompted to enter it.
- If `gist_id` is missing, a new private gist is created and its ID is saved automatically.

Each upload writes two files to the gist:
- `tokens.json` — the encrypted token store
- `...clavis` — metadata (`lastUpload` timestamp and app version)

Remember: Consistency is key. When in doubt, look at existing code for guidance.