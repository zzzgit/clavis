class Secret {
	constructor({ key, token, expiration = null, tag = '', comment = '', env = '', sid = null }) {
		this.sid = sid
		this.key = key
		this.token = token
		this.expiration = expiration
		this.tag = tag
		this.comment = comment
		this.env = env
		this.createdAt = new Date().toISOString()
		this.updatedAt = this.createdAt
	}

	validate() {
		const errors = []

		if (!this.key || typeof this.key !== 'string' || this.key.trim() === '') {
			errors.push('Key is required and must be a non-empty string')
		}

		if (!this.token || typeof this.token !== 'string' || this.token.trim() === '') {
			errors.push('Token is required and must be a non-empty string')
		}

		if (this.expiration && !this.isValidDate(this.expiration)) {
			errors.push('Expiration must be a valid date string')
		}

		return errors
	}

	isValidDate(dateString) {
		const date = new Date(dateString)
		return date instanceof Date && !isNaN(date)
	}

	toJSON() {
		return {
			sid: this.sid,
			key: this.key,
			token: this.token,
			expiration: this.expiration,
			tag: this.tag,
			comment: this.comment,
			env: this.env,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt
		}
	}

	static fromJSON(data) {
		const secret = new Secret(data)
		if (data.sid !== undefined) { secret.sid = data.sid }
		if (data.createdAt) { secret.createdAt = data.createdAt }
		if (data.updatedAt) { secret.updatedAt = data.updatedAt }
		return secret
	}
}

export default Secret
