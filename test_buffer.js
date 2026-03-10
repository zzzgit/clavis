import { render, Text } from 'ink'
import { setTimeout } from 'timers/promises'

const TestApp = () => {
  return <Text>Testing buffer mode...</Text>
}

console.log('Starting Ink app...')
const instance = render(<TestApp />)

// Wait a bit then exit
setTimeout(2000).then(() => {
  console.log('Exiting...')
  instance.unmount()
})
