import { fuzzyMatch, calculateRelevanceScore, simpleFuzzySearch } from '../../../src/tui/utils/fuzzySearch.js'

describe('Fuzzy Search Utilities', () => {
	describe('fuzzyMatch', () => {
		test('should return true for exact match', () => {
			expect(fuzzyMatch('github', 'github')).toBe(true)
		})

		test('should return true for substring match', () => {
			expect(fuzzyMatch('github-api-token', 'api')).toBe(true)
		})

		test('should return true for fuzzy match', () => {
			expect(fuzzyMatch('github', 'gh')).toBe(true)
			expect(fuzzyMatch('database', 'db')).toBe(true)
			expect(fuzzyMatch('production', 'prod')).toBe(true)
		})

		test('should return false for non-match', () => {
			expect(fuzzyMatch('github', 'xyz')).toBe(false)
		})

		test('should handle empty pattern', () => {
			expect(fuzzyMatch('github', '')).toBe(true)
		})

		test('should handle empty text', () => {
			expect(fuzzyMatch('', 'github')).toBe(false)
		})

		test('should be case insensitive', () => {
			expect(fuzzyMatch('GitHub', 'github')).toBe(true)
			expect(fuzzyMatch('GITHUB', 'github')).toBe(true)
		})
	})

	describe('calculateRelevanceScore', () => {
		test('should give highest score for exact match', () => {
			expect(calculateRelevanceScore('github', 'github')).toBe(100)
		})

		test('should give high score for substring match', () => {
			const score = calculateRelevanceScore('github-api-token', 'api')
			expect(score).toBeGreaterThan(80)
		})

		test('should give score for fuzzy match', () => {
			const score = calculateRelevanceScore('github', 'gh')
			expect(score).toBeGreaterThan(0)
			expect(score).toBeLessThan(100)
		})

		test('should return 0 for non-match', () => {
			expect(calculateRelevanceScore('github', 'xyz')).toBe(0)
		})

		test('should return 100 for empty pattern', () => {
			expect(calculateRelevanceScore('github', '')).toBe(100)
		})

		test('should return 0 for empty text', () => {
			expect(calculateRelevanceScore('', 'github')).toBe(0)
		})
	})

	describe('simpleFuzzySearch', () => {
		const tokens = [
			{ key: 'github.api.token', tag: 'prod', comment: 'GitHub API token for production' },
			{ key: 'database.connection', tag: 'dev', comment: 'Database connection string' },
			{ key: 'aws.s3.access', tag: 'prod', comment: 'AWS S3 access key' },
			{ key: 'slack.webhook', tag: 'dev', comment: 'Slack webhook URL' }
		]

		test('should return all tokens for empty search', () => {
			const result = simpleFuzzySearch(tokens, '')
			expect(result).toHaveLength(4)
		})

		test('should filter by exact key match', () => {
			const result = simpleFuzzySearch(tokens, 'github')
			expect(result).toHaveLength(1)
			expect(result[0].key).toBe('github.api.token')
		})

		test('should filter by fuzzy key match', () => {
			const result = simpleFuzzySearch(tokens, 'gh')
			expect(result).toHaveLength(1)
			expect(result[0].key).toBe('github.api.token')
		})

		test('should filter by tag', () => {
			const result = simpleFuzzySearch(tokens, 'prod')
			expect(result).toHaveLength(2)
			expect(result.map(t => t.key)).toContain('github.api.token')
			expect(result.map(t => t.key)).toContain('aws.s3.access')
		})

		test('should filter by comment', () => {
			const result = simpleFuzzySearch(tokens, 'database')
			expect(result).toHaveLength(1)
			expect(result[0].key).toBe('database.connection')
		})

		test('should filter by fuzzy comment match', () => {
			const result = simpleFuzzySearch(tokens, 'db')
			expect(result).toHaveLength(1)
			expect(result[0].key).toBe('database.connection')
		})

		test('should return empty array for non-match', () => {
			const result = simpleFuzzySearch(tokens, 'xyz123')
			expect(result).toHaveLength(0)
		})

		test('should handle tokens with missing fields', () => {
			const tokensWithMissingFields = [
				{ key: 'test.key' },
				{ key: 'another.key', tag: 'test' }
			]
			const result = simpleFuzzySearch(tokensWithMissingFields, 'test')
			expect(result).toHaveLength(2)
		})
	})
})