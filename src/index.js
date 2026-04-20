#!/usr/bin/env node

import { program } from 'commander'
import { createInterface } from 'readline'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import { promises as fs } from 'fs'
import SecretStorage from './services/SecretStorage.js'
import ConfigService from './services/ConfigService.js'
import gistService from './services/gist.js'
import { setPassword, getPassword } from 'cross-keychain'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

/** Read a visible line of input from stdin */
const readLine = (prompt) => new Promise((resolve) => {
	const rl = createInterface({ input: process.stdin, output: process.stdout })
	rl.question(prompt, (answer) => { rl.close(); resolve(answer) })
})

const storage = new SecretStorage()

/** Read a password from stdin, hiding input when running in a TTY */
const readPassword = (prompt) => new Promise((resolve) => {
	process.stdout.write(prompt)

	if (!process.stdin.isTTY) {
		// Non-interactive (piped) — read line directly
		const rl = createInterface({ input: process.stdin })
		rl.once('line', (line) => { rl.close(); resolve(line) })
		return
	}

	// Interactive TTY — hide typed characters
	process.stdin.setRawMode(true)
	process.stdin.setEncoding('utf8')
	let input = ''

	const onData = (ch) => {
		if (ch === '\r' || ch === '\n') {
			process.stdin.removeListener('data', onData)
			process.stdin.setRawMode(false)
			process.stdin.pause()
			process.stdout.write('\n')
			resolve(input)
		} else if (ch === '\u0003') {
			process.stdout.write('\n')
			process.exit(0)
		} else if (ch === '\u007f') {
			if (input.length > 0) { input = input.slice(0, -1) }
		} else {
			input += ch
		}
	}

	process.stdin.resume()
	process.stdin.on('data', onData)
})

async function init() {
	await storage.init()
}

function formatSecret(secret) {
	const expired = secret.expiration && new Date(secret.expiration) < new Date()
	const status = expired ? '✗ EXPIRED' : '✓ ACTIVE'

	return `${secret.key} ${status}
  Token: ${secret.token.substring(0, 20)}...
  Expiration: ${secret.expiration || 'Never'}
  Tag: ${secret.tag || 'None'}
  Comment: ${secret.comment || 'None'}
  Created: ${new Date(secret.createdAt).toLocaleDateString()}
  Updated: ${new Date(secret.updatedAt).toLocaleDateString()}
  `
}

function formatSecretList(secrets) {
	if (secrets.length === 0) {
		return 'No tokens found'
	}

	return secrets.map(secret => {
		const expired = secret.expiration && new Date(secret.expiration) < new Date()
		const status = expired ? '✗' : '✓'
		return `${status} ${secret.key} - ${secret.tag || 'No tag'}`
	}).join('\n')
}

program
	.name('clavis')
	.description('API Token Management System')
	.version(version)

program
	.command('create')
	.description('Create a new API token')
	.requiredOption('-k, --key <key>', 'Token key (e.g., foo.bar.baz)')
	.requiredOption('-t, --token <token>', 'API token value')
	.option('-e, --expiration <date>', 'Expiration date (YYYY-MM-DD)')
	.option('--tag <tag>', 'Tag for categorization')
	.option('-c, --comment <comment>', 'Comment/description')
	.action(async (options) => {
		await init()
		try {
			const secret = await storage.create({
				key: options.key,
				token: options.token,
				expiration: options.expiration,
				tag: options.tag,
				comment: options.comment
			})
			console.log('✓ Token created successfully')
			console.log(formatSecret(secret))
		} catch (error) {
			console.error('✗ Error:', error.message)
			process.exit(1)
		}
	})

program
	.command('list')
	.description('List all tokens or search by key pattern')
	.option('-s, --search <pattern>', 'Search pattern for key')
	.option('--tag <tag>', 'Filter by tag')
	.action(async (options) => {
		await init()
		let secrets

		if (options.search) {
			secrets = storage.searchByKey(options.search)
		} else if (options.tag) {
			secrets = storage.searchByTag(options.tag)
		} else {
			secrets = storage.getAll()
		}

		console.log(`Found ${secrets.length} token(s):`)
		console.log(formatSecretList(secrets))
	})

program
	.command('show <key>')
	.description('Show details of a specific token')
	.action(async (key) => {
		await init()
		const secret = storage.get(key)

		if (!secret) {
			console.error(`✗ Token with key "${key}" not found`)
			process.exit(1)
		}

		console.log(formatSecret(secret))
	})

program
	.command('update <key>')
	.description('Update an existing token')
	.option('-t, --token <token>', 'New API token value')
	.option('-e, --expiration <date>', 'New expiration date (YYYY-MM-DD)')
	.option('--tag <tag>', 'New tag')
	.option('-c, --comment <comment>', 'New comment')
	.action(async (key, options) => {
		await init()

		const updates = {}
		if (options.token) { updates.token = options.token }
		if (options.expiration !== undefined) { updates.expiration = options.expiration }
		if (options.tag !== undefined) { updates.tag = options.tag }
		if (options.comment !== undefined) { updates.comment = options.comment }

		if (Object.keys(updates).length === 0) {
			console.error('No updates specified')
			return
		}

		try {
			const secret = await storage.update(key, updates)
			console.log('✓ Token updated successfully')
			console.log(formatSecret(secret))
		} catch (error) {
			console.error('✗ Error:', error.message)
			process.exit(1)
		}
	})

program
	.command('delete <key>')
	.description('Delete a token')
	.action(async (key) => {
		await init()
		try {
			await storage.delete(key)
			console.log(`✓ Token "${key}" deleted successfully`)
		} catch (error) {
			console.error('✗ Error:', error.message)
			process.exit(1)
		}
	})

program
	.command('clear')
	.description('Clear all tokens (use with caution!)')
	.action(async () => {
		await init()
		console.log('Warning: This will delete ALL tokens')
		console.log('Type "YES" to confirm:')

		const readline = createInterface({
			input: process.stdin,
			output: process.stdout
		})

		readline.question('', async (answer) => {
			if (answer === 'YES') {
				await storage.clear()
				console.log('✓ All tokens cleared')
			} else {
				console.log('Operation cancelled')
			}
			readline.close()
		})
	})

program
	.command('tui')
	.description('Start interactive TUI interface')
	.action(async () => {
		try {
			// Import the React TUI module
			const startTUI = (await import('./tui/index.js')).default
			await startTUI()
		} catch (error) {
			console.error('Failed to start TUI:', error.message)
			console.error('Make sure all dependencies are installed: npm install')
			process.exit(1)
		}
	})

program
	.command('exec')
	.description('Execute a command with a token injected as environment variable')
	.argument('<sid>', 'Token sid')
	.allowExcessArguments(true)
	.action(async (sid) => {
		const dashDashIndex = process.argv.indexOf('--')
		if (dashDashIndex === -1 || dashDashIndex >= process.argv.length - 1) {
			console.error('Usage: clavis exec <sid> -- <command> [args...]')
			process.exit(1)
		}

		const commandArgs = process.argv.slice(dashDashIndex + 1)

		await init()
		const secret = storage.getBySid(sid)

		if (!secret) {
			console.error(`✗ Token with sid "${sid}" not found`)
			process.exit(1)
		}

		if (!secret.env) {
			console.error(`✗ Token "${secret.key}" has no env variable name configured`)
			process.exit(1)
		}

		const env = { ...process.env, [secret.env]: secret.token }

		const child = spawn(commandArgs[0], commandArgs.slice(1), {
			env,
			stdio: 'inherit'
		})

		child.on('error', (error) => {
			console.error(`✗ Failed to execute command: ${error.message}`)
			process.exit(1)
		})

		child.on('exit', (code) => {
			process.exit(code ?? 0)
		})
	})

const KEYCHAIN_SERVICE = 'clavis'

const addCmd = program
	.command('add')
	.description('Add credentials (pwd | gist-token | gist-id — run "clavis add --help")')

addCmd
	.command('pwd')
	.description('Store a password in the OS keychain')
	.argument('[account]', 'Account name / label', 'master')
	.action(async (account) => {
		// If a password already exists, verify it before allowing update
		const existing = await getPassword(KEYCHAIN_SERVICE, account).catch(() => null)
		if (existing) {
			const current = await readPassword(`Current password for "${account}": `)
			if (existing !== current) {
				console.error('✗ Current password is incorrect')
				process.exit(1)
			}
		}

		const password = await readPassword(`New password for "${account}": `)

		if (!password) {
			console.error('✗ Password cannot be empty')
			process.exit(1)
		}

		const confirm = await readPassword(`Confirm new password for "${account}": `)

		if (password !== confirm) {
			console.error('✗ Passwords do not match')
			process.exit(1)
		}

		try {
			await setPassword(KEYCHAIN_SERVICE, account, password)
			console.log(`✓ Password stored in keychain (service: ${KEYCHAIN_SERVICE}, account: ${account})`)
		} catch (error) {
			console.error('✗ Failed to store password:', error.message)
			process.exit(1)
		}
	})

const getCmd = program
	.command('get')
	.description('Retrieve various types of credentials')

getCmd
	.command('pwd')
	.description('Retrieve a password from the OS keychain')
	.argument('[account]', 'Account name / label', 'master')
	.action(async (account) => {
		try {
			const password = await getPassword(KEYCHAIN_SERVICE, account)
			if (password === null || password === undefined) {
				console.error(`✗ No password found for account "${account}" in keychain`)
				process.exit(1)
			}
			console.log(password)
		} catch (error) {
			console.error('✗ Failed to retrieve password:', error.message)
			process.exit(1)
		}
	})

/**
 * Ensure gist_token and gist_id are present in config.
 * Prompts for missing values and auto-creates a gist if needed.
 */
const ensureGistConfig = (config) => {
	const ensureToken = config.getGistToken().then((existing) => {
		if (existing) return existing
		return readPassword('GitHub Personal Access Token: ').then((token) => {
			if (!token) {
				console.error('✗ Token cannot be empty')
				process.exit(1)
			}
			return config.setGistToken(token).then(() => token)
		})
	})

	return ensureToken.then((token) => {
		const existingId = config.getGistId()
		if (existingId) {
			return { token, id: existingId }
		}
		process.stdout.write('No gist ID found — creating a new private gist...\n')
		return gistService.createGist(token, version).then((id) => {
			return config.setGistId(id).then(() => {
				console.log(`✓ Gist created: ${id}`)
				return { token, id }
			})
		})
	})
}

addCmd
	.command('gist-token')
	.description('Set GitHub Personal Access Token for gist sync')
	.action(async () => {
		const config = new ConfigService()
		await config.init()
		const token = await readPassword('GitHub Personal Access Token: ')
		if (!token) {
			console.error('✗ Token cannot be empty')
			process.exit(1)
		}
		await config.setGistToken(token)
		console.log('✓ Gist token saved to OS keychain')
	})

addCmd
	.command('gist-id')
	.description('Set an existing GitHub Gist ID for sync')
	.argument('<id>', 'Gist ID')
	.action(async (id) => {
		const config = new ConfigService()
		await config.init()
		await config.setGistId(id)
		console.log(`✓ Gist ID saved: ${id}`)
	})

program
	.command('upload')
	.description('Upload tokens.json to GitHub Gist')
	.action(async () => {
		const config = new ConfigService()
		await config.init()
		try {
			const { token, id } = await ensureGistConfig(config)
			const storageInstance = new SecretStorage()
			await storageInstance.init()
			const tokensContent = await fs.readFile(storageInstance.dataFile, 'utf8')
			await gistService.upload(token, id, tokensContent, version)
			console.log(`✓ Uploaded tokens.json to gist ${id}`)
		} catch (error) {
			console.error('✗ Upload failed:', error.message)
			process.exit(1)
		}
	})

program
	.command('download')
	.description('Download tokens.json from GitHub Gist and overwrite local file')
	.action(async () => {
		const config = new ConfigService()
		await config.init()
		try {
			const { token, id } = await ensureGistConfig(config)
			const content = await gistService.download(token, id)
			const storageInstance = new SecretStorage()
			await storageInstance.init()
			await fs.writeFile(storageInstance.dataFile, content, 'utf8')
			console.log(`✓ Downloaded tokens.json from gist ${id}`)
		} catch (error) {
			console.error('✗ Download failed:', error.message)
			process.exit(1)
		}
	})

program.addHelpText('after', `
Gist sync sub-commands (via "clavis add"):
  clavis add gist-token          Set GitHub Personal Access Token for gist sync
  clavis add gist-id <id>        Set an existing GitHub Gist ID for sync`)

program.parse()
