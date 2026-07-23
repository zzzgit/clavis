import { createSignal } from 'solid-js'
import { useKeyboard } from '@opentui/solid'
import { theme } from '../theme.js'

const ConfirmDialog = (props) => {
  const [selected, setSelected] = createSignal(0)
  useKeyboard((key) => {
    if (key.name === 'escape') props.onCancel()
    else if (key.name === 'return' || key.name === 'enter') selected() === 0 ? props.onConfirm() : props.onCancel()
    else if (key.name === 'left' || key.name === 'h') setSelected(0)
    else if (key.name === 'right' || key.name === 'l') setSelected(1)
  })
  return <box border borderStyle="rounded" borderColor={theme.warning} padding={2} flexDirection="column" flexGrow={1}>
    <text fg={theme.warning} bold>{props.title || 'Confirm Action'}</text><text fg={theme.text} marginTop={1}>{props.message}</text>
    <box justifyContent="center" gap={3} marginTop={2}><text fg={selected() === 0 ? theme.success : theme.muted} bold={selected() === 0}>[ {props.confirmText || 'Yes'} ]</text><text fg={selected() === 1 ? theme.accent : theme.muted} bold={selected() === 1}>[ {props.cancelText || 'No'} ]</text></box>
    <text fg={theme.muted} marginTop={1}>Press [←→/hl] to select, [Enter] to confirm, [Esc] to cancel</text>
  </box>
}
export default ConfirmDialog
