#!/usr/bin/env node

import React from 'react'
import { render } from 'ink'
import App from './components/App.jsx'
import TokenStorage from '../services/TokenStorage.js'

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

async function main() {
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

	const storage = new TokenStorage()
	await storage.init()

	const tokens = storage.getAll()

	const app = React.createElement(App, { tokens, storage })
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
