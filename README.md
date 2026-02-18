# Toolbox

A collection of lightweight, browser-native developer utilities. This toolbox is designed to be fast, private (all processing happens locally), and dependency-minimal.

## Features

- **Base64**: Encode and decode text to/from Base64.
- **Base64 Image**: View images from Base64 strings.
- **Cheat Sheets**: Quick reference for Bash, CSS, Git, HTTP, and Regex.
- **Color Converter**: Convert between Hex, RGB, HSL, and more.
- **Epoch Converter**: Convert Unix timestamps to human-readable dates.
- **HTML Entity**: Encode and decode HTML entities.
- **JSON Validator**: Format, repair, and validate JSON payloads.
- **JWT Decoder**: Inspect JSON Web Tokens (header and payload).
- **Number Converter**: Convert between Decimal, Hex, Binary, and Octal.
- **PEM Decoder**: Parse and visualize PEM/ASN.1 structures.
- **QR Code**: Generate and scan QR codes.
- **SVG Path**: Visualize SVG path data.
- **URL Encoder**: Percent-encode/decode strings.
- **UUID Generator**: Generate v4 UUIDs.
- **Wiegand Converter**: Tools for working with Wiegand protocols.
- **XOR Checksum**: Calculate XOR-based checksums.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Linter**: [Biome](https://biomejs.dev/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Development

This project uses `pnpm` as the package manager.

### Prerequisites

Ensure you have [pnpm](https://pnpm.io/installation) installed.

### Setup

```bash
# Install dependencies
pnpm install
```

### Development Server

```bash
# Start dev server with hot-reload
pnpm dev
```

### Build and Lint

```bash
# Build for production
pnpm build

# Lint files
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type-check
pnpm type-check
```

### Deployment

The project is deployed to Cloudflare Pages.

```bash
# Preview deployment
pnpm preview

# Deploy to Cloudflare
pnpm deploy
```


### Next? TODO

* [Feature] A "POST redirect" page that allows to POST auth workflows (for example) to show the entire payload
* [Feature] A Webhook.site
* [Technical] Create components and design system? (like "button")
* [Technical] E2E Tests
