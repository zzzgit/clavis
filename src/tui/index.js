#!/usr/bin/env node

import os from 'os'
import React from 'react'
import { render } from 'ink'
import App from './components/App.jsx'
import SecretStorage from '../services/SecretStorage.js'

// ANSI escape codes for alternative buffer
const enterAlternativeBuffer = '\x1b[?1049h'
const exitAlternativeBuffer = '\x1b[?1049l'

// Function to exit alternative buffer and cleanup
function cleanupAndExit(exitCode = 0) {
	try {
		// Exit alternative buffer
		process.stdout.write(exitAlternativeBuffer)
	} catch {
		// Ignore errors during cleanup
	}
	process.exit(exitCode)
}

/** Check that Windows users are on Windows 11 (build 22000+). Exit if not. */
const checkWindowsVersion = () => {
	if (os.platform() !== 'win32') return
	// os.release() returns the NT kernel version, e.g. "10.0.22000"
	const build = parseInt(os.release().split('.')[2], 10)
	if (isNaN(build) || build < 22000) {
		console.error('Error: Clavis requires Windows 11 or later.')
		console.error(`Detected Windows build: ${os.release()}`)
		process.exit(1)
	}
}

async function main() {
	checkWindowsVersion()

	// Check if we're in an interactive terminal
	// Note: process.stdout.isTTY might be undefined in some environments
	// but we should still try to run if possible
	if (process.stdout.isTTY === false) {
		console.error('Error: stdout is not a TTY. This application requires an interactive terminal.')
		console.error('Please run this command directly in a terminal, not through a pipe or redirect.')
		process.exit(1)
	}

	// Setup cleanup handlers
	process.on('SIGTERM', () => cleanupAndExit(0))
	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error.message)
		cleanupAndExit(1)
	})
	process.on('unhandledRejection', (reason) => {
		console.error('Unhandled rejection:', reason)
		cleanupAndExit(1)
	})

	// Enter alternative buffer for TUI application
	process.stdout.write(enterAlternativeBuffer)
	
	// Clear screen and move cursor to home position
	process.stdout.write('\x1b[2J\x1b[H')

	const storage = new SecretStorage()
	await storage.init()

	const secrets = storage.getAll()

	const app = React.createElement(App, { secrets, storage })
	const instance = render(app)
	
	// Handle cleanup
	instance.waitUntilExit().then(() => {
		cleanupAndExit(0)
	}).catch((error) => {
		console.error('Application error:', error.message)
		cleanupAndExit(1)
	})
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export default main
