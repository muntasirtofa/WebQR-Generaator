export const MAX_URL_LENGTH = 2048

export type UrlResult = { ok: true; url: string } | { ok: false; error: string }

export function normalizeUrl(input: string): UrlResult {
  const value = input.trim()
  if (!value) return { ok: false, error: 'Enter a website address to get started.' }
  if (value.length > MAX_URL_LENGTH) return { ok: false, error: 'That link is too long. Try a shorter URL (2,048 characters max).' }
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) {
    return { ok: false, error: 'Only HTTP and HTTPS links are supported.' }
  }
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) throw new Error('invalid')
    return { ok: true, url: parsed.toString() }
  } catch {
    return { ok: false, error: 'That link doesn’t look right. Check the address and try again.' }
  }
}
