/**
 * Fuzzy search implementation for token search
 * Supports partial matches and character skipping
 */

/**
 * Check if a string contains another string with fuzzy matching
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {boolean} - True if pattern matches text with fuzzy logic
 */
export const fuzzyMatch = (text, pattern) => {
	if (!pattern) {return true}
	if (!text) {return false}

	const textLower = text.toLowerCase()
	const patternLower = pattern.toLowerCase()

	// Simple substring match (fast path)
	if (textLower.includes(patternLower)) {
		return true
	}

	// Fuzzy matching: check if pattern characters appear in order in text
	let patternIndex = 0
	let textIndex = 0

	while (patternIndex < patternLower.length && textIndex < textLower.length) {
		if (patternLower[patternIndex] === textLower[textIndex]) {
			patternIndex++
		}
		textIndex++
	}

	return patternIndex === patternLower.length
}

/**
 * Calculate a relevance score for fuzzy match
 * Higher score means better match
 * @param {string} text - The text to search in
 * @param {string} pattern - The pattern to search for
 * @returns {number} - Relevance score (0-100)
 */
export const calculateRelevanceScore = (text, pattern) => {
	if (!pattern) {return 100}
	if (!text) {return 0}

	const textLower = text.toLowerCase()
	const patternLower = pattern.toLowerCase()

	// Exact match gets highest score
	if (textLower === patternLower) {
		return 100
	}

	// Substring match gets high score
	if (textLower.includes(patternLower)) {
		return 90
	}

	// Check for fuzzy match
	let patternIndex = 0
	let textIndex = 0
	let consecutiveMatches = 0
	let maxConsecutive = 0
	let totalMatches = 0

	while (patternIndex < patternLower.length && textIndex < textLower.length) {
		if (patternLower[patternIndex] === textLower[textIndex]) {
			patternIndex++
			consecutiveMatches++
			maxConsecutive = Math.max(maxConsecutive, consecutiveMatches)
			totalMatches++
		} else {
			consecutiveMatches = 0
		}
		textIndex++
	}

	// If not all pattern characters were found, return 0
	if (patternIndex < patternLower.length) {
		return 0
	}

	// Calculate score based on:
	// 1. Percentage of pattern matched (40%)
	// 2. Length of longest consecutive match (40%)
	// 3. Position of first match (20%)
	const matchRatio = totalMatches / patternLower.length
	const consecutiveRatio = maxConsecutive / patternLower.length
	const positionScore = textIndex > 0 ? Math.min(20, 20 * (patternLower.length / textIndex)) : 0

	return Math.round((matchRatio * 40) + (consecutiveRatio * 40) + positionScore)
}

/**
 * Search tokens with fuzzy matching
 * @param {Array} tokens - Array of token objects
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in (default: ['key', 'tag', 'comment'])
 * @returns {Array} - Filtered and sorted tokens by relevance
 */
export const fuzzySearchSecrets = (tokens, searchTerm, fields = ['key', 'tag', 'comment']) => {
	if (!searchTerm.trim()) {
		return tokens
	}

	const searchTermLower = searchTerm.toLowerCase().trim()

	// Calculate relevance for each token
	const tokensWithScores = tokens.map(token => {
		let maxScore = 0

		// Check each field for matches
		fields.forEach(field => {
			const fieldValue = token[field]
			if (fieldValue) {
				const score = calculateRelevanceScore(fieldValue, searchTermLower)
				maxScore = Math.max(maxScore, score)
			}
		})

		return {
			token,
			score: maxScore
		}
	})

	// Filter out tokens with score 0 and sort by relevance
	return tokensWithScores
		.filter(item => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.map(item => item.token)
}

/**
 * Simple fuzzy search (boolean match)
 * @param {Array} tokens - Array of token objects
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} - Filtered tokens
 */
export const simpleFuzzySearch = (tokens, searchTerm, fields = ['key', 'tag', 'comment']) => {
	if (!searchTerm.trim()) {
		return tokens
	}

	const searchTermLower = searchTerm.toLowerCase().trim()

	return tokens.filter(token => fields.some(field => {
		const fieldValue = token[field]
		return fieldValue && fuzzyMatch(fieldValue, searchTermLower)
	}))
}