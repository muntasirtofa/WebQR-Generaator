import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, CircleAlert, Copy, Link2, LockKeyhole, QrCode, RotateCcw, ScanLine, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import type { QrSettings } from './lib/qr-generator'
import { contrastRatio, createQrDataUrl, downloadName } from './lib/qr-generator'
import { normalizeUrl } from './lib/url-validation'

const defaults: QrSettings = { foreground: '#24124a', background: '#ffffff', size: 512, margin: 4, correction: 'M' }
const palettes = [
  { name: 'Midnight', foreground: '#24124a', background: '#ffffff', swatch: 'linear-gradient(135deg,#24124a 50%,#fff 50%)' },
  { name: 'Ocean', foreground: '#073b5c', background: '#e9f8ff', swatch: 'linear-gradient(135deg,#073b5c 50%,#e9f8ff 50%)' },
  { name: 'Berry', foreground: '#681b48', background: '#fff0f7', swatch: 'linear-gradient(135deg,#681b48 50%,#fff0f7 50%)' },
  { name: 'Forest', foreground: '#153e32', background: '#edf8ef', swatch: 'linear-gradient(135deg,#153e32 50%,#edf8ef 50%)' },
]

export default function App() {
  const reduceMotion = useReducedMotion()
  const [input, setInput] = useState('')
  const [submittedUrl, setSubmittedUrl] = useState('')
  const [generation, setGeneration] = useState(0)
  const [settings, setSettings] = useState(defaults)
  const [qr, setQr] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showFullUrl, setShowFullUrl] = useState(false)
  const contrast = useMemo(() => contrastRatio(settings.foreground, settings.background), [settings])

  useEffect(() => {
    if (!submittedUrl) return
    let active = true
    setStatus('Updating preview…')
    createQrDataUrl(submittedUrl, settings).then((result) => {
      if (active) { setQr(result); setStatus('Your QR code is ready.'); setError('') }
    }).catch(() => {
      if (active) { setQr(''); setError('This link could not be encoded with the current settings. Try a shorter link or a lower correction level.'); setStatus('') }
    })
    return () => { active = false }
  }, [submittedUrl, settings, generation])

  function generate() {
    const result = normalizeUrl(input)
    setQr(''); setError(''); setStatus('')
    if (!result.ok) { setSubmittedUrl(''); setError(result.error); return }
    setInput(result.url)
    setSubmittedUrl(result.url)
    setGeneration((current) => current + 1)
    setStatus('Creating your QR code…')
  }

  function updateSetting<K extends keyof QrSettings>(key: K, value: QrSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
    setDownloaded(false)
  }

  function reset() { setSettings(defaults); setDownloaded(false) }

  function download() {
    if (!qr || !submittedUrl) return
    try {
      const anchor = document.createElement('a')
      anchor.href = qr
      anchor.download = downloadName(submittedUrl)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setDownloaded(true)
      setStatus('Download started. Your QR code is ready to use.')
      window.setTimeout(() => setDownloaded(false), 3200)
    } catch {
      setError('Your browser could not start the download. Try again or use a different browser.')
    }
  }

  async function copyUrl() {
    try { await navigator.clipboard.writeText(submittedUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setError('Clipboard access is unavailable in this browser.') }
  }

  const motionProps = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } }

  return <div className="app-shell">
    <header className="topbar wrap">
      <a className="brand" href="#top" aria-label="QR Studio home"><span className="brand-mark"><QrCode size={22} strokeWidth={2.4} /></span><span>qr<span className="brand-accent">studio</span></span></a>
      <div className="topbar-right"><span className="privacy-chip"><LockKeyhole size={13} /> Free <i /> No account <i /> No upload</span><span className="local-label"><span /> Runs locally in your browser</span></div>
    </header>

    <main id="top" className="wrap">
      <motion.section className="hero" {...motionProps}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow"><Sparkles size={14} /> YOUR LINK, IN A NEW LIGHT</div>
        <h1>Make your link<br /><span>scan-ready.</span></h1>
        <p className="hero-copy">Create a QR code that looks as good as it works.<br className="desktop-break" /> Customize it, download it, and take it anywhere.</p>
        <form className="url-form" onSubmit={(event) => { event.preventDefault(); generate() }} noValidate>
          <div className="url-field"><Link2 size={19} aria-hidden="true" /><label className="sr-only" htmlFor="url-input">Website address</label><input id="url-input" type="text" inputMode="url" autoComplete="url" placeholder="Paste a website link…" value={input} onChange={(event) => { setInput(event.target.value); setSubmittedUrl(''); setQr(''); setStatus(''); if (error) setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'url-error' : 'url-help'} /><button type="button" className="example-link" onClick={() => { setInput('https://example.com'); setSubmittedUrl(''); setQr(''); setStatus('') }}>Try an example</button></div>
          <motion.button className="generate-button" type="submit" whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>Create QR <ArrowRight size={17} /></motion.button>
        </form>
        <div className="form-meta">{error ? <span className="error-text" id="url-error" role="alert"><CircleAlert size={15} />{error}</span> : <span id="url-help">HTTP and HTTPS links · Up to 2,048 characters</span>}<span className="safe-note"><ShieldCheck size={14} /> Your links never leave this device</span></div>
      </motion.section>

      <motion.section className="workspace" {...motionProps} transition={{ duration: 0.45, delay: 0.08 }} aria-label="QR code workspace">
        <div className="customizer panel">
          <div className="panel-heading"><div><span className="section-kicker">MAKE IT YOURS</span><h2>Design your code</h2></div><button type="button" className="reset-button" onClick={reset}><RotateCcw size={14} /> Reset</button></div>
          <div className="control-group"><div className="control-title"><span>Color palette</span><span className="subtle">Choose a look</span></div><div className="palette-list">{palettes.map((palette) => <button key={palette.name} type="button" className={`palette-option ${settings.foreground === palette.foreground ? 'selected' : ''}`} onClick={() => { setSettings((current) => ({ ...current, foreground: palette.foreground, background: palette.background })); setDownloaded(false) }} aria-label={`${palette.name} color palette`} aria-pressed={settings.foreground === palette.foreground}><span style={{ background: palette.swatch }} /><span>{palette.name}</span></button>)}</div></div>
          <div className="color-row control-group"><label className="color-control"><span>Foreground</span><span className="color-picker-wrap"><input aria-label="Foreground color" type="color" value={settings.foreground} onChange={(event) => updateSetting('foreground', event.target.value)} /><code>{settings.foreground.toUpperCase()}</code></span></label><label className="color-control"><span>Background</span><span className="color-picker-wrap"><input aria-label="Background color" type="color" value={settings.background} onChange={(event) => updateSetting('background', event.target.value)} /><code>{settings.background.toUpperCase()}</code></span></label></div>
          {contrast < 4.5 && <p className="contrast-warning" role="status"><CircleAlert size={14} /> Low contrast may make this code harder to scan. Choose darker foreground colors.</p>}
          <div className="select-row control-group"><label className="select-control"><span>Image size</span><span className="select-wrap"><select value={settings.size} onChange={(event) => updateSetting('size', Number(event.target.value))}><option value={256}>256 × 256 px</option><option value={512}>512 × 512 px</option><option value={1024}>1024 × 1024 px</option><option value={2048}>2048 × 2048 px</option></select><ChevronDown size={15} /></span></label><label className="select-control"><span>Error correction</span><span className="select-wrap"><select value={settings.correction} onChange={(event) => updateSetting('correction', event.target.value as QrSettings['correction'])}><option value="L">Low (L)</option><option value="M">Medium (M)</option><option value="Q">Quartile (Q)</option><option value="H">High (H)</option></select><ChevronDown size={15} /></span></label></div>
          <label className="margin-control control-group"><span><span>Quiet zone</span><span className="subtle">Clear space around the code</span></span><span className="margin-select"><select aria-label="Quiet zone margin" value={settings.margin} onChange={(event) => updateSetting('margin', Number(event.target.value))}><option value={2}>2 modules</option><option value={4}>4 modules · recommended</option><option value={6}>6 modules</option><option value={8}>8 modules</option></select><ChevronDown size={14} /></span></label>
          <div className="tip-box"><Zap size={16} /><p><strong>Good to know</strong><br />A quiet zone of 4 modules gives scanners room to find the code.</p></div>
        </div>

        <div className="preview-panel panel">
          <div className="preview-heading"><div><span className="section-kicker">LIVE PREVIEW</span><h2>Your QR code</h2></div><span className={`ready-pill ${qr ? 'ready' : ''}`}><span />{qr ? 'Ready to scan' : 'Waiting for a link'}</span></div>
          <div className="qr-stage"><div className="qr-card" style={{ backgroundColor: settings.background }}>
            {qr ? <motion.img key={qr} className="qr-image" src={qr} alt={`QR code for ${submittedUrl}`} initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }} /> : <div className="empty-qr"><div><QrCode size={42} strokeWidth={1.25} /><span>YOUR CODE<br />WILL APPEAR HERE</span></div></div>}
          </div><div className="scan-stamp"><ScanLine size={14} /> SCAN ME</div></div>
          {submittedUrl ? <div className="encoded-url"><span className="url-dot" /><button type="button" className="encoded-text" onClick={() => setShowFullUrl((value) => !value)} title="Click to show or hide the full address">{showFullUrl ? submittedUrl : submittedUrl.length > 56 ? `${submittedUrl.slice(0, 53)}…` : submittedUrl}</button><button type="button" className="icon-button" aria-label="Copy encoded URL" onClick={copyUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}</button></div> : <div className="empty-caption"><Link2 size={14} />Your link will appear here</div>}
          <div className="preview-details"><span><span className="detail-label">OUTPUT</span>{settings.size} × {settings.size} px</span><span><span className="detail-label">MARGIN</span>{settings.margin} modules</span><span><span className="detail-label">FORMAT</span>PNG</span></div>
          <motion.button type="button" className="download-button" onClick={download} disabled={!qr} whileHover={qr && !reduceMotion ? { y: -1 } : undefined} whileTap={qr && !reduceMotion ? { scale: 0.99 } : undefined}>{downloaded ? <><Check size={18} /> Download started</> : <><ArrowDownToLine size={18} /> Download PNG <span>{settings.size}px</span></>}</motion.button>
          <p className="scan-reminder"><ShieldCheck size={14} /> Test your QR code before printing or sharing.</p>
          <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </div>
      </motion.section>

      <section className="steps-section" aria-labelledby="steps-heading"><div className="steps-title"><span className="section-kicker">THREE SIMPLE STEPS</span><h2 id="steps-heading">From link to <em>let’s go.</em></h2></div><div className="steps-grid"><article><span className="step-number">01</span><span className="step-icon"><Link2 size={18} /></span><h3>Paste your link</h3><p>Drop in any website address. We’ll tidy it up for you.</p></article><article><span className="step-number">02</span><span className="step-icon"><Sparkles size={18} /></span><h3>Make it yours</h3><p>Pick colors and the right size for where it’s going.</p></article><article><span className="step-number">03</span><span className="step-icon"><ArrowDownToLine size={18} /></span><h3>Download & scan</h3><p>Save a crisp PNG, then test it with your camera.</p></article></div></section>
    </main>
    <footer className="footer"><div className="wrap footer-inner"><a className="brand footer-brand" href="#top"><span className="brand-mark"><QrCode size={19} /></span><span>qr<span className="brand-accent">studio</span></span></a><p><LockKeyhole size={14} /> Your links stay yours. QR codes are created on this device.</p><span>© {new Date().getFullYear()} QR Studio</span></div><div className="wrap footer-note">QR codes can point to any destination. Check that a link is trustworthy before you share or scan it.</div></footer>
  </div>
}
