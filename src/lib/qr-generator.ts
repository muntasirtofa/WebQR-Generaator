import QRCode, { type QRCodeErrorCorrectionLevel, type QRCodeToDataURLOptions } from 'qrcode'

export type QrSettings = { foreground: string; background: string; size: number; margin: number; correction: QRCodeErrorCorrectionLevel }

export function createQrDataUrl(value: string, settings: QrSettings): Promise<string> {
  const options: QRCodeToDataURLOptions = {
    errorCorrectionLevel: settings.correction,
    type: 'image/png',
    width: settings.size,
    margin: settings.margin,
    color: { dark: settings.foreground, light: settings.background },
  }
  return QRCode.toDataURL(value, options)
}

export function downloadName(value: string): string {
  try {
    const host = new URL(value).hostname.replace(/^www\./, '')
    const safe = host.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'link'
    return `qr-studio-${safe}.png`
  } catch {
    return 'qr-studio-link.png'
  }
}

export function contrastRatio(hexA: string, hexB: string): number {
  const luminance = (hex: string) => {
    const raw = hex.replace('#', '')
    const rgb = raw.length === 3 ? raw.split('').map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16))
    const channels = rgb.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
  }
  const a = luminance(hexA), b = luminance(hexB)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
