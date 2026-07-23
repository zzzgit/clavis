import { theme } from '../theme.js'

const HelpPanel = () => {
  const bindings = [['↑ / k', 'Move selection up'], ['↓ / j', 'Move selection down'], ['Home / g', 'Jump to first token'], ['End / G', 'Jump to last token'], ['c', 'Create new token'], ['e', 'Edit selected token'], ['dd', 'Delete selected token'], ['y / Y', 'Copy token / sid'], ['f', 'Filter tokens'], ['?', 'Close this help'], ['q / Ctrl+C', 'Quit application']]
  return <box border borderStyle="rounded" borderColor={theme.accent} paddingX={2} flexDirection="column" flexGrow={1}><text fg={theme.accent} bold>Clavis TUI Help</text><text fg={theme.text} bold>Navigation</text>{bindings.map(([key, description]) => <box marginLeft={2}><text width={20} fg={theme.warning} bold>{key}</text><text fg={theme.text}>{description}</text></box>)}</box>
}
export default HelpPanel
