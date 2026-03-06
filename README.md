# Toolbox

A collection of lightweight, browser-native developer utilities. Fast, private (all processing happens locally), and dependency-minimal.

## Features

- **Base64**: Encode and decode text to/from Base64.
- **Base64 Image**: View images from Base64 strings.
- **Cheat Sheets**: Quick reference for Bash, CSS, Git, HTTP, and Regex.
- **Color Converter**: Convert between Hex, RGB, HSL, and more.
- **Epoch Converter**: Convert Unix timestamps to human-readable dates.
- **HTML Entity**: Encode and decode HTML entities.
- **Image to SVG**: Convert raster images to SVG vector graphics using VTracer WASM.
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

### Server-backed features

These features require Cloudflare Workers with additional bindings.

- **Webhook Catcher**: Capture and inspect incoming HTTP webhooks with a unique URL, and send requests to external endpoints. Requires Cloudflare KV.
- **SCIM Server**: Create isolated SCIM 2.0 endpoints to provision users and groups. Each server gets a unique URL for identity provider integration (Okta, Entra ID). Requires Cloudflare D1.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Styling**: Vanilla CSS design system with [Storybook](https://storybook.js.org/)
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
pnpm install
```

### Development Server

```bash
pnpm dev              # Vite dev server with HMR
pnpm storybook        # Component dev with Storybook
```

### Build and Lint

```bash
pnpm build            # Type-check + production build
pnpm lint             # Biome check
pnpm lint:fix         # Biome auto-fix
pnpm type-check       # vue-tsc --build
```

### Deployment

```bash
pnpm preview          # Build + Wrangler local preview
pnpm deploy           # Build + deploy to Cloudflare Workers
```

### Database (for server-backed features)

```bash
pnpm db:gen            # Generate migrations
pnpm db:migrate:local  # Apply migrations locally
pnpm db:migrate:prod   # Apply migrations to production
pnpm db:studio:local   # Browse local database
```

### TODO

* [Feature] SCIM server: logs of every call to the SCIM API
* [Technical] E2E Tests