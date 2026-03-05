#!/usr/bin/env node

import { program } from 'commander'
import { createInterface, emitKeypressEvents } from 'readline'
import TokenStorage from './services/TokenStorage.js'

const storage = new TokenStorage()

async function init() {
  await storage.init()
}

function formatToken(token) {
  const expired = token.expiration && new Date(token.expiration) < new Date()
  const status = expired ? '✗ EXPIRED' : '✓ ACTIVE'
  
  return `${token.key} ${status}
  Token: ${token.token.substring(0, 20)}...
  Expiration: ${token.expiration || 'Never'}
  Tag: ${token.tag || 'None'}
  Comment: ${token.comment || 'None'}
  Created: ${new Date(token.createdAt).toLocaleDateString()}
  Updated: ${new Date(token.updatedAt).toLocaleDateString()}
  `
}

function formatTokenList(tokens) {
  if (tokens.length === 0) {
    return 'No tokens found'
  }

  return tokens.map(token => {
    const expired = token.expiration && new Date(token.expiration) < new Date()
    const status = expired ? '✗' : '✓'
    return `${status} ${token.key} - ${token.tag || 'No tag'}`
  }).join('\n')
}

program
  .name('clavis')
  .description('API Token Management System')
  .version('1.0.0')

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
      const token = await storage.create({
        key: options.key,
        token: options.token,
        expiration: options.expiration,
        tag: options.tag,
        comment: options.comment
      })
      console.log('✓ Token created successfully')
      console.log(formatToken(token))
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
    let tokens
    
    if (options.search) {
      tokens = storage.searchByKey(options.search)
    } else if (options.tag) {
      tokens = storage.searchByTag(options.tag)
    } else {
      tokens = storage.getAll()
    }
    
    console.log(`Found ${tokens.length} token(s):`)
    console.log(formatTokenList(tokens))
  })

program
  .command('show <key>')
  .description('Show details of a specific token')
  .action(async (key) => {
    await init()
    const token = storage.get(key)
    
    if (!token) {
      console.error(`✗ Token with key "${key}" not found`)
      process.exit(1)
    }
    
    console.log(formatToken(token))
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
    if (options.token) updates.token = options.token
    if (options.expiration !== undefined) updates.expiration = options.expiration
    if (options.tag !== undefined) updates.tag = options.tag
    if (options.comment !== undefined) updates.comment = options.comment
    
    if (Object.keys(updates).length === 0) {
      console.error('No updates specified')
      return
    }
    
    try {
      const token = await storage.update(key, updates)
      console.log('✓ Token updated successfully')
      console.log(formatToken(token))
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
  .description('Start simple TUI interface')
  .action(async () => {
    console.clear()
    console.log('=== Clavis TUI ===')
    console.log('Simple TUI interface - Press "q" to quit')
    console.log('----------------------------------------')
    
    emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
    
    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        console.log('\nExiting TUI...')
        process.exit(0)
      }
    })
    
    console.log('TUI is running. Press "q" to exit.')
    
    process.stdin.resume()
  })

program.parse()