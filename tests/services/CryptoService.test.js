import { jest } from '@jest/globals'

// 32-byte AES key encoded as the final `$`-segment of a fake Argon2 hash string
const FAKE_KEY_B64 = Buffer.alloc(32, 0x41).toString('base64')
const FAKE_HASH = `$argon2id$v=19$m=65536,t=3,p=4$fakesalt$${FAKE_KEY_B64}`

jest.unstable_mockModule('cross-keychain', () => ({
  getPassword: jest.fn().mockResolvedValue(FAKE_HASH)
}))

const { encrypt, decrypt } = await import('../../src/services/CryptoService.js')

describe('CryptoService', () => {
  describe('encrypt → decrypt roundtrip', () => {
    test('decrypts back to the original plaintext', () => {
      const plaintext = 'sk-abc123secrettoken'
      return encrypt(plaintext).then(ciphertext => {
        expect(ciphertext).toMatch(/^enc:/)
        return decrypt(ciphertext).then(result => {
          expect(result).toBe(plaintext)
        })
      })
    })

    test('produces a different ciphertext each call (random IV)', () => {
      const plaintext = 'same-value'
      return Promise.all([encrypt(plaintext), encrypt(plaintext)]).then(([c1, c2]) => {
        expect(c1).not.toBe(c2)
      })
    })

    test('roundtrip preserves unicode and special characters', () => {
      const plaintext = 'token with spaces & symbols: !@#$%^&*()_+-=[]{}|;\':",./<>?'
      return encrypt(plaintext)
        .then(ciphertext => decrypt(ciphertext))
        .then(result => {
          expect(result).toBe(plaintext)
        })
    })
  })

  describe('non-encrypted passthrough', () => {
    test('returns plain string unchanged when not prefixed with enc:', () => {
      return decrypt('plain-text-token').then(result => {
        expect(result).toBe('plain-text-token')
      })
    })

    test('returns null unchanged', () => {
      return decrypt(null).then(result => {
        expect(result).toBeNull()
      })
    })

    test('returns empty string unchanged', () => {
      return decrypt('').then(result => {
        expect(result).toBe('')
      })
    })
  })

  describe('corrupted data rejection', () => {
    test('rejects when payload is too short (under 28 bytes)', () => {
      // Encode fewer than 28 bytes so the "payload too short" guard triggers
      const shortPayload = `enc:${Buffer.alloc(10).toString('base64')}`
      return expect(decrypt(shortPayload)).rejects.toThrow('Corrupted encrypted value: payload too short')
    })

    test('rejects when auth tag has been tampered with', () => {
      // Encrypt a valid value, then flip a byte in the auth-tag region (bytes 12-27)
      return encrypt('sensitive').then(ciphertext => {
        const raw = Buffer.from(ciphertext.slice('enc:'.length), 'base64')
        // Flip a byte inside the 16-byte auth tag (offset 12)
        raw[12] ^= 0xff
        const tampered = `enc:${raw.toString('base64')}`
        return expect(decrypt(tampered)).rejects.toThrow()
      })
    })

    test('rejects when ciphertext body has been tampered with', () => {
      return encrypt('sensitive').then(ciphertext => {
        const raw = Buffer.from(ciphertext.slice('enc:'.length), 'base64')
        // Flip a byte past the auth tag (offset 28+)
        if (raw.length > 28) raw[28] ^= 0xff
        const tampered = `enc:${raw.toString('base64')}`
        return expect(decrypt(tampered)).rejects.toThrow()
      })
    })
  })
})
