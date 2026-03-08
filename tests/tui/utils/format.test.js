import { parseISO } from 'date-fns'
import {
  getTokenStatus,
  truncateKey,
  truncateTag,
  formatExpiration,
  formatCreatedAt,
  previewToken,
  calculateColumnWidths
} from '../../../src/tui/utils/format.js'

describe('Format Utilities', () => {
  describe('getTokenStatus', () => {
    test('should return active for token without expiration', () => {
      const token = { expiration: null }
      const status = getTokenStatus(token)

      expect(status.char).toBe('✓')
      expect(status.color).toBe('green')
      expect(status.label).toBe('Active')
    })

    test('should return expired for past expiration date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const token = { expiration: pastDate.toISOString() }

      const status = getTokenStatus(token)

      expect(status.char).toBe('✗')
      expect(status.color).toBe('red')
      expect(status.label).toBe('Expired')
    })

    test('should return warning for expiration within 7 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3)
      const token = { expiration: futureDate.toISOString() }

      const status = getTokenStatus(token)

      expect(status.char).toBe('!')
      expect(status.color).toBe('yellow')
      expect(status.label).toContain('Expires in')
    })

    test('should return active for expiration beyond 7 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const token = { expiration: futureDate.toISOString() }

      const status = getTokenStatus(token)

      expect(status.char).toBe('✓')
      expect(status.color).toBe('green')
      expect(status.label).toBe('Active')
    })
  })

  describe('truncateKey', () => {
    test('should return original key if within width', () => {
      const key = 'api.github.com'
      const result = truncateKey(key, 20)

      expect(result).toBe('api.github.com'.padEnd(20))
    })

    test('should truncate long key from end', () => {
      const key = 'very.long.api.key.name.that.exceeds.width'
      const result = truncateKey(key, 20)

      expect(result.length).toBeLessThanOrEqual(20)
      expect(result).toContain('…')
    })

    test('should handle empty key', () => {
      const result = truncateKey('', 10)
      expect(result).toBe(''.padEnd(10))
    })

    test('should keep as much of the end as possible', () => {
      const key = 'a.b.c.d.e.f.g.h.i.j'
      const result = truncateKey(key, 15)

      expect(result).toMatch(/^…[a-z.]+\s*$/)
      expect(result.length).toBe(15)
    })
  })

  describe('truncateTag', () => {
    test('should return dash for empty tag', () => {
      const result = truncateTag('', 10)
      expect(result).toBe('-'.padEnd(10))
    })

    test('should pad short tag', () => {
      const result = truncateTag('github', 10)
      expect(result).toBe('github'.padEnd(10))
    })

    test('should truncate long tag', () => {
      const tag = 'very-long-tag-name-that-exceeds-width'
      const result = truncateTag(tag, 15)

      expect(result.length).toBe(15)
      expect(result).toContain('…')
    })
  })

  describe('formatExpiration', () => {
    test('should return "Never" for null expiration', () => {
      const result = formatExpiration(null, 12)
      expect(result).toBe('Never'.padStart(12))
    })

    test('should format future date', () => {
      const futureDate = new Date('2025-12-31')
      const result = formatExpiration(futureDate.toISOString(), 12)

      expect(result).toBe('2025-12-31'.padStart(12))
    })

    test('should show days for expiration within 7 days', () => {
      const nearFuture = new Date()
      nearFuture.setDate(nearFuture.getDate() + 3)
      const result = formatExpiration(nearFuture.toISOString(), 12)

      expect(result).toMatch(/^\s*3d\s*$/)
    })

    test('should format past date', () => {
      const pastDate = new Date('2023-01-01')
      const result = formatExpiration(pastDate.toISOString(), 12)

      expect(result).toBe('2023-01-01'.padStart(12))
    })
  })

  describe('formatCreatedAt', () => {
    test('should return dash for null date', () => {
      const result = formatCreatedAt(null, 10)
      expect(result).toBe('-'.padStart(10))
    })

    test('should format date', () => {
      const date = new Date('2024-01-01')
      const result = formatCreatedAt(date.toISOString(), 10)

      expect(result).toBe('2024-01-01'.padStart(10))
    })
  })

  describe('previewToken', () => {
    test('should return full token if short', () => {
      const token = '12345678'
      const result = previewToken(token, 20)

      expect(result).toBe('12345678'.padEnd(20))
    })

    test('should preview long token', () => {
      const token = 'ghp_1234567890abcdef1234567890abcdef'
      const result = previewToken(token, 20)

      expect(result).toContain('…')
      expect(result.length).toBe(20)
    })

    test('should handle empty token', () => {
      const result = previewToken('', 10)
      expect(result).toBe(''.padEnd(10))
    })
  })

  describe('calculateColumnWidths', () => {
    test('should use minimum widths for narrow terminal', () => {
      const widths = calculateColumnWidths(80)

      expect(widths.status).toBeGreaterThanOrEqual(3)
      expect(widths.key).toBeGreaterThanOrEqual(10)
      expect(widths.tag).toBeGreaterThanOrEqual(8)
      expect(widths.expires).toBeGreaterThanOrEqual(8)
      expect(widths.created).toBeGreaterThanOrEqual(8)
      expect(widths.token).toBeGreaterThanOrEqual(12)
    })

    test('should use minimum widths for medium terminal', () => {
      const totalMinWidth = 4 + 20 + 15 + 12 + 10 + 20 + 7
      const widths = calculateColumnWidths(totalMinWidth)

      expect(widths.status).toBe(4)
      expect(widths.key).toBe(20)
      expect(widths.tag).toBe(15)
      expect(widths.expires).toBe(12)
      expect(widths.created).toBe(10)
      expect(widths.token).toBe(20)
    })

    test('should allocate extra space for wide terminal', () => {
      const totalMinWidth = 4 + 20 + 15 + 12 + 10 + 20 + 7
      const extraWidth = 50
      const terminalWidth = totalMinWidth + extraWidth
      const widths = calculateColumnWidths(terminalWidth)

      expect(widths.key).toBeGreaterThan(20)
      expect(widths.tag).toBeGreaterThan(15)
      expect(widths.token).toBeGreaterThan(20)
    })

    test('should handle very narrow terminal', () => {
      const widths = calculateColumnWidths(50)

      const totalWidth = widths.status + widths.key + widths.tag + widths.expires + widths.created + widths.token
      expect(totalWidth).toBeLessThanOrEqual(50)
    })
  })
})