import { jest } from '@jest/globals'
import SecretStorage from '../../src/services/SecretStorage.js'
import Secret from '../../src/models/Secret.js'

describe('SecretStorage - Logic Tests', () => {
  let storage

  beforeEach(() => {
    storage = new SecretStorage('./test-data')
    // Manually populate secrets for testing logic without file system
    storage.secrets.clear()
    // Prevent any test from triggering real file I/O
    storage.save = jest.fn().mockResolvedValue(undefined)
  })

  describe('get and getAll', () => {
    test('should return undefined for non-existent key', () => {
      const secret = storage.get('nonexistent')
      expect(secret).toBeUndefined()
    })

    test('should get all secrets', () => {
      const secret1 = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      const secret2 = new Secret({
        key: 'api.openai.com',
        token: 'sk-1234567890abcdef',
        expiration: null,
        tag: 'openai',
        comment: 'API key for GPT'
      })

      storage.secrets.set(secret1.key, secret1)
      storage.secrets.set(secret2.key, secret2)

      const secrets = storage.getAll()
      expect(secrets).toHaveLength(2)
      expect(secrets[0].key).toBe('api.github.com')
      expect(secrets[1].key).toBe('api.openai.com')
    })
  })

  describe('search', () => {
    let secret1, secret2, secret3

    beforeEach(() => {
      secret1 = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      secret2 = new Secret({
        key: 'api.openai.com',
        token: 'sk-1234567890abcdef',
        expiration: null,
        tag: 'openai',
        comment: 'API key for GPT'
      })
      secret3 = new Secret({
        key: 'internal.api.service',
        token: 'internal_token_123456',
        expiration: null,
        tag: 'internal',
        comment: 'Internal service'
      })

      storage.secrets.set(secret1.key, secret1)
      storage.secrets.set(secret2.key, secret2)
      storage.secrets.set(secret3.key, secret3)
    })

    test('should search by key pattern', () => {
      const results = storage.searchByKey('github')
      expect(results).toHaveLength(1)
      expect(results[0].key).toBe('api.github.com')
    })

    test('should search by key part', () => {
      const results = storage.searchByKey('api')
      expect(results).toHaveLength(3) // api.github.com, api.openai.com, internal.api.service
    })

    test('should return all secrets for empty pattern', () => {
      const results = storage.searchByKey('')
      expect(results).toHaveLength(3)
    })

    test('should search by tag', () => {
      const results = storage.searchByTag('github')
      expect(results).toHaveLength(1)
      expect(results[0].tag).toBe('github')
    })

    test('should return all secrets for empty tag', () => {
      const results = storage.searchByTag('')
      expect(results).toHaveLength(3)
    })

    test('should return empty array for non-matching tag', () => {
      const results = storage.searchByTag('nonexistent')
      expect(results).toHaveLength(0)
    })

    test('should handle secrets without tags', () => {
      const secretWithoutTag = new Secret({
        key: 'no.tag.service',
        token: 'token_without_tag',
        expiration: null,
        tag: '',
        comment: 'No tag'
      })
      storage.secrets.set(secretWithoutTag.key, secretWithoutTag)

      const results = storage.searchByTag('')
      expect(results).toHaveLength(4)
    })
  })

  describe('clear', () => {
    test('should clear all secrets', () => {
      const secret1 = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      storage.secrets.set(secret1.key, secret1)

      expect(storage.getAll()).toHaveLength(1)

      storage.clear()

      expect(storage.getAll()).toHaveLength(0)
    })
  })

  describe('update', () => {
    let secretA, secretB

    beforeEach(() => {
      secretA = new Secret({
        key: 'api.github.com',
        token: 'ghp_original',
        expiration: null,
        tag: 'github',
        comment: 'Original'
      })
      secretB = new Secret({
        key: 'api.openai.com',
        token: 'sk-original',
        expiration: null,
        tag: 'openai',
        comment: 'OpenAI'
      })
      storage.secrets.set(secretA.key, secretA)
      storage.secrets.set(secretB.key, secretB)
    })

    test('update with same key updates the token value in place', async () => {
      const updated = await storage.update('api.github.com', { token: 'ghp_updated' })
      expect(updated.token).toBe('ghp_updated')
      expect(storage.get('api.github.com').token).toBe('ghp_updated')
      expect(storage.getAll()).toHaveLength(2)
    })

    test('update with new key renames the entry (old key removed, new key present)', async () => {
      await storage.update('api.github.com', { key: 'api.github.com.v2' })
      expect(storage.get('api.github.com')).toBeUndefined()
      expect(storage.get('api.github.com.v2')).toBeDefined()
      expect(storage.get('api.github.com.v2').key).toBe('api.github.com.v2')
      expect(storage.getAll()).toHaveLength(2)
    })

    test('update with duplicate new key throws a conflict error', async () => {
      await expect(
        storage.update('api.github.com', { key: 'api.openai.com' })
      ).rejects.toThrow()
    })
  })

  describe('validation integration', () => {
    let secret1

    beforeEach(() => {
      secret1 = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      storage.secrets.set(secret1.key, secret1)
    })

    test('should search by key pattern case-insensitive', () => {
      const results = storage.searchByKey('GITHUB')
      expect(results).toHaveLength(1)
    })

    test('should search by full key with dots', () => {
      const results = storage.searchByKey('api.github.com')
      expect(results).toHaveLength(1)
    })

    test('should search by partial key with dots', () => {
      const results = storage.searchByKey('github.com')
      expect(results).toHaveLength(1)
    })
  })
})
