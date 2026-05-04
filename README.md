# Throffling QR

A simple, fast QR code generator for URLs. Enter a URL and instantly generate a QR code for it.

**Live at:** https://qr.throffling.dev

## Features

- **Instant QR Generation** – Generate QR codes on the fly as you type
- **HTTP & HTTPS Support** – Default to HTTPS, but explicitly use HTTP with `http://` prefix
- **Live Favicon** – QR code appears as the page favicon
- **Shareable Links** – Direct URLs to QR codes (e.g., `/google.com`)
- **Two Output Links**:
  - QR image URL – shareable link to the QR code SVG
  - Destination URL – the actual URL encoded in the QR code
- **Clean UI** – Minimalist design with responsive layout

## Usage

1. **Basic Input**: Type or paste a URL into the input field
   - `google.com` → generates QR for `https://google.com`
   - `https://example.com` → generates QR for that URL
   - `http://example.com` → generates QR for HTTP (not HTTPS)

2. **Shareable URLs**: The app creates shareable links automatically
   - Visit `qr.throffling.dev/google.com` to directly show the Google QR code
   - The URL updates in the browser address bar as you type

3. **QR Code Output**: Get two clickable links
   - Click the first link to view/download the QR code SVG
   - Click the second link to open/verify the destination URL

## Technical Stack

- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **QR Generation**: Backend API endpoint at `/{domain}.svg`
- **Storage**: No persistence – generated on-the-fly

## Project Structure

```
throffling-qr/
├── public/
│   └── index.html        # Main application
├── functions/
│   └── [[path]].js       # QR generation API (backend)
└── package.json          # Project metadata
```

## Deployment

This project is designed to run on serverless platforms (like Vercel) with the `functions/` directory containing API routes.

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- History API
- SVG rendering

## License

MIT

