# Toolbox

A collection of lightweight, browser-native developer utilities. This toolbox is designed to be fast, private (all processing happens locally), and dependency-minimal.

## Features

- **Base64**: Encode and decode text to/from Base64.
- **Base64 Image**: View images from Base64 strings.
- **Cheat Sheets**: Quick reference for Bash, CSS, Git, HTTP, and Regex.
- **Color Converter**: Convert between Hex, RGB, HSL, and more.
- **Epoch Converter**: Convert Unix timestamps to human-readable dates.
- **Image to SVG**: Convert raster images (PNG, JPG, WebP) to SVG vector graphics using VTracer WASM, with presets and advanced parameter tuning.
- **HTML Entity**: Encode and decode HTML entities.
- **JSON Validator**: Format, repair, and validate JSON payloads.
- **JWT Decoder**: Inspect JSON Web Tokens (header and payload).
- **Number Converter**: Convert between Decimal, Hex, Binary, and Octal.
- **PEM Decoder**: Parse and visualize PEM/ASN.1 structures.
- **QR Code**: Generate and scan QR codes.
- **SVG Path**: Visualize SVG path data.
- **URL Encoder**: Percent-encode/decode strings.
- **UUID Generator**: Generate v4 UUIDs.
- **Webhook Catcher**: Capture and inspect incoming HTTP webhooks with a unique URL.
- **Wiegand Converter**: Tools for working with Wiegand protocols.
- **XOR Checksum**: Calculate XOR-based checksums.

## Server-backed features

These features require Cloudflare Workers with additional bindings.

- **Webhook Catcher**: Capture and inspect incoming HTTP webhooks with a unique URL, and send requests to external endpoints. Requires Cloudflare KV.
- **SCIM Server**: Create isolated SCIM 2.0 endpoints to provision users and groups. Each server gets a unique URL for identity provider integration (Okta, Entra ID). A built-in Compliance tab documents RFC 7644 / RFC 7643 coverage. Requires Cloudflare D1.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Linter**: [Biome](https://biomejs.dev/)
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/) via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

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


### Database (for server-backed features)

```bash
# Generate migrations
pnpm db:gen

# Apply migrations locally
pnpm db:migrate:local

# Apply migrations to production
pnpm db:migrate:prod

# Browse local database
pnpm db:studio:local
```

### Next? TODO

* [Feature] SCIM server: logs of every call to the SCIM API
* [Technical] Create components and design system? (like "button")
* [Technical] E2E Tests
