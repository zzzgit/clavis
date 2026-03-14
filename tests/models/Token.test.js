import Token from '../../src/models/Token.js'

describe('Token Model', () => {
  describe('constructor', () => {
    test('should create token with required fields', () => {
      const tokenData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      }

      const token = new Token(tokenData)

      expect(token.key).toBe('api.github.com')
      expect(token.token).toBe('ghp_1234567890abcdef')
      expect(token.expiration).toBeNull()
      expect(token.tag).toBe('')
      expect(token.comment).toBe('')
      expect(token.createdAt).toBeDefined()
      expect(token.updatedAt).toBeDefined()
    })

    test('should create token with all fields', () => {
      const tokenData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN'
      }

      const token = new Token(tokenData)

      expect(token.key).toBe('api.github.com')
      expect(token.token).toBe('ghp_1234567890abcdef')
      expect(token.expiration).toBe('2025-12-31')
      expect(token.tag).toBe('github')
      expect(token.comment).toBe('Personal access token')
      expect(token.env).toBe('GITHUB_TOKEN')
    })
  })

  describe('validate', () => {
    test('should validate valid token', () => {
      const token = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      })

      const errors = token.validate()
      expect(errors).toHaveLength(0)
    })

    test('should return error for empty key', () => {
      const token = new Token({
        key: '',
        token: 'ghp_1234567890abcdef'
      })

      const errors = token.validate()
      expect(errors).toContain('Key is required and must be a non-empty string')
    })

    test('should return error for empty token', () => {
      const token = new Token({
        key: 'api.github.com',
        token: ''
      })

      const errors = token.validate()
      expect(errors).toContain('Token is required and must be a non-empty string')
    })

    test('should return error for invalid expiration date', () => {
      const token = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: 'invalid-date'
      })

      const errors = token.validate()
      expect(errors).toContain('Expiration must be a valid date string')
    })

    test('should accept valid expiration date', () => {
      const token = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31'
      })

      const errors = token.validate()
      expect(errors).toHaveLength(0)
    })
  })

  describe('isValidDate', () => {
    test('should return true for valid date string', () => {
      const token = new Token({ key: 'test', token: 'test' })
      expect(token.isValidDate('2025-12-31')).toBe(true)
    })

    test('should return false for invalid date string', () => {
      const token = new Token({ key: 'test', token: 'test' })
      expect(token.isValidDate('invalid-date')).toBe(false)
    })
  })

  describe('toJSON', () => {
    test('should return JSON representation', () => {
      const token = new Token({
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN'
      })

      const json = token.toJSON()

      expect(json).toEqual({
        sid: null,
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef',
        expiration: '2025-12-31',
        tag: 'github',
        comment: 'Personal access token',
        env: 'GITHUB_TOKEN',
        createdAt: token.createdAt,
        updatedAt: token.updatedAt
      })
    })
  })

  describe('fromJSON', () => {
    test('should create token from JSON data', () => {
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

      const token = Token.fromJSON(jsonData)

      expect(token.key).toBe('api.github.com')
      expect(token.token).toBe('ghp_1234567890abcdef')
      expect(token.expiration).toBe('2025-12-31')
      expect(token.tag).toBe('github')
      expect(token.comment).toBe('Personal access token')
      expect(token.env).toBe('GITHUB_TOKEN')
      expect(token.createdAt).toBe('2024-01-01T00:00:00.000Z')
      expect(token.updatedAt).toBe('2024-01-02T00:00:00.000Z')
    })

    test('should handle missing timestamps', () => {
      const jsonData = {
        key: 'api.github.com',
        token: 'ghp_1234567890abcdef'
      }

      const token = Token.fromJSON(jsonData)

      expect(token.key).toBe('api.github.com')
      expect(token.token).toBe('ghp_1234567890abcdef')
      expect(token.createdAt).toBeDefined()
      expect(token.updatedAt).toBeDefined()
    })
  })
})