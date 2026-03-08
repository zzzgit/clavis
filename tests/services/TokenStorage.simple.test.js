import TokenStorage from '../../src/services/TokenStorage.js'
import Token from '../../src/models/Token.js'

describe('TokenStorage - Logic Tests', () => {
  let storage

  beforeEach(() => {
    storage = new TokenStorage('./test-data')
    // Manually populate tokens for testing logic without file system
    storage.tokens.clear()
  })

  describe('get and getAll', () => {
    test('should return undefined for non-existent key', () => {
      const token = storage.get('nonexistent')
      expect(token).toBeUndefined()
    })

    test('should get all tokens', () => {
      // Add tokens manually
      const token1 = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      const token2 = new Token({
        key: 'api.openai.com',
        token: 'sk-1234567890abcdef',
        expiration: null,
        tag: 'openai',
        comment: 'API key for GPT'
      })

      storage.tokens.set(token1.key, token1)
      storage.tokens.set(token2.key, token2)

      const tokens = storage.getAll()
      expect(tokens).toHaveLength(2)
      expect(tokens[0].key).toBe('api.github.com')
      expect(tokens[1].key).toBe('api.openai.com')
    })
  })

  describe('search', () => {
    let token1, token2, token3

    beforeEach(() => {
      // Create test tokens
      token1 = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      token2 = new Token({
        key: 'api.openai.com',
        token: 'sk-1234567890abcdef',
        expiration: null,
        tag: 'openai',
        comment: 'API key for GPT'
      })
      token3 = new Token({
        key: 'internal.api.service',
        token: 'internal_token_123456',
        expiration: null,
        tag: 'internal',
        comment: 'Internal service'
      })

      storage.tokens.set(token1.key, token1)
      storage.tokens.set(token2.key, token2)
      storage.tokens.set(token3.key, token3)
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

    test('should return all tokens for empty pattern', () => {
      const results = storage.searchByKey('')
      expect(results).toHaveLength(3)
    })

    test('should search by tag', () => {
      const results = storage.searchByTag('github')
      expect(results).toHaveLength(1)
      expect(results[0].tag).toBe('github')
    })

    test('should return all tokens for empty tag', () => {
      const results = storage.searchByTag('')
      expect(results).toHaveLength(3)
    })

    test('should return empty array for non-matching tag', () => {
      const results = storage.searchByTag('nonexistent')
      expect(results).toHaveLength(0)
    })

    test('should handle tokens without tags', () => {
      const tokenWithoutTag = new Token({
        key: 'no.tag.service',
        token: 'token_without_tag',
        expiration: null,
        tag: '',
        comment: 'No tag'
      })
      storage.tokens.set(tokenWithoutTag.key, tokenWithoutTag)

      const results = storage.searchByTag('')
      expect(results).toHaveLength(4)
    })
  })

  describe('clear', () => {
    test('should clear all tokens', () => {
      // Add some tokens
      const token1 = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      storage.tokens.set(token1.key, token1)

      expect(storage.getAll()).toHaveLength(1)

      storage.clear()

      expect(storage.getAll()).toHaveLength(0)
    })
  })

  describe('validation integration', () => {
    let token1

    beforeEach(() => {
      token1 = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token'
      })
      storage.tokens.set(token1.key, token1)
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