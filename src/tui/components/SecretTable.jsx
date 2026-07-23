import { createMemo } from 'solid-js'
import { useTerminalDimensions } from '@opentui/solid'
import { theme } from '../theme.js'
import { getSecretStatus, truncateKey, truncateTag, formatExpiration, formatCreatedAt, previewToken, calculateColumnWidths } from '../utils/format.js'

const SecretTable = (props) => {
  const dimensions = useTerminalDimensions()
  const widths = createMemo(() => calculateColumnWidths(dimensions().width || 80))
  const visibleRows = createMemo(() => Math.max(5, dimensions().height - 10))
  const startIndex = createMemo(() => Math.max(0, props.selectedIndex - visibleRows() + 1))
  const visibleTokens = createMemo(() => props.tokens.slice(startIndex(), startIndex() + visibleRows()))

  if (props.tokens.length === 0) return <box border borderStyle="rounded" borderColor={theme.muted} padding={2} flexGrow={1} justifyContent="center" alignItems="center"><text fg={theme.warning}>No secrets found. Press 'q' to quit.</text></box>

  const header = () => {
    const width = widths()
    return <box flexDirection="row"><text fg={theme.accent} bold width={width.key}>Key</text><text> </text><text fg={theme.accent} bold width={width.tag}>Tag</text><text> </text><text fg={theme.accent} bold width={width.expires}>Expires</text><text> </text><text fg={theme.accent} bold width={width.created}>Created</text><text> </text><text fg={theme.accent} bold width={width.token}>Token Preview</text></box>
  }
  const row = (secret, index) => {
    const width = widths(); const selected = index === props.selectedIndex; const status = getSecretStatus(secret)
    return <box flexDirection="row" backgroundColor={selected ? theme.focusBackground : undefined}><text fg={selected ? theme.focusText : theme.text} width={width.key}>{truncateKey(secret.key, width.key)}</text><text> </text><text fg={selected ? theme.focusText : theme.accent} width={width.tag}>{truncateTag(secret.tag, width.tag)}</text><text> </text><text fg={selected ? theme.focusText : status.color} width={width.expires}>{formatExpiration(secret.expiration, width.expires)}</text><text> </text><text fg={selected ? theme.focusText : theme.muted} width={width.created}>{formatCreatedAt(secret.createdAt, width.created)}</text><text> </text><text fg={selected ? theme.focusText : theme.muted} width={width.token}>{previewToken(secret.token, width.token)}</text></box>
  }
  return <box flexDirection="column" flexGrow={1} overflow="hidden"><box marginBottom={1}>{header()}</box>{visibleTokens().map((secret, index) => row(secret, startIndex() + index))}<box flexDirection="row" justifyContent="space-between"><text dim>{startIndex() > 0 ? '↑ More above' : ''}</text><text dim>Showing {startIndex() + 1}-{Math.min(startIndex() + visibleTokens().length, props.tokens.length)} of {props.tokens.length}</text><text dim>{startIndex() + visibleTokens().length < props.tokens.length ? '↓ More below' : ''}</text></box></box>
}
export default SecretTable
