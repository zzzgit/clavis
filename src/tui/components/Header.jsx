import { theme } from '../theme.js'

const Header = (props) => (
  <box border borderStyle="rounded" borderColor={theme.accent} paddingX={1} height={3} flexDirection="column">
    <box flexDirection="row" justifyContent="space-between">
      <text fg={theme.accent} bold>Clavis Token Manager v1.0.0</text>
      <text fg={theme.text}>
        {props.filter ? <span fg={theme.warning}>Filter: {props.filter}</span> : <>
          {props.tokenCount} tokens
          {props.expiredCount > 0 && <span fg={theme.danger}> ({props.expiredCount} expired)</span>}
          {props.warningCount > 0 && <span fg={theme.warning}>, {props.warningCount} expiring</span>}
        </>}
      </text>
    </box>
  </box>
)

export default Header
