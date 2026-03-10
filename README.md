# Clavis - API Token Management System

A command-line interface (CLI) tool for managing API tokens with support for hierarchical key organization and fuzzy search.

## Features

- **Token Management**: Create, read, update, and delete API tokens
- **Hierarchical Keys**: Support for dot-separated keys (e.g., `foo.bar.baz`)
- **Fuzzy Search**: Search tokens by key patterns
- **Tag System**: Categorize tokens with tags
- **Expiration Tracking**: Optional expiration dates with visual indicators
- **Data Persistence**: Tokens stored in JSON format
- **Validation**: Comprehensive input validation

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd clavis

# Install dependencies
npm install

# Make CLI globally available (optional)
npm link
```

## Usage

### Create a new token
```bash
clavis create --key "api.github.production" --token "ghp_abc123" --tag "github" --comment "Production API token"
```

### List all tokens
```bash
clavis list
```

### Search tokens by key pattern
```bash
clavis list --search "github"
clavis list --search "api"
```

### Filter tokens by tag
```bash
clavis list --tag "github"
```

### Show token details
```bash
clavis show "api.github.production"
```

### Update a token
```bash
clavis update "api.github.production" --token "ghp_newtoken123" --expiration "2024-12-31"
```

### Delete a token
```bash
clavis delete "api.github.production"
```

### Clear all tokens (with confirmation)
```bash
clavis clear
```

## Token Structure

Each token record contains:
- **key** (required): Hierarchical identifier (e.g., `service.environment.scope`)
- **token** (required): The actual API token value
- **expiration** (optional): Expiration date in YYYY-MM-DD format
- **tag** (optional): Categorization tag
- **comment** (optional): Description or notes
- **createdAt**: Automatic timestamp
- **updatedAt**: Automatic timestamp

## Key Format Rules

- Must be non-empty string
- Can contain letters, numbers, underscores, and hyphens
- Parts separated by dots (`.`)
- Cannot start or end with dots
- Cannot contain consecutive dots
- Examples: `api.github`, `aws.production.s3`, `database.staging.readonly`

## Data Storage

Tokens are stored in `data/tokens.json` in the project directory. The file is automatically created and managed by the application.

## TUI Interface

Clavis includes a Terminal User Interface (TUI) for interactive token management:

```bash
npm run dev:tui
```

### TUI Components
The TUI uses React components with the Ink library. See [COMPONENTS.md](COMPONENTS.md) for detailed documentation on:
- **ConfirmDialog**: Interactive confirmation dialogs for dangerous operations
- **Warning**: Notification components for feedback and error messages
- Other TUI components and their usage

## Development

### Project Structure
```
src/
├── index.js          # CLI entry point
├── tui/              # Terminal User Interface
│   ├── index.js      # TUI entry point
│   ├── components/   # React components
│   │   ├── App.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Warning.jsx
│   │   └── ...
│   └── utils/        # TUI utilities
├── models/
│   └── Token.js      # Token data model
├── services/
│   └── TokenStorage.js # Storage and business logic
└── utils/
    └── validators.js # Input validation
```

### Running Tests
```bash
npm test
```

## License

ISC