# QR Studio

QR Studio turns an HTTP or HTTPS link into a customizable, high-resolution QR code entirely in your browser.

> Screenshot placeholder: add a capture of the finished QR Studio workspace here.

## Features

- Validate and normalize links, including domains without a scheme.
- Preview a standards-compliant QR code and update it with the design controls.
- Choose colors, 256–2048 px output, quiet-zone margin, and error correction.
- Download an opaque PNG with a sanitized, descriptive filename.
- Responsive layout, keyboard focus states, live status announcements, and reduced-motion support.
- No account, backend, QR API, analytics, or stored URL history.

## Run locally

Requirements: Node.js 20.19 or later (or 22.12 or later) and npm.

```sh
npm install
npm run dev
```

## Development commands

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```



## Privacy and safety

QR encoding happens on the device. The app does not send the entered URL anywhere or persist it. URL validation checks syntax and allowed schemes; it does not establish that a destination is trustworthy. Inspect links before scanning or sharing their QR codes.

See [the system architecture report](./docs/SYSTEM_ARCHITECTURE_REPORT.md) for implementation details, security decisions, test scope, and limitations.
