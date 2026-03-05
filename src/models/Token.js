class Token {
  constructor({ key, token, expiration = null, tag = '', comment = '' }) {
    this.key = key
    this.token = token
    this.expiration = expiration
    this.tag = tag
    this.comment = comment
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
      key: this.key,
      token: this.token,
      expiration: this.expiration,
      tag: this.tag,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static fromJSON(data) {
    const token = new Token(data)
    if (data.createdAt) token.createdAt = data.createdAt
    if (data.updatedAt) token.updatedAt = data.updatedAt
    return token
  }
}

export default Token