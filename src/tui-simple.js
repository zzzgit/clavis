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

		// Start with selection background if selected
		if (isSelected) {
			line += '\x1b[44m\x1b[37m' // Blue background, white text
		}

		// Status column
		line += status.color
		line += ` ${status.char} `.padEnd(statusWidth)

		// Key column
		if (!isSelected) { line += '\x1b[97m' } // Bright white for key
		line += this.truncateKey(token.key, key).padEnd(key)

		// Tag column
		if (!isSelected) { line += '\x1b[96m' } // Cyan for tag
		line += this.truncateTag(token.tag, tag)

		// Expires column
		if (!isSelected) { line += status.color }
		line += this.formatExpiration(token.expiration, expires)

		// Created column
		if (!isSelected) { line += '\x1b[90m' } // Gray for created
		line += this.formatCreatedAt(token.createdAt, created)

		// Token column
		if (!isSelected) { line += '\x1b[90m' } // Gray for token
		line += this.previewToken(token.token, tokenWidth)

		// Reset all styles
		line += '\x1b[0m'

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

		console.log('\x1b[90m[↑↓/jk] Navigate • [n] New • [e] Edit • [d] Delete • [?] Help • [q] Quit\x1b[0m')
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
			this.editToken()
			return
		}

		if (str === 'd') {
			this.deleteToken()
			return
		}

		if (str === 'n') {
			this.createToken()
			return
		}

		if (key.upArrow || str === 'k') {
			const _filteredTokens = this.getFilteredTokens()
			const newIndex = Math.max(0, this.selectedIndex - 1)
			if (newIndex !== this.selectedIndex) {
				this.selectedIndex = newIndex
				this.renderTable()
			}
		} else if (key.downArrow || str === 'j') {
			const _filteredTokens = this.getFilteredTokens()
			const newIndex = Math.min(_filteredTokens.length - 1, this.selectedIndex + 1)
			if (newIndex !== this.selectedIndex) {
				this.selectedIndex = newIndex
				this.renderTable()
			}
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
		console.log('  n          Create new token')
		console.log('  e          Edit selected token')
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
		const handler = (_str, _key) => {
			process.stdin.off('keypress', handler)
			this.renderTable()
		}
		process.stdin.once('keypress', handler)
	}

	async editToken() {
		const filteredTokens = this.getFilteredTokens()
		const selectedToken = filteredTokens[this.selectedIndex]

		if (!selectedToken) { return }

		console.clear()
		console.log(`\x1b[1mEditing Token: ${selectedToken.key}\x1b[0m`)
		console.log('='.repeat(this.terminalWidth))
		console.log()
		console.log('\x1b[33mKey cannot be changed (create new token instead)\x1b[0m')
		console.log('Press Enter to keep current value')
		console.log()

		const readline = createInterface({
			input: process.stdin,
			output: process.stdout
		})

		const askQuestion = (question, defaultValue = '') => new Promise((resolve) => {
			readline.question(question, (answer) => {
				resolve(answer.trim() || defaultValue)
			})
		})

		try {
			console.log('\x1b[33mCurrent values:\x1b[0m')
			console.log(`Token: ${selectedToken.token.slice(0, 8)}...${selectedToken.token.slice(-4)}`)
			console.log(`Expiration: ${selectedToken.expiration || 'Never'}`)
			console.log(`Tag: ${selectedToken.tag || '(none)'}`)
			console.log(`Comment: ${selectedToken.comment || '(none)'}`)
			console.log()

			console.log('\x1b[33mEnter new values:\x1b[0m')
			const token = await askQuestion(`Token [${selectedToken.token.slice(0, 8)}...${selectedToken.token.slice(-4)}]: `, selectedToken.token)
			const expiration = await askQuestion(`Expiration (YYYY-MM-DD) [${selectedToken.expiration || 'Never'}]: `, selectedToken.expiration || '')
			const tag = await askQuestion(`Tag [${selectedToken.tag || ''}]: `, selectedToken.tag)
			const comment = await askQuestion(`Comment [${selectedToken.comment || ''}]: `, selectedToken.comment)

			const updates = {}
			if (token !== selectedToken.token) { updates.token = token }
			if (expiration !== (selectedToken.expiration || '')) { updates.expiration = expiration || null }
			if (tag !== selectedToken.tag) { updates.tag = tag }
			if (comment !== selectedToken.comment) { updates.comment = comment }

			if (Object.keys(updates).length > 0) {
				const updatedToken = await this.storage.update(selectedToken.key, updates)
				this.tokens = this.storage.getAll()
				console.log()
				console.log(`\x1b[32m✓ Token "${updatedToken.key}" updated successfully\x1b[0m`)
			} else {
				console.log()
				console.log('\x1b[33mNo changes made\x1b[0m')
			}
		} catch (error) {
			console.log()
			console.log(`\x1b[31m✗ Error: ${error.message}\x1b[0m`)
			console.log('\x1b[33mPress any key to try again...\x1b[0m')
			
			// Wait for key press and retry
			const handler = (_str, _key) => {
				process.stdin.off('keypress', handler)
				readline.close()
				this.editToken()
			}
			process.stdin.once('keypress', handler)
			return
		} finally {
			readline.close()
			setTimeout(() => {
				this.renderTable()
			}, 1500)
		}
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

	async createToken() {
		console.clear()
		console.log('\x1b[1mCreate New Token\x1b[0m')
		console.log('='.repeat(this.terminalWidth))
		console.log()

		const readline = createInterface({
			input: process.stdin,
			output: process.stdout
		})

		const askQuestion = (question, defaultValue = '') => new Promise((resolve) => {
			readline.question(question, (answer) => {
				resolve(answer.trim() || defaultValue)
			})
		})

		try {
			console.log('\x1b[33mRequired fields:\x1b[0m')
			const key = await askQuestion('Key (e.g., "api.github.com"): ')
			const token = await askQuestion('Token: ')

			console.log()
			console.log('\x1b[33mOptional fields (press Enter to skip):\x1b[0m')
			const expiration = await askQuestion('Expiration date (YYYY-MM-DD): ', '')
			const tag = await askQuestion('Tag: ', '')
			const comment = await askQuestion('Comment: ', '')

			const tokenData = {
				key,
				token,
				expiration: expiration || null,
				tag,
				comment
			}

			const newToken = await this.storage.create(tokenData)
			this.tokens = this.storage.getAll()
			
			console.log()
			console.log(`\x1b[32m✓ Token "${newToken.key}" created successfully\x1b[0m`)
		} catch (error) {
			console.log()
			console.log(`\x1b[31m✗ Error: ${error.message}\x1b[0m`)
			console.log('\x1b[33mPress any key to try again...\x1b[0m')
			
			// Wait for key press and retry
			const handler = (_str, _key) => {
				process.stdin.off('keypress', handler)
				readline.close()
				this.createToken()
			}
			process.stdin.once('keypress', handler)
			return
		} finally {
			readline.close()
			setTimeout(() => {
				this.renderTable()
			}, 1500)
		}
	}

	handleEditMode(_str, key) {
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
