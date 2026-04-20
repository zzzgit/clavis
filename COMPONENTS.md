# TUI Components Documentation

This document describes the React components used in the Clavis TUI (Terminal User Interface).

## Overview

The TUI uses React with the Ink library to create interactive terminal interfaces. Components are located in `src/tui/components/`.

## Dialog Components

### ConfirmDialog - Interactive Confirmation Dialog

**Purpose**: Display a modal confirmation dialog that requires user input before proceeding with a potentially dangerous action.

**Location**: `src/tui/components/ConfirmDialog.jsx`

**Props**:
- `message` (string, required): The confirmation message to display
- `title` (string, default: "Confirm Action"): Dialog title
- `confirmText` (string, default: "Yes"): Text for confirm button
- `cancelText` (string, default: "No"): Text for cancel button
- `onConfirm` (function, required): Callback when user confirms
- `onCancel` (function, required): Callback when user cancels
- `type` (string, default: "warning"): Dialog type - "warning", "danger", or "info"

**Visual Types**:
- `warning` (default): Yellow border, ⚠️ icon
- `danger`: Red border, ❌ icon
- `info`: Blue border, ℹ️ icon

**Keyboard Controls**:
- `←` or `h`: Select previous option
- `→` or `l`: Select next option
- `Enter`: Confirm selected option
- `Esc`: Cancel dialog

**Usage Example**:
```jsx
<ConfirmDialog
  message="Delete secret 'api.github.production'? This action cannot be undone."
  title="Delete Secret"
  type="danger"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

**When to Use**:
- Deleting secrets or data
- Overwriting existing data
- Performing irreversible actions
- Any operation that requires explicit user consent

### Warning - Notification/Alert Component

**Purpose**: Display non-blocking notifications, alerts, or feedback messages to the user.

**Location**: `src/tui/components/Warning.jsx`

**Props**:
- `message` (string, required): The message to display
- `title` (string, default: "Warning"): Notification title
- `type` (string, default: "warning"): Message type - "error", "warning", "success", or "info"
- `autoClose` (boolean, default: false): Whether to automatically close after duration
- `duration` (number, default: 3000): Auto-close duration in milliseconds
- `onClose` (function): Callback when notification is closed

**Visual Types**:
- `error`: Red border/background, ❌ icon
- `warning` (default): Yellow border/background, ⚠️ icon
- `success`: Green border/background, ✅ icon
- `info`: Blue border/background, ℹ️ icon

**Keyboard Controls**:
- `Space` or `Esc`: Dismiss notification

**Usage Example**:
```jsx
// Success notification
<Warning
  message="Secret created successfully"
  title="Success"
  type="success"
  autoClose={true}
  duration={3000}
  onClose={hideNotification}
/>

// Error notification
<Warning
  message="Error saving secret: Invalid token format"
  title="Error"
  type="error"
  onClose={hideNotification}
/>
```

**When to Use**:
- Operation success feedback
- Error messages
- Warning messages
- Informational notifications
- Any non-critical feedback that doesn't require user action

## Component Comparison

| Aspect | ConfirmDialog | Warning |
|--------|--------------|---------|
| **Purpose** | User decision required | Information display only |
| **Interaction** | Blocking (must respond) | Non-blocking |
| **User Action** | Required (choose option) | Optional (dismiss) |
| **Auto-close** | Never | Configurable |
| **Return Value** | User choice (confirm/cancel) | None (notification only) |
| **Use Case** | Dangerous operations | Feedback/notifications |

## Integration in App.jsx

Both components are integrated into the main App component:

### ConfirmDialog Usage
Used for secret deletion confirmation. The dialog is triggered by double-tapping `d` (`dd`) within 500ms in the main secret list view:
```jsx
{showDeleteConfirm && (
  <ConfirmDialog
    message={`Delete secret "${selectedSecret?.key}"? This action cannot be undone.`}
    onConfirm={handleDeleteSecret}
    onCancel={handleCancelDelete}
  />
)}
```

### Warning Usage
Used for operation feedback through the `showWarning` helper:
```javascript
// Show success message
showWarning('Secret created successfully', 'success', 'Success');

// Show error message
showWarning(`Error saving secret: ${error.message}`, 'error', 'Error');
```

## Design Principles

1. **Separation of Concerns**: ConfirmDialog for decisions, Warning for notifications
2. **Consistent UX**: Both components follow the same visual language and keyboard shortcuts
3. **Progressive Disclosure**: Warning can auto-close, ConfirmDialog requires explicit action
4. **Accessibility**: Keyboard navigation support for both components

## Extending Components

### Adding New Dialog Types
To add a new type to ConfirmDialog:
1. Add the type to the `getBorderColor()`, `getTitleColor()`, and `getIcon()` functions
2. Update prop validation if needed

### Customizing Warning
The Warning component supports custom durations, auto-close behavior, and visual styles through props.

## Best Practices

1. **Use ConfirmDialog sparingly** - Only for truly dangerous operations
2. **Keep Warning messages concise** - Users should be able to read them quickly
3. **Use appropriate types** - Match the visual style to the message severity
4. **Consider auto-close** - For success messages, auto-close reduces clutter
5. **Provide keyboard alternatives** - Always support keyboard navigation