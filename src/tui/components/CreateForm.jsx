import { createSignal } from 'solid-js'
import { useKeyboard } from '@opentui/solid'
import { theme } from '../theme.js'

const CreateForm = (props) => {
  const fields = ['key', 'token', 'expiration', 'tag', 'comment', 'env']
  const labels = { key: 'Key', token: 'Token', expiration: 'Expiration', tag: 'Tag', comment: 'Comment', env: 'Env Var' }
  const [data, setData] = createSignal({ key: '', token: '', expiration: '', tag: '', comment: '', env: '' })
  const [active, setActive] = createSignal(0)
  const save = () => { const value = data(); if (value.key.trim() && value.token.trim()) props.onSave({ ...value, key: value.key.trim(), token: value.token.trim(), expiration: value.expiration.trim() || null }) }
  useKeyboard((key) => {
    if (key.name === 'escape') props.onCancel()
    else if (key.name === 'return' || key.name === 'enter') save()
    else if (key.name === 'tab') setActive((index) => (index + (key.shift ? fields.length - 1 : 1)) % fields.length)
  })
  return <box border borderStyle="rounded" borderColor={theme.accent} paddingX={2} flexDirection="column" flexGrow={1}><text fg={theme.accent} bold>Create New Token</text>{fields.map((field, index) => <box><text width={12} fg={active() === index ? theme.accent : theme.text}>{labels[field]}:</text><input value={data()[field]} onInput={(value) => setData({ ...data(), [field]: value })} focused={active() === index} placeholder={field === 'expiration' ? 'YYYY-MM-DD or empty' : ''} flexGrow={1} /></box>)}</box>
}
export default CreateForm
