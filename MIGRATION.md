# Migration Complete: Ink/React → OpenTUI/Solid.js

Clavis has migrated its TUI from Ink and React to OpenTUI and Solid.js. The storage, encryption, configuration, Gist sync, CLI commands, and existing non-TUI tests remain unchanged.

## Final Architecture

| Layer | Technology |
|---|---|
| TUI framework | `@opentui/core` v0.4.5 |
| UI framework | `solid-js` v1.9 with `@opentui/solid` v0.4.5 |
| TUI runtime | Bun (required by OpenTUI native FFI) |
| CLI parser | Commander |
| Build tool | tsup with `babel-preset-solid` |
| Application language | Modern JavaScript |

## Migration Results

- Removed React, Ink, and related Ink component dependencies.
- Rewrote all active TUI views as Solid.js/OpenTUI components.
- Added `bunfig.toml` with `@opentui/solid/preload`; this is required for Solid lifecycle hooks and keyboard input under Bun.
- Added a shared black-background TUI theme in `src/tui/theme.js`.
- Removed unused TypeScript tooling and type packages.
- Added a Bun/OpenTUI smoke test that checks mounting plus the create and quit shortcuts.
- Removed the unused environment-variable selector component.

## Run and Verify

```bash
# Build production output
npm run build

# Start the TUI (requires Bun)
npm run go

# Run all tests
npm test

# Run only the TUI smoke test
npm run test:tui
```

## Active TUI Components

- `App.jsx` — state and keyboard routing
- `Header.jsx` / `Footer.jsx` — application status
- `SecretTable.jsx` — responsive token listing
- `CreateForm.jsx` / `EditForm.jsx` — token forms
- `SearchInput.jsx` — fuzzy-search input
- `ConfirmDialog.jsx` — destructive action confirmation
- `Warning.jsx` — notifications
- `HelpPanel.jsx` — keyboard reference

See [COMPONENTS.md](COMPONENTS.md) for the current component and shortcut documentation.
