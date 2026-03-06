#!/usr/bin/env node

import React from 'react'
import { render } from 'ink'
import App from './components/App.jsx'
import TokenStorage from '../services/TokenStorage.js'

async function main() {
	const storage = new TokenStorage()
	await storage.init()

	const tokens = storage.getAll()

	const app = React.createElement(App, { tokens, storage })
	render(app)
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export default main
