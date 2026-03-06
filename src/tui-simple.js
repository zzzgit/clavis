#!/usr/bin/env node

import { createInterface, emitKeypressEvents } from 'readline'
import TokenStorage from './services/TokenStorage.js'

class SimpleTUI {
	constructor() {
		this.storage = new TokenStorage()
		this.tokens = []
		this.selectedIndex = 0
		this.isEditing = false
		this.filter = ''
		this.terminalWidth = process.stdout.columns || 80

		this.columnWidths = this.calculateColumnWidths()
	}

	calculateColumnWidths() {
		const minWidths = {
			status: 4,
			key: 20,
			tag: 15,
			expires: 12,
			created: 10,
			token: 20
		}

		const totalMinWidth = Object.values(minWidths).reduce((a, b) => a + b, 0)

		if (this.terminalWidth >= totalMinWidth + 20) {
			const extraWidth = this.terminalWidth - totalMinWidth
			return {
				...minWidths,
				key: minWidths.key + Math.floor(extraWidth * 0.6),
				tag: minWidths.tag + Math.floor(extraWidth * 0.2),
				token: minWidths.token + Math.floor(extraWidth * 0.2)
			}
		}

		return minWidths
	}

	truncateKey(key, width) {
		if (!key || key.length <= width) { return key }

		const parts = key.split('.')
		let result = ''

		for (let i = parts.length - 1; i >= 0; i--) {
			const newResult = (i > 0 ? '…' : '') + parts.slice(i).join('.')
			if (newResult.length <= width) {
				result = newResult
			} else {
				break
			}
		}

		return result || key.slice(-width)
	}

	truncateTag(tag, width) {
		if (!tag || tag === '') { return '-'.padEnd(width) }
		if (tag.length <= width) { return tag.padEnd(width) }
		return tag.slice(0, width - 1) + '…'
	}

	formatExpiration(expiration, width = 12) {
		if (!expiration) { return 'Never'.padStart(width) }

		const expDate = new Date(expiration)
		const now = new Date()
		const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))

		if (diffDays < 0) {
			return expDate.toISOString().split('T')[0].padStart(width)
		}

		if (diffDays <= 7) {
			return `${diffDays}d`.padStart(width)
		}

		return expDate.toISOString().split('T')[0].padStart(width)
	}

	formatCreatedAt(createdAt, width = 10) {
		if (!createdAt) { return '-'.padStart(width) }
		return new Date(createdAt).toISOString().split('T')[0].padStart(width)
	}

	previewToken(token, width = 20) {
		if (!token || token.length <= 12) {
			return token.padEnd(width)
		}

		const preview = token.slice(0, 8) + '…' + token.slice(-4)
		return preview.padEnd(width)
	}

	getTokenStatus(token) {
		if (!token.expiration) {
			return { char: '✓', color: '\x1b[32m', label: 'Active' }
		}

		const expDate = new Date(token.expiration)
		const now = new Date()
		const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))

		if (diffDays < 0) {
			return { char: '✗', color: '\x1b[31m', label: 'Expired' }
		}

		if (diffDays <= 7) {
			return { char: '!', color: '\x1b[33m', label: `Expires in ${diffDays}d` }
		}

		return { char: '✓', color: '\x1b[32m', label: 'Active' }
	}

	renderHeader() {
		const { status, key, tag, expires, created, token } = this.columnWidths

		let header = '\x1b[36m' // Cyan
		header += 'Stat'.padEnd(status)
		header += 'Key'.padEnd(key)
		header += 'Tag'.padEnd(tag)
		header += 'Expires'.padEnd(expires)
		header += 'Created'.padEnd(created)
		header += 'Token Preview'.padEnd(token)
		header += '\x1b[0m' // Reset

		return header
	}

	renderToken(token, index) {
		const isSelected = index === this.selectedIndex
		const status = this.getTokenStatus(token)
		const { status: statusWidth, key, tag, expires, created, token: tokenWidth } = this.columnWidths

		let line = ''

		// Status column
		if (isSelected) {
			line += '\x1b[44m' // Blue background
		}
		line += status.color
		line += ` ${status.char} `.padEnd(statusWidth)

		// Key column
		line += isSelected ? '\x1b[37m' : '\x1b[97m' // White/bright white
		line += this.truncateKey(token.key, key).padEnd(key)

		// Tag column
		line += isSelected ? '\x1b[37m' : '\x1b[96m' // White/cyan
		line += this.truncateTag(token.tag, tag)

		// Expires column
		line += isSelected ? '\x1b[37m' : status.color
		line += this.formatExpiration(token.expiration, expires)

		// Created column
		line += isSelected ? '\x1b[37m' : '\x1b[90m' // White/gray
		line += this.formatCreatedAt(token.createdAt, created)

		// Token column
		line += isSelected ? '\x1b[37m' : '\x1b[90m' // White/gray
		line += this.previewToken(token.token, tokenWidth)

		if (isSelected) {
			line += '\x1b[49m' // Reset background
		}
		line += '\x1b[0m' // Reset all

		return line
	}

	renderTable() {
		console.clear()

		// Header
		console.log('\x1b[1mClavis Token Manager v1.0.0\x1b[0m')
		console.log('='.repeat(this.terminalWidth))
		console.log()

		if (this.tokens.length === 0) {
			console.log('\x1b[33mNo tokens found. Press "q" to quit.\x1b[0m')
			console.log()
			return
		}

		// Table header
		console.log(this.renderHeader())
		console.log('-'.repeat(this.terminalWidth))

		// Table rows
		const filteredTokens = this.filter
			? this.tokens.filter(token =>
				token.key.toLowerCase().includes(this.filter.toLowerCase()) ||
          token.tag?.toLowerCase().includes(this.filter.toLowerCase()) ||
          token.comment?.toLowerCase().includes(this.filter.toLowerCase())
			)
			: this.tokens

		filteredTokens.forEach((token, index) => {
			console.log(this.renderToken(token, index))
		})

		console.log()
		console.log('-'.repeat(this.terminalWidth))

		// Footer
		const selectedToken = filteredTokens[this.selectedIndex]
		if (selectedToken) {
			console.log(`Selected: \x1b[36m${selectedToken.key}\x1b[0m`)
		}

		console.log('\x1b[90m[↑↓/jk] Navigate • [e] Edit • [d] Delete • [?] Help • [q] Quit\x1b[0m')
	}

	async init() {
		await this.storage.init()
		this.tokens = this.storage.getAll()
		this.terminalWidth = process.stdout.columns || 80
		this.columnWidths = this.calculateColumnWidths()

		// Set up terminal
		emitKeypressEvents(process.stdin)
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true)
		}

		process.stdout.on('resize', () => {
			this.terminalWidth = process.stdout.columns || 80
			this.columnWidths = this.calculateColumnWidths()
			this.renderTable()
		})

		// Handle keypress
		process.stdin.on('keypress', (str, key) => {
			this.handleKeyPress(str, key)
		})

		this.renderTable()
		process.stdin.resume()
	}

	handleKeyPress(str, key) {
		if (this.isEditing) {
			this.handleEditMode(str, key)
			return
		}

		if (str === 'q' || (key.ctrl && key.name === 'c')) {
			console.log('\nExiting TUI...')
			process.exit(0)
		}

		if (str === '?') {
			this.showHelp()
			return
		}

		if (str === 'e') {
			this.startEdit()
			return
		}

		if (str === 'd') {
			this.deleteToken()
			return
		}

		if (key.upArrow || str === 'k') {
			const filteredTokens = this.getFilteredTokens()
			this.selectedIndex = Math.max(0, this.selectedIndex - 1)
			this.renderTable()
		} else if (key.downArrow || str === 'j') {
			const filteredTokens = this.getFilteredTokens()
			this.selectedIndex = Math.min(filteredTokens.length - 1, this.selectedIndex + 1)
			this.renderTable()
		}
	}

	getFilteredTokens() {
		return this.filter
			? this.tokens.filter(token =>
				token.key.toLowerCase().includes(this.filter.toLowerCase()) ||
          token.tag?.toLowerCase().includes(this.filter.toLowerCase()) ||
          token.comment?.toLowerCase().includes(this.filter.toLowerCase())
			)
			: this.tokens
	}

	showHelp() {
		console.clear()
		console.log('\x1b[1mClavis TUI Help\x1b[0m')
		console.log('='.repeat(this.terminalWidth))
		console.log()
		console.log('\x1b[33mNavigation:\x1b[0m')
		console.log('  ↑ / k      Move selection up')
		console.log('  ↓ / j      Move selection down')
		console.log('  Enter / e  Edit selected token')
		console.log('  d          Delete selected token')
		console.log('  ?          Show/hide this help')
		console.log('  q / Ctrl+C Quit application')
		console.log()
		console.log('\x1b[33mStatus Indicators:\x1b[0m')
		console.log('  \x1b[32m✓\x1b[0m Active token')
		console.log('  \x1b[33m!\x1b[0m Expires within 7 days')
		console.log('  \x1b[31m✗\x1b[0m Expired token')
		console.log()
		console.log('\x1b[90mPress any key to return...\x1b[0m')

		// Wait for any key
		const handler = (str, key) => {
			process.stdin.off('keypress', handler)
			this.renderTable()
		}
		process.stdin.once('keypress', handler)
	}

	startEdit() {
		const filteredTokens = this.getFilteredTokens()
		const selectedToken = filteredTokens[this.selectedIndex]

		if (!selectedToken) { return }

		console.clear()
		console.log(`\x1b[1mEditing Token: ${selectedToken.key}\x1b[0m`)
		console.log('='.repeat(this.terminalWidth))
		console.log()
		console.log('Key cannot be changed (create new token instead)')
		console.log()
		console.log('Press any key to return to table view...')

		// For now, just return to table view
		const handler = (str, key) => {
			process.stdin.off('keypress', handler)
			this.renderTable()
		}
		process.stdin.once('keypress', handler)
	}

	async deleteToken() {
		const filteredTokens = this.getFilteredTokens()
		const selectedToken = filteredTokens[this.selectedIndex]

		if (!selectedToken) { return }

		console.clear()
		console.log(`\x1b[1mDelete Token: ${selectedToken.key}\x1b[0m`)
		console.log('='.repeat(this.terminalWidth))
		console.log()
		console.log('\x1b[31mWARNING: This action cannot be undone!\x1b[0m')
		console.log()
		console.log('Type "DELETE" to confirm, or press any other key to cancel:')

		const readline = createInterface({
			input: process.stdin,
			output: process.stdout
		})

		readline.question('', async (answer) => {
			readline.close()

			if (answer === 'DELETE') {
				try {
					await this.storage.delete(selectedToken.key)
					this.tokens = this.storage.getAll()
					this.selectedIndex = Math.min(this.selectedIndex, this.tokens.length - 1)
					console.log(`\x1b[32m✓ Token "${selectedToken.key}" deleted successfully\x1b[0m`)
				} catch (error) {
					console.log(`\x1b[31m✗ Error: ${error.message}\x1b[0m`)
				}
			} else {
				console.log('\x1b[33mDeletion cancelled\x1b[0m')
			}

			setTimeout(() => {
				this.renderTable()
			}, 1000)
		})
	}

	handleEditMode(str, key) {
		// Edit mode handling would go here
		// For now, just exit edit mode on Escape
		if (key.name === 'escape') {
			this.isEditing = false
			this.renderTable()
		}
	}
}

async function main() {
	const tui = new SimpleTUI()
	await tui.init()
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}

export default main
