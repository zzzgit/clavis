import { createMemo, createSignal } from 'solid-js'
import { useKeyboard, useRenderer, useTerminalDimensions } from '@opentui/solid'
import SecretTable from './SecretTable.jsx'
import EditForm from './EditForm.jsx'
import CreateForm from './CreateForm.jsx'
import HelpPanel from './HelpPanel.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import Warning from './Warning.jsx'
import SearchInput from './SearchInput.jsx'
import { simpleFuzzySearch } from '../utils/fuzzySearch.js'
import { getSecretStatus } from '../utils/format.js'
import { copyToClipboard } from '../utils/clipboard.js'

const App = (props) => {
  const renderer = useRenderer(); const dimensions = useTerminalDimensions()
  const [secrets, setSecrets] = createSignal(props.secrets); const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [mode, setMode] = createSignal('table'); const [filter, setFilter] = createSignal(''); const [warning, setWarning] = createSignal(null)
  const filtered = createMemo(() => simpleFuzzySearch(secrets(), filter(), ['key', 'tag', 'comment']))
  const selected = createMemo(() => filtered()[selectedIndex()])
  const notify = (message, type = 'success', title = 'Success') => setWarning({ message, type, title })
  const reload = () => setSecrets(props.storage.getAll())
  const close = () => renderer.destroy()
  const save = (updates) => props.storage.update(selected().key, updates).then(() => { reload(); setMode('table'); notify('Token updated successfully') }).catch((error) => notify(`Error saving token: ${error.message}`, 'error', 'Error'))
  const create = (data) => props.storage.create(data).then(() => { reload(); setMode('table'); notify('Token created successfully') }).catch((error) => notify(`Error creating token: ${error.message}`, 'error', 'Error'))
  const remove = () => props.storage.delete(selected().key).then(() => { reload(); setSelectedIndex((index) => Math.min(index, Math.max(filtered().length - 2, 0))); setMode('table') }).catch((error) => { setMode('table'); notify(`Error deleting token: ${error.message}`, 'error', 'Error') })
  let lastD = 0
  useKeyboard((key) => {
    if (warning()) return
    if (mode() === 'help') { setMode('table'); return }
    if (mode() !== 'table') return
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) close()
    else if (key.name === '?') queueMicrotask(() => setMode('help'))
    else if (key.name === 'c') queueMicrotask(() => setMode('create'))
    else if (key.name === 'e' && selected()) queueMicrotask(() => setMode('edit'))
    else if ((key.name === 'f' || key.name === '/') ) queueMicrotask(() => setMode('search'))
    else if (key.name === 'up' || key.name === 'k') setSelectedIndex((index) => Math.max(0, index - 1))
    else if (key.name === 'down' || key.name === 'j') setSelectedIndex((index) => Math.min(Math.max(filtered().length - 1, 0), index + 1))
    else if (key.name === 'home' || key.name === 'g') setSelectedIndex(0)
    else if (key.name === 'end' || key.name === 'G') setSelectedIndex(Math.max(filtered().length - 1, 0))
    else if (key.name === 'd' && selected()) { const now = Date.now(); if (now - lastD < 500) setMode('delete'); lastD = now }
    else if (key.name === 'y' && selected()) { const copied = copyToClipboard(selected().token); notify(copied ? `Copied token "${selected().key}" to clipboard` : 'Failed to copy to clipboard', copied ? 'success' : 'error', copied ? 'Copied' : 'Error') }
    else if (key.name === 'Y' && selected()) { const copied = selected().sid != null && copyToClipboard(String(selected().sid)); notify(selected().sid == null ? 'No sid to copy' : copied ? `Copied sid "${selected().sid}" to clipboard` : 'Failed to copy to clipboard', copied ? 'success' : 'error', copied ? 'Copied' : 'Error') }
  })
  const expired = createMemo(() => secrets().filter((secret) => getSecretStatus(secret).label === 'Expired').length)
  const expiring = createMemo(() => secrets().filter((secret) => getSecretStatus(secret).label.startsWith('Expires in')).length)
  const content = () => mode() === 'delete' ? <ConfirmDialog message={`Delete token "${selected()?.key}"? This action cannot be undone.`} onConfirm={remove} onCancel={() => setMode('table')} /> : mode() === 'search' ? <SearchInput initialValue={filter()} onSearch={(value) => { setFilter(value); setSelectedIndex(0) }} onCancel={() => setMode('table')} /> : mode() === 'create' ? <CreateForm onSave={create} onCancel={() => setMode('table')} /> : mode() === 'edit' ? <EditForm token={selected()} onSave={save} onCancel={() => setMode('table')} /> : mode() === 'help' ? <HelpPanel /> : <SecretTable tokens={filtered()} selectedIndex={selectedIndex()} />
  return <box flexDirection="column" height={dimensions().height || 24}><Header tokenCount={secrets().length} expiredCount={expired()} warningCount={expiring()} filter={filter()} /><box flexGrow={1}>{warning() && <box position="absolute" top={0} left={0} width="100%" zIndex={100} backgroundColor="black"><Warning {...warning()} autoClose onClose={() => setWarning(null)} /></box>}<box flexGrow={1} overflow="hidden">{content()}</box></box><Footer selectedToken={selected()} isEditing={mode() === 'edit'} isCreating={mode() === 'create'} showHelp={mode() === 'help'} /></box>
}
export default App
