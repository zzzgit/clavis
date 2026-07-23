# TUI Components Documentation

## Overview

Clavis uses Solid.js components rendered by OpenTUI. The TUI runs with Bun because OpenTUI requires Bun's native FFI runtime. `bunfig.toml` preloads `@opentui/solid/preload`, which is required for Solid lifecycle hooks and keyboard handlers to work under Bun.

Components are located in `src/tui/components/`. Shared black-background color tokens are defined in `src/tui/theme.js`.

## Main Components

| Component | Responsibility |
|---|---|
| `App.jsx` | TUI state, keyboard routing, secret CRUD actions, and view selection. |
| `Header.jsx` | Token count, active filter, and expiration summary. |
| `SecretTable.jsx` | Responsive token table and selected-row display. |
| `Footer.jsx` | Context-sensitive status and shortcut help. |
| `CreateForm.jsx` | Creates a token from editable fields. |
| `EditForm.jsx` | Edits an existing token. |
| `SearchInput.jsx` | Filters tokens by key, tag, or comment. |
| `ConfirmDialog.jsx` | Confirms destructive actions. |
| `Warning.jsx` | Displays auto-closing success, warning, error, or information messages. |
| `HelpPanel.jsx` | Lists available table-view shortcuts. |

## Keyboard Controls

### Token table

| Key | Action |
|---|---|
| `↑` / `k` | Move selection up |
| `↓` / `j` | Move selection down |
| `Home` / `g` | Select the first token |
| `End` / `G` | Select the last token |
| `c` | Create a token |
| `e` | Edit the selected token |
| `dd` | Delete the selected token |
| `f` / `/` | Search tokens |
| `y` / `Y` | Copy the selected token / SID |
| `?` | Open help |
| `q` / `Ctrl+C` | Exit |

### Forms and dialogs

| View | Controls |
|---|---|
| Create / edit form | `Tab` or `Shift+Tab` changes field; `Enter` saves; `Esc` cancels. |
| Search | `Enter` finishes; `Ctrl+U` clears; `Esc` cancels. |
| Confirmation | `←` / `h` and `→` / `l` select; `Enter` confirms; `Esc` cancels. |
| Notification | `Space` or `Esc` dismisses. |

## Theme

The current theme targets black terminal backgrounds:

- **Cyan**: application accent, headings, and selected-row background.
- **Black on cyan**: text in the selected row for high contrast.
- **Green**: successful operations and active tokens.
- **Yellow**: warnings, expiring tokens, and confirmations.
- **Red**: errors and expired tokens.
- **White / gray**: primary and secondary text.

## Testing

`tests/tui/tui-smoke.test.js` launches a Bun-based OpenTUI test renderer and checks that the TUI mounts, responds to `c`, and exits with `q`. Run it directly with:

```bash
npm run test:tui
```

It also runs as part of the full test suite:

```bash
npm test
```
