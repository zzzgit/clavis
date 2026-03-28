import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { getPassword } from 'cross-keychain'

const KEYCHAIN_SERVICE = 'clavis'
const KEYCHAIN_ACCOUNT = 'master'
const ENC_PREFIX = 'enc:'

let cachedKey = null

/** Derive the 32-byte AES key from the Argon2 hash stored in keychain */
const getAesKey = () => {
	if (cachedKey) return Promise.resolve(cachedKey)

	return getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
		.then(hash => {
			if (!hash) throw new Error('Master password not found in keychain. Run: clavis add pwd')
			const hashOutput = hash.split('$').at(-1)
			const key = Buffer.from(hashOutput, 'base64')
			if (key.length !== 32) throw new Error(`Invalid AES key length: ${key.length}, expected 32`)
			cachedKey = key
			return key
		})
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns "enc:<base64(iv[12] + authTag[16] + ciphertext)>"
 */
const encrypt = (plaintext) =>
	getAesKey().then(key => {
		const iv = randomBytes(12)
		const cipher = createCipheriv('aes-256-gcm', key, iv)
		const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
		const authTag = cipher.getAuthTag()
		const payload = Buffer.concat([iv, authTag, ciphertext])
		return `${ENC_PREFIX}${payload.toString('base64')}`
	})

/**
 * Decrypt a string produced by encrypt().
 * Strings not starting with "enc:" are returned as-is (backward compatibility).
 */
const decrypt = (value) => {
	if (!value || !value.startsWith(ENC_PREFIX)) return Promise.resolve(value)

	return getAesKey().then(key => {
		const payload = Buffer.from(value.slice(ENC_PREFIX.length), 'base64')
		if (payload.length < 28) return Promise.reject(new Error('Corrupted encrypted value: payload too short'))
		const iv = payload.subarray(0, 12)
		const authTag = payload.subarray(12, 28)
		const ciphertext = payload.subarray(28)
		const decipher = createDecipheriv('aes-256-gcm', key, iv)
		decipher.setAuthTag(authTag)
		return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
	})
}

export { encrypt, decrypt }
