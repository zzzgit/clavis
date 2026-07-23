import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const runner = fileURLToPath(new URL('./tui-smoke-runner.jsx', import.meta.url))

const runSmokeTest = () => new Promise((resolve, reject) => {
  const child = spawn('bun', [runner], { cwd: process.cwd(), stdio: 'pipe' })
  let output = ''

  child.stdout.on('data', (data) => { output += data })
  child.stderr.on('data', (data) => { output += data })
  child.on('error', reject)
  child.on('close', (code) => {
    if (code === 0) resolve()
    else reject(new Error(`TUI smoke test failed with exit code ${code}:\n${output}`))
  })
})

describe('TUI smoke test', () => {
  test('mounts and handles create, escape, and quit shortcuts', () => runSmokeTest())
})
