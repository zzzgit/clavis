import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import Secret from '../models/Secret.js'
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

class SecretStorage {
	constructor(dataDir = getDefaultDataDir()) {
		this.dataDir = path.resolve(dataDir)
		this.dataFile = path.join(this.dataDir, 'tokens.json')
		this.secrets = new Map()
		this.config = new ConfigService()
	}

	async init() {
		await this.config.init()
		try {
			await fs.mkdir(this.dataDir, { recursive: true, mode: 0o700 })
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

			this.secrets.clear()
			decrypted.forEach(secretData => {
				const secret = Secret.fromJSON(secretData)
				this.secrets.set(secret.key, secret)
			})
		} catch (error) {
			if (error.code === 'ENOENT') {
				this.secrets.clear()
			} else {
				throw error
			}
		}
	}

	async save() {
		// Encrypt token fields before writing to disk
		const tokensArray = await Promise.all(
			Array.from(this.secrets.values()).map(secret =>
				encrypt(secret.token).then(encryptedToken => ({
					...secret.toJSON(),
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

	async create(secretData) {
		const validationResults = [
			validateKey(secretData.key),
			validateToken(secretData.token),
			validateDate(secretData.expiration),
			validateTag(secretData.tag),
			validateComment(secretData.comment),
			validateEnv(secretData.env)
		]

		const errors = validationResults
			.filter(result => !result.valid)
			.map(result => result.error)

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`)
		}

		if (this.secrets.has(secretData.key)) {
			throw new Error(`Secret with key "${secretData.key}" already exists`)
		}

		const sid = await this.config.getNextSid()
		const secret = new Secret({ ...secretData, sid })

		this.secrets.set(secret.key, secret)
		await this.save()
		return secret
	}

	async update(key, updates) {
		const secret = this.secrets.get(key)
		if (!secret) {
			throw new Error(`Secret with key "${key}" not found`)
		}

		const updatedData = {
			...secret.toJSON(),
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

		const newKey = updates.key !== undefined ? updates.key : key
		if (newKey !== key && this.secrets.has(newKey)) {
			throw new Error(`Secret with key "${newKey}" already exists`)
		}

		const updatedSecret = new Secret(updatedData)
		if (newKey !== key) {
			this.secrets.delete(key)
		}
		this.secrets.set(newKey, updatedSecret)
		await this.save()
		return updatedSecret
	}

	async delete(key) {
		if (!this.secrets.has(key)) {
			throw new Error(`Secret with key "${key}" not found`)
		}

		this.secrets.delete(key)
		await this.save()
		return true
	}

	get(key) {
		return this.secrets.get(key)
	}

	getAll() {
		return Array.from(this.secrets.values())
	}

	searchByKey(pattern) {
		const secrets = this.getAll()

		if (!pattern || pattern.trim() === '') {
			return secrets
		}

		const searchPattern = pattern.toLowerCase()
		return secrets.filter(secret =>
			secret.key.toLowerCase().includes(searchPattern) ||
      secret.key.toLowerCase().split('.').some(part => part.includes(searchPattern))
		)
	}

	getBySid(sid) {
		const sidNum = Number(sid)
		return Array.from(this.secrets.values()).find(secret => secret.sid === sidNum) || null
	}

	searchByTag(tag) {
		const secrets = this.getAll()

		if (!tag || tag.trim() === '') {
			return secrets
		}

		const searchTag = tag.toLowerCase()
		return secrets.filter(secret =>
			secret.tag && secret.tag.toLowerCase().includes(searchTag)
		)
	}

	clear() {
		this.secrets.clear()
		return this.save()
	}

}

export default SecretStorage
