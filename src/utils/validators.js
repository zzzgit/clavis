function validateKey(key) {
	if (!key || typeof key !== 'string') {
		return { valid: false, error: 'Key must be a string' }
	}

	const trimmedKey = key.trim()
	if (trimmedKey === '') {
		return { valid: false, error: 'Key cannot be empty' }
	}

	if (trimmedKey.includes('..')) {
		return { valid: false, error: 'Key cannot contain consecutive dots' }
	}

	if (trimmedKey.startsWith('.') || trimmedKey.endsWith('.')) {
		return { valid: false, error: 'Key cannot start or end with a dot' }
	}

	const parts = trimmedKey.split('.')
	for (const part of parts) {
		if (part.trim() === '') {
			return { valid: false, error: 'Key parts cannot be empty' }
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(part)) {
			return { valid: false, error: `Key part "${part}" contains invalid characters. Only letters, numbers, underscores and hyphens are allowed` }
		}
	}

	return { valid: true }
}

function validateToken(token) {
	if (!token || typeof token !== 'string') {
		return { valid: false, error: 'Token must be a string' }
	}

	const trimmedToken = token.trim()
	if (trimmedToken === '') {
		return { valid: false, error: 'Token cannot be empty' }
	}

	if (trimmedToken.length < 8) {
		return { valid: false, error: 'Token must be at least 8 characters long' }
	}

	return { valid: true }
}

function validateDate(dateString) {
	if (!dateString) {
		return { valid: true }
	}

	const date = new Date(dateString)
	if (isNaN(date.getTime())) {
		return { valid: false, error: 'Invalid date format. Use YYYY-MM-DD' }
	}

	return { valid: true }
}

function validateTag(tag) {
	if (!tag) {
		return { valid: true }
	}

	if (typeof tag !== 'string') {
		return { valid: false, error: 'Tag must be a string' }
	}

	if (tag.length > 50) {
		return { valid: false, error: 'Tag cannot exceed 50 characters' }
	}

	return { valid: true }
}

function validateComment(comment) {
	if (!comment) {
		return { valid: true }
	}

	if (typeof comment !== 'string') {
		return { valid: false, error: 'Comment must be a string' }
	}

	if (comment.length > 500) {
		return { valid: false, error: 'Comment cannot exceed 500 characters' }
	}

	return { valid: true }
}

export {
	validateKey,
	validateToken,
	validateDate,
	validateTag,
	validateComment
}
