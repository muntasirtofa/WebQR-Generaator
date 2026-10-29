import { describe, expect, it } from 'vitest'
import { MAX_URL_LENGTH, normalizeUrl } from './url-validation'

describe('normalizeUrl', () => {
  it('trims whitespace and adds HTTPS to a domain', () => {
    expect(normalizeUrl('  example.com/path  ')).toEqual({ ok: true, url: 'https://example.com/path' })
  })
  it('preserves query strings, fragments, and international characters', () => {
    const result = normalizeUrl('https://example.com/search?q=café#section')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.url).toContain('q=caf%C3%A9#section')
  })
  it('rejects empty, malformed, unsupported, and overlong values', () => {
    expect(normalizeUrl('').ok).toBe(false)
    expect(normalizeUrl('https://').ok).toBe(false)
    expect(normalizeUrl('javascript:alert(1)')).toEqual({ ok: false, error: 'Only HTTP and HTTPS links are supported.' })
    expect(normalizeUrl(`a${'x'.repeat(MAX_URL_LENGTH)}`).ok).toBe(false)
  })
})
