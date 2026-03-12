import {
  validateKey,
  validateToken,
  validateDate,
  validateTag,
  validateComment,
  validateEnv
} from '../../src/utils/validators.js'

describe('Validators', () => {
  describe('validateKey', () => {
    test('should validate valid key', () => {
      const result = validateKey('api.github.com')
      expect(result.valid).toBe(true)
    })

    test('should reject empty key', () => {
      const result = validateKey('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key must be a string')
    })

    test('should reject key with only spaces', () => {
      const result = validateKey('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key cannot be empty')
    })

    test('should reject key with consecutive dots', () => {
      const result = validateKey('api..github.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key cannot contain consecutive dots')
    })

    test('should reject key starting with dot', () => {
      const result = validateKey('.github.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key cannot start or end with a dot')
    })

    test('should reject key ending with dot', () => {
      const result = validateKey('github.com.')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key cannot start or end with a dot')
    })

    test('should reject key with empty parts', () => {
      const result = validateKey('api..github')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Key cannot contain consecutive dots')
    })

    test('should reject key with invalid characters', () => {
      const result = validateKey('api.github@com')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('contains invalid characters')
    })

    test('should accept key with underscores and hyphens', () => {
      const result = validateKey('api_github-com.test_key')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateToken', () => {
    test('should validate valid token', () => {
      const result = validateToken('ghp_1234567890abcdef')
      expect(result.valid).toBe(true)
    })

    test('should reject empty token', () => {
      const result = validateToken('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token must be a string')
    })

    test('should reject token with only spaces', () => {
      const result = validateToken('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token cannot be empty')
    })

    test('should reject token shorter than 8 characters', () => {
      const result = validateToken('1234567')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token must be at least 8 characters long')
    })

    test('should accept token with exactly 8 characters', () => {
      const result = validateToken('12345678')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateDate', () => {
    test('should accept empty date', () => {
      const result = validateDate()
      expect(result.valid).toBe(true)
    })

    test('should accept null date', () => {
      const result = validateDate(null)
      expect(result.valid).toBe(true)
    })

    test('should accept valid date string', () => {
      const result = validateDate('2025-12-31')
      expect(result.valid).toBe(true)
    })

    test('should reject invalid date string', () => {
      const result = validateDate('invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid date format. Use YYYY-MM-DD')
    })

    test('should accept date with time', () => {
      const result = validateDate('2025-12-31T23:59:59.999Z')
      expect(result.valid).toBe(true)
    })
  })

  describe('validateTag', () => {
    test('should accept empty tag', () => {
      const result = validateTag()
      expect(result.valid).toBe(true)
    })

    test('should accept null tag', () => {
      const result = validateTag(null)
      expect(result.valid).toBe(true)
    })

    test('should accept valid tag', () => {
      const result = validateTag('github')
      expect(result.valid).toBe(true)
    })

    test('should reject non-string tag', () => {
      const result = validateTag(123)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Tag must be a string')
    })

    test('should reject tag longer than 50 characters', () => {
      const longTag = 'a'.repeat(51)
      const result = validateTag(longTag)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Tag cannot exceed 50 characters')
    })

    test('should accept tag with exactly 50 characters', () => {
      const tag = 'a'.repeat(50)
      const result = validateTag(tag)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateComment', () => {
    test('should accept empty comment', () => {
      const result = validateComment()
      expect(result.valid).toBe(true)
    })

    test('should accept null comment', () => {
      const result = validateComment(null)
      expect(result.valid).toBe(true)
    })

    test('should accept valid comment', () => {
      const result = validateComment('Personal access token for GitHub API')
      expect(result.valid).toBe(true)
    })

    test('should reject non-string comment', () => {
      const result = validateComment(123)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Comment must be a string')
    })

    test('should reject comment longer than 500 characters', () => {
      const longComment = 'a'.repeat(501)
      const result = validateComment(longComment)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Comment cannot exceed 500 characters')
    })

    test('should accept comment with exactly 500 characters', () => {
      const comment = 'a'.repeat(500)
      const result = validateComment(comment)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateEnv', () => {
    test('should accept empty env', () => {
      const result = validateEnv()
      expect(result.valid).toBe(true)
    })

    test('should accept null env', () => {
      const result = validateEnv(null)
      expect(result.valid).toBe(true)
    })

    test('should accept valid env variable name', () => {
      const result = validateEnv('GITHUB_TOKEN')
      expect(result.valid).toBe(true)
    })

    test('should accept env variable with underscores', () => {
      const result = validateEnv('API_KEY_SECRET')
      expect(result.valid).toBe(true)
    })

    test('should accept env variable starting with underscore', () => {
      const result = validateEnv('_PRIVATE_KEY')
      expect(result.valid).toBe(true)
    })

    test('should accept env variable with numbers', () => {
      const result = validateEnv('API_KEY_123')
      expect(result.valid).toBe(true)
    })

    test('should reject non-string env', () => {
      const result = validateEnv(123)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Env must be a string')
    })

    test('should reject env longer than 100 characters', () => {
      const longEnv = 'A'.repeat(101)
      const result = validateEnv(longEnv)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Env cannot exceed 100 characters')
    })

    test('should accept env with exactly 100 characters', () => {
      const env = 'A'.repeat(100)
      const result = validateEnv(env)
      expect(result.valid).toBe(true)
    })

    test('should reject env with lowercase letters', () => {
      const result = validateEnv('github_token')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Env must contain only uppercase letters, numbers, and underscores, and start with a letter or underscore')
    })

    test('should reject env with special characters', () => {
      const result = validateEnv('API-KEY')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Env must contain only uppercase letters, numbers, and underscores, and start with a letter or underscore')
    })

    test('should reject env starting with number', () => {
      const result = validateEnv('1API_KEY')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Env must contain only uppercase letters, numbers, and underscores, and start with a letter or underscore')
    })
  })
})