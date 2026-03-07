#!/usr/bin/env node

import React from 'react'
import { render } from 'ink'
import App from './components/App.jsx'
import TokenStorage from '../services/TokenStorage.js'

async function main() {
	// Check if we're in an interactive terminal
	// Note: process.stdout.isTTY might be undefined in some environments
	// but we should still try to run if possible
	if (process.stdout.isTTY === false) {
		console.error('Error: stdout is not a TTY. This application requires an interactive terminal.')
		console.error('Please run this command directly in a terminal, not through a pipe or redirect.')
		process.exit(1)
	}

	const storage = new TokenStorage()
	await storage.init()

	const tokens = storage.getAll()

	const app = React.createElement(App, { tokens, storage })
	const instance = render(app)
	
	// Handle cleanup
	instance.waitUntilExit().then(() => {
		process.exit(0)
	}).catch((error) => {
		console.error('Application error:', error.message)
		process.exit(1)
	})
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export default main
