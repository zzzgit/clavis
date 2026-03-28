import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import Token from '../models/Token.js'
import ConfigService from './ConfigService.js'
import { encrypt, decrypt } from './CryptoService.js'
import {
	validateKey,
	validateToken,
	validateDate,
	validateTag,
	validateComment,
	validateEnv
} from '../utils/validators.js'

/** Returns the platform-appropriate user data directory for Clavis */
const getDefaultDataDir = () => {
	if (process.platform === 'win32') {
		const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
		return path.join(appData, 'clavis')
	}
	const xdgDataHome = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
	return path.join(xdgDataHome, 'clavis')
}

class TokenStorage {
	constructor(dataDir = getDefaultDataDir()) {
		this.dataDir = path.resolve(dataDir)
		this.dataFile = path.join(this.dataDir, 'tokens.json')
		this.tokens = new Map()
		this.config = new ConfigService()
	}

	async init() {
		await this.config.init()
		try {
			await fs.mkdir(this.dataDir, { recursive: true })
			await this.load()
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error
			}
			await this.save()
		}
	}

	async load() {
		try {
			const data = await fs.readFile(this.dataFile, 'utf8')
			const parsed = JSON.parse(data)

			// Support both new format { sid, tokens } and legacy array format
			const tokensData = Array.isArray(parsed) ? parsed : parsed.tokens

			// Decrypt token fields
			const decrypted = await Promise.all(
				tokensData.map(entry =>
					decrypt(entry.token).then(tokenValue => ({ ...entry, token: tokenValue }))
				)
			)

			this.tokens.clear()
			decrypted.forEach(tokenData => {
				const token = Token.fromJSON(tokenData)
				this.tokens.set(token.key, token)
			})

			// Migrate existing tokens that don't have sid
			await this.migrateSids()
		} catch (error) {
			if (error.code === 'ENOENT') {
				this.tokens.clear()
			} else {
				throw error
			}
		}
	}

	async save() {
		// Encrypt token fields before writing to disk
		const tokensArray = await Promise.all(
			Array.from(this.tokens.values()).map(token =>
				encrypt(token.token).then(encryptedToken => ({
					...token.toJSON(),
					token: encryptedToken
				}))
			)
		)
		const fileData = {
			sid: this.config.peekNextSid(),
			tokens: tokensArray
		}
		const data = JSON.stringify(fileData, null, 2)
		await fs.writeFile(this.dataFile, data, 'utf8')
	}

	async create(tokenData) {
		const validationResults = [
			validateKey(tokenData.key),
			validateToken(tokenData.token),
			validateDate(tokenData.expiration),
			validateTag(tokenData.tag),
			validateComment(tokenData.comment),
			validateEnv(tokenData.env)
		]

		const errors = validationResults
			.filter(result => !result.valid)
			.map(result => result.error)

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`)
		}

		if (this.tokens.has(tokenData.key)) {
			throw new Error(`Token with key "${tokenData.key}" already exists`)
		}

		const sid = await this.config.getNextSid()
		const token = new Token({ ...tokenData, sid })

		this.tokens.set(token.key, token)
		await this.save()
		return token
	}

	async update(key, updates) {
		const token = this.tokens.get(key)
		if (!token) {
			throw new Error(`Token with key "${key}" not found`)
		}

		const updatedData = {
			...token.toJSON(),
			...updates,
			updatedAt: new Date().toISOString()
		}

		const validationResults = [
			updates.key !== undefined ? validateKey(updates.key) : { valid: true },
			updates.token !== undefined ? validateToken(updates.token) : { valid: true },
			updates.expiration !== undefined ? validateDate(updates.expiration) : { valid: true },
			updates.tag !== undefined ? validateTag(updates.tag) : { valid: true },
			updates.comment !== undefined ? validateComment(updates.comment) : { valid: true },
			updates.env !== undefined ? validateEnv(updates.env) : { valid: true }
		]

		const errors = validationResults
			.filter(result => !result.valid)
			.map(result => result.error)

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`)
		}

		const updatedToken = new Token(updatedData)
		this.tokens.set(key, updatedToken)
		await this.save()
		return updatedToken
	}

	async delete(key) {
		if (!this.tokens.has(key)) {
			throw new Error(`Token with key "${key}" not found`)
		}

		this.tokens.delete(key)
		await this.save()
		return true
	}

	get(key) {
		return this.tokens.get(key)
	}

	getAll() {
		return Array.from(this.tokens.values())
	}

	searchByKey(pattern) {
		const tokens = this.getAll()

		if (!pattern || pattern.trim() === '') {
			return tokens
		}

		const searchPattern = pattern.toLowerCase()
		return tokens.filter(token =>
			token.key.toLowerCase().includes(searchPattern) ||
      token.key.toLowerCase().split('.').some(part => part.includes(searchPattern))
		)
	}

	getBySid(sid) {
		const sidNum = Number(sid)
		return Array.from(this.tokens.values()).find(token => token.sid === sidNum) || null
	}

	searchByTag(tag) {
		const tokens = this.getAll()

		if (!tag || tag.trim() === '') {
			return tokens
		}

		const searchTag = tag.toLowerCase()
		return tokens.filter(token =>
			token.tag && token.tag.toLowerCase().includes(searchTag)
		)
	}

	clear() {
		this.tokens.clear()
		return this.save()
	}

	/** Migrate existing tokens that don't have sid */
	async migrateSids() {
		const tokensWithoutSid = Array.from(this.tokens.values()).filter(
			token => token.sid === null || token.sid === undefined
		)

		if (tokensWithoutSid.length === 0) {
			return
		}

		// Get current next_sid value
		let nextSid = this.config.peekNextSid()
		let needsSave = false

		// Assign sids to tokens without them
		for (const token of tokensWithoutSid) {
			token.sid = nextSid
			nextSid++
			needsSave = true
		}

		if (needsSave) {
			// Update config with new next_sid value
			await this.config.setNextSid(nextSid)
			// Save tokens with new sids
			await this.save()
		}
	}
}

export default TokenStorage
