import { createSignal } from 'solid-js'
import { useKeyboard } from '@opentui/solid'
import { theme } from '../theme.js'

const SearchInput = (props) => {
  const [value, setValue] = createSignal(props.initialValue || '')
  const submit = () => { props.onSearch(value()); props.onCancel() }
  useKeyboard((key) => {
    if (key.name === 'escape') props.onCancel()
    else if (key.name === 'return' || key.name === 'enter') submit()
    else if (key.ctrl && key.name === 'u') { setValue(''); props.onSearch('') }
  })
  return <box border borderStyle="rounded" borderColor={theme.accent} padding={2} flexDirection="column" flexGrow={1}>
    <text fg={theme.accent} bold>Search Tokens</text><text fg={theme.text} marginTop={1}>Search by key, tag, or comment:</text>
    <box marginTop={1}><text fg={theme.accent}>› </text><input value={value()} onInput={(next) => { setValue(next); props.onSearch(next) }} placeholder="Type to search..." focused /></box>
    <text fg={theme.muted} marginTop={1}>Press [Enter] to finish, [Ctrl+U] to clear, [Esc] to cancel</text>
  </box>
}
export default SearchInput
