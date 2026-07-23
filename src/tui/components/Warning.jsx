import { createEffect, onCleanup } from 'solid-js'
import { useKeyboard } from '@opentui/solid'
import { theme } from '../theme.js'

const Warning = (props) => {
  const color = () => ({ error: theme.danger, warning: theme.warning, success: theme.success, info: theme.accent }[props.type] || theme.warning)
  const close = () => props.onClose?.()
  useKeyboard((key) => { if (key.name === 'escape' || key.name === 'space') close() })
  createEffect(() => {
    if (!props.autoClose) return
    const timer = setTimeout(close, props.duration || 3000)
    onCleanup(() => clearTimeout(timer))
  })
  return <box border borderStyle="rounded" borderColor={color()} padding={1} flexDirection="column"><text fg={color()} bold>{props.title || 'Warning'}</text><text fg={theme.text}>{props.message}</text><text fg={theme.muted}>Press [Space] or [Esc] to dismiss</text></box>
}
export default Warning
