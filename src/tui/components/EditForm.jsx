import { createSignal } from 'solid-js'
import { useKeyboard } from '@opentui/solid'
import { theme } from '../theme.js'

const EditForm = (props) => {
  const fields = ['token', 'expiration', 'tag', 'comment', 'env']
  const labels = { token: 'Token', expiration: 'Expiration', tag: 'Tag', comment: 'Comment', env: 'Env Var' }
  const [data, setData] = createSignal({ token: props.token.token, expiration: props.token.expiration || '', tag: props.token.tag || '', comment: props.token.comment || '', env: props.token.env || '' })
  const [active, setActive] = createSignal(0)
  const save = () => { const current = data(); const updates = Object.fromEntries(fields.filter((field) => current[field] !== (props.token[field] || '')).map((field) => [field, field === 'expiration' ? current[field] || null : current[field]])); Object.keys(updates).length ? props.onSave(updates) : props.onCancel() }
  useKeyboard((key) => { if (key.name === 'escape') props.onCancel(); else if (key.name === 'return' || key.name === 'enter') save(); else if (key.name === 'tab') setActive((index) => (index + (key.shift ? fields.length - 1 : 1)) % fields.length) })
  return <box border borderStyle="rounded" borderColor={theme.accent} paddingX={2} flexDirection="column" flexGrow={1}><text fg={theme.accent} bold>Editing Token: {props.token.key}</text><text fg={theme.muted}>Key cannot be changed (create new token instead)</text>{fields.map((field, index) => <box><text width={12} fg={active() === index ? theme.accent : theme.text}>{labels[field]}:</text><input value={data()[field]} onInput={(value) => setData({ ...data(), [field]: value })} focused={active() === index} flexGrow={1} /></box>)}</box>
}
export default EditForm
