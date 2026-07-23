#!/usr/bin/env node

import os from 'os'
import { render } from '@opentui/solid'
import App from './components/App.jsx'
import SecretStorage from '../services/SecretStorage.js'

/** Check that Windows users are on Windows 11 (build 22000+). */
const checkWindowsVersion = () => {
  if (os.platform() !== 'win32') return
  const build = parseInt(os.release().split('.')[2], 10)
  if (Number.isNaN(build) || build < 22000) throw new Error(`Clavis requires Windows 11 or later. Detected Windows build: ${os.release()}`)
}

const main = () => {
  checkWindowsVersion()
  if (process.stdout.isTTY === false) throw new Error('stdout is not a TTY. This application requires an interactive terminal.')
  const storage = new SecretStorage()
  return storage.init().then(() => render(() => <App secrets={storage.getAll()} storage={storage} />))
}

export default main
