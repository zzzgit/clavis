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

## Security Architecture

Clavis protects token values with a two-layer security model:

### 1. Master Password & Key Derivation

Before using Clavis for the first time, set a master password:

```bash
clavis add pwd
```

The password is **never stored in plain text**. Instead:
- It is hashed with **Argon2** (memory-hard key derivation function)
- The resulting Argon2 hash string is stored in the **OS keychain / credentials manager** (via `cross-keychain`), under service `clavis`, account `master`

To update the password, the current password must be verified first (via `argon2.verify`) before the new one is accepted.

### 2. Token Field Encryption

When token records are written to disk, the `token` field is encrypted with **AES-256-GCM**:

1. At write time, `CryptoService` reads the Argon2 hash from the keychain
2. The raw hash output (last `$`-delimited segment, base64-decoded) is used as the 32-byte AES key
3. Each token value is encrypted with a random 12-byte IV and the resulting ciphertext is stored as:
   ```
   enc:<base64(iv[12 bytes] + authTag[16 bytes] + ciphertext)>
   ```
4. At load time, the process is reversed — tokens are decrypted in memory before use
5. Values not prefixed with `enc:` are returned as-is for backward compatibility

The AES key is derived from the Argon2 hash, so:
- The key is never stored directly on disk
- Without the correct master password in the keychain, token values cannot be decrypted
- GCM authentication tags provide integrity verification (tampered ciphertext is rejected)

### Key files

| File | Role |
|------|------|
| `src/services/CryptoService.js` | AES-256-GCM encrypt/decrypt, key derivation from keychain |
| `src/index.js` (`add pwd` / `get pwd`) | Argon2 hashing, keychain read/write |

## Data Storage

Tokens are stored in `data/tokens.json` in the project directory. The file is automatically created and managed by the application. Token values in this file are always AES-256-GCM encrypted (see Security Architecture above).

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