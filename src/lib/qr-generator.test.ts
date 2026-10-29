import { describe, expect, it, vi } from 'vitest'
import QRCode from 'qrcode'
import { contrastRatio, createQrDataUrl, downloadName } from './qr-generator'

describe('QR utilities', () => {
  it('creates a PNG data URL and passes settings to the QR encoder', async () => {
    const spy = vi.spyOn(QRCode, 'toDataURL').mockImplementation((() => Promise.resolve('data:image/png;base64,qr')) as never)
    const data = await createQrDataUrl('https://example.com', { foreground: '#111111', background: '#ffffff', size: 512, margin: 4, correction: 'M' })
    expect(data).toMatch(/^data:image\/png/)
    expect(spy).toHaveBeenCalledWith('https://example.com', expect.objectContaining({ width: 512, margin: 4, errorCorrectionLevel: 'M' }))
    spy.mockRestore()
  })
  it('sanitizes filenames and warns on weak contrast', () => {
    expect(downloadName('https://www.Example.com/a?b=2')).toBe('qr-studio-example.com.png')
    expect(downloadName('not a url')).toBe('qr-studio-link.png')
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrastRatio('#aaaaaa', '#ffffff')).toBeLessThan(4.5)
  })
  it('surfaces encoder failures to the caller', async () => {
    vi.spyOn(QRCode, 'toDataURL').mockRejectedValueOnce(new Error('too long'))
    await expect(createQrDataUrl('x'.repeat(10000), { foreground: '#000000', background: '#ffffff', size: 256, margin: 4, correction: 'H' })).rejects.toThrow('too long')
  })
})
