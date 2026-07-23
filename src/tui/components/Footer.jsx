import { theme } from '../theme.js'

const Footer = (props) => {
  const status = props.isSelectingEnvVar ? 'Select Env Var' : props.showHelp ? 'Press any key to close help' : props.isCreating ? 'Creating New Token' : props.isEditing ? `Editing: ${props.selectedToken?.key ?? ''}` : `Selected: ${props.selectedToken?.key ?? 'None'}`
  const shortcuts = props.isSelectingEnvVar ? '[↑↓] Navigate  [Enter] Select  [Esc] Cancel' : props.isCreating || props.isEditing ? '[Tab] Next  [Enter] Save  [Esc] Cancel' : 'c:New  e:Edit  dd:Del  y:Yank  Y:SID  f:Find  ?:Help  q:Quit'

  return <box border borderStyle="rounded" borderColor={theme.muted} paddingX={1} height={3} flexDirection="row" justifyContent="space-between">
    <text fg={theme.accent}>{status}</text><text fg={theme.muted}>{shortcuts}</text>
  </box>
}

export default Footer
