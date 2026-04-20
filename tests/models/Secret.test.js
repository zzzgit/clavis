import Secret from '../../src/models/Secret.js'

describe('Secret Model', () => {
  describe('constructor', () => {
    test('should create secret with required fields', () => {
      const secretData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      }

      const secret = new Secret(secretData)

      expect(secret.key).toBe('api.github.com')
      expect(secret.token).toBe('ghp_1234567890abcdef')
      expect(secret.expiration).toBeNull()
      expect(secret.tag).toBe('')
      expect(secret.comment).toBe('')
      expect(secret.createdAt).toBeDefined()
      expect(secret.updatedAt).toBeDefined()
    })

    test('should create secret with all fields', () => {
      const secretData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN'
      }

      const secret = new Secret(secretData)

      expect(secret.key).toBe('api.github.com')
      expect(secret.token).toBe('ghp_1234567890abcdef')
      expect(secret.expiration).toBe('2025-12-31')
      expect(secret.tag).toBe('github')
      expect(secret.comment).toBe('Personal access token')
      expect(secret.env).toBe('GITHUB_TOKEN')
    })
  })

  describe('validate', () => {
    test('should validate valid secret', () => {
      const secret = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      })

      const errors = secret.validate()
      expect(errors).toHaveLength(0)
    })

    test('should return error for empty key', () => {
      const secret = new Secret({
        key: '',
        token: 'ghp_1234567890abcdef'
      })

      const errors = secret.validate()
      expect(errors).toContain('Key is required and must be a non-empty string')
    })

    test('should return error for empty token', () => {
      const secret = new Secret({
        key: 'api.github.com',
        token: ''
      })

      const errors = secret.validate()
      expect(errors).toContain('Token is required and must be a non-empty string')
    })

    test('should return error for invalid expiration date', () => {
      const secret = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: 'invalid-date'
      })

      const errors = secret.validate()
      expect(errors).toContain('Expiration must be a valid date string')
    })

    test('should accept valid expiration date', () => {
      const secret = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31'
      })

      const errors = secret.validate()
      expect(errors).toHaveLength(0)
    })
  })

  describe('isValidDate', () => {
    test('should return true for valid date string', () => {
      const secret = new Secret({ key: 'test', token: 'test' })
      expect(secret.isValidDate('2025-12-31')).toBe(true)
    })

    test('should return false for invalid date string', () => {
      const secret = new Secret({ key: 'test', token: 'test' })
      expect(secret.isValidDate('invalid-date')).toBe(false)
    })
  })

  describe('toJSON', () => {
    test('should return JSON representation', () => {
      const secret = new Secret({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN'
      })

      const json = secret.toJSON()

      expect(json).toEqual({
        sid: null,
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN',
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt
      })
    })
  })

  describe('fromJSON', () => {
    test('should create secret from JSON data', () => {
      const jsonData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }

      const secret = Secret.fromJSON(jsonData)

      expect(secret.key).toBe('api.github.com')
      expect(secret.token).toBe('ghp_1234567890abcdef')
      expect(secret.expiration).toBe('2025-12-31')
      expect(secret.tag).toBe('github')
      expect(secret.comment).toBe('Personal access token')
      expect(secret.env).toBe('GITHUB_TOKEN')
      expect(secret.createdAt).toBe('2024-01-01T00:00:00.000Z')
      expect(secret.updatedAt).toBe('2024-01-02T00:00:00.000Z')
    })

    test('should handle missing timestamps', () => {
      const jsonData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      }

      const secret = Secret.fromJSON(jsonData)

      expect(secret.key).toBe('api.github.com')
      expect(secret.token).toBe('ghp_1234567890abcdef')
      expect(secret.createdAt).toBeDefined()
      expect(secret.updatedAt).toBeDefined()
    })
  })
})
