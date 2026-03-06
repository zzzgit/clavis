import { promises as fs } from 'fs'
import path from 'path'
import Token from '../models/Token.js'
import {
	validateKey,
	validateToken,
	validateDate,
	validateTag,
	validateComment
} from '../utils/validators.js'

class TokenStorage {
	constructor(dataDir = './data') {
		this.dataDir = path.resolve(dataDir)
		this.dataFile = path.join(this.dataDir, 'tokens.json')
		this.tokens = new Map()
	}

	async init() {
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
			const tokensData = JSON.parse(data)

			this.tokens.clear()
			tokensData.forEach(tokenData => {
				const token = Token.fromJSON(tokenData)
				this.tokens.set(token.key, token)
			})
		} catch (error) {
			if (error.code === 'ENOENT') {
				this.tokens.clear()
			} else {
				throw error
			}
		}
	}

	async save() {
		const tokensArray = Array.from(this.tokens.values()).map(token => token.toJSON())
		const data = JSON.stringify(tokensArray, null, 2)
		await fs.writeFile(this.dataFile, data, 'utf8')
	}

	async create(tokenData) {
		const validationResults = [
			validateKey(tokenData.key),
			validateToken(tokenData.token),
			validateDate(tokenData.expiration),
			validateTag(tokenData.tag),
			validateComment(tokenData.comment)
		]

		const errors = validationResults
			.filter(result => !result.valid)
			.map(result => result.error)

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`)
		}

		const token = new Token(tokenData)

		if (this.tokens.has(token.key)) {
			throw new Error(`Token with key "${token.key}" already exists`)
		}

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
			updates.comment !== undefined ? validateComment(updates.comment) : { valid: true }
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
}

export default TokenStorage
