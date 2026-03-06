# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
pnpm run dev          # Vite dev server with HMR
pnpm run build        # Type-check (vue-tsc) + Vite production build
pnpm run lint         # Biome check
pnpm run lint:fix     # Biome auto-fix
pnpm run type-check   # vue-tsc --build
pnpm run preview      # Build + Wrangler local preview
pnpm run deploy       # Build + deploy to Cloudflare Workers
pnpm run storybook    # Component dev with Storybook
```

## Architecture

Vue 3 SPA (Composition API, `<script setup>`) with Vue Router, TypeScript (strict), vanilla CSS design system. Deployed as a Cloudflare Worker serving static assets from `dist/`, with a thin API layer in `server/index.ts`. Storybook available for component development (`pnpm run storybook`).

### Module pattern

Every tool lives in `src/modules/<name>/` with a base set of files:

| File | Role |
|------|------|
| `types.ts` | TypeScript interfaces for the module's data |
| `logic.ts` | Pure functions — no Vue imports, all business logic |
| `<Name>.vue` | UI layer using Composition API |
| `index.ts` | Barrel: `export { default as Name } from './Name.vue'` |

Modules may also include sub-component `.vue` files, `logic.test.ts` for unit tests, and data files as needed. The `sidebar` module (`src/modules/sidebar/`) owns the navigation data (`sections`, `allTools`) and helpers (`isToolActive`, `findActiveTool`).

### Adding a new tool

1. Create the module under `src/modules/<name>/`
2. Import and add the route in `src/router.ts`
3. Add a nav entry in `src/modules/sidebar/logic.ts` → `sections` array (pick the right category, set `abbreviation`)
4. Use design system classes from `src/css/` and reusable components from `src/components/` for UI consistency

### Shared composables

- `useCopy()` in `src/composables/useCopy.ts` — clipboard helper with `copiedKey` reactive feedback (auto-clears after 1.5 s)
- `useBidirectionalConverter(options)` in `src/composables/useBidirectionalConverter.ts` — syncs two text fields bidirectionally with watcher loop guards. Pass `forward(value)` and `backward(value)` conversion functions. `forward` may return `null` to skip updates (e.g. invalid mid-type input). Pass `initial` to seed fields. Call `recompute()` when external parameters change. Used by Base64, URL, HTML Entity, and Color converters.
- `useRecentTools()` in `src/composables/useRecentTools.ts` — tracks last 5 visited tools in localStorage. Shared singleton state.

### Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@/` | `src/` |
| `@components` | `src/components/index.ts` |
| `@composables/` | `src/composables/` |
| `@modules/` | `src/modules/` |
| `@shared/` | `shared/` |
| `@utils/` | `src/utils/` |

## Theme & Design System

Dark-only. CSS tokens defined in `src/style.css` (`:root` block), consumed via vanilla CSS classes in `src/css/`.

**CSS tokens:**
- **Colors:** `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`, `--color-surface-80`, `--color-border`, `--color-border-focus`, `--color-accent`, `--color-accent-hover`, `--color-accent-text` (WCAG AA), `--color-text-primary/secondary/muted`, `--color-text-on-accent`, `--color-success/error/warning`, `--color-overlay`. Alpha variants via `color-mix()`: `--color-accent-5` through `--color-accent-40`, `--color-success-10/15/20`, `--color-error-10/15/20/30`, `--color-warning-10/20`. Semantic: `--color-jwt-header/payload/signature`, `--color-http-get/post/put/patch/delete/head` with `-10`/`-20` variants.
- **Fonts:** `--font-sans` (Inter), `--font-mono` (JetBrains Mono)
- **Spacing:** `--spacing-{N}` where N × 0.125rem. Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24.
- **Font sizes:** `--text-2xs` (0.625rem), `--text-xs` (0.75rem), `--text-sm` (0.875rem), `--text-lg` (1.125rem), `--text-xl` (1.25rem)
- **Line heights:** `--leading-normal` (1.5), `--leading-relaxed` (1.625)
- **Border radius:** `--radius-sm` (0.25rem), `--radius-md` (0.5rem), `--radius-full` (9999px)
- **Z-index:** `--z-sticky` (10), `--z-sidebar` (30), `--z-dropdown-backdrop` (40), `--z-dropdown` (50)
- **Transitions:** `--duration-fast` (0.15s), `--duration-normal` (0.2s), `--duration-slow` (0.3s)
- **Shadows:** `--shadow-sm/md/lg`. **Blur:** `--blur-md` (12px)

**Design system classes** (`src/css/`) — all prefixed with `tb-`:
- **Form:** `.tb-input`, `.tb-input--error`, `.tb-input--small`, `.tb-input--with-copy`, `.tb-input-wrapper`, `.tb-textarea`, `.tb-textarea--error`, `.tb-select`, `.tb-label`, `.tb-label--inline`
- **Buttons:** `.tb-btn` (base, always via `TbButton`) + `.tb-btn-primary/secondary/ghost/danger`. `.tb-btn--sm`. `.tb-btn-pill` + `--sm/--active`, `.tb-btn-mini` + `--active`, `.tb-btn-icon` + `--danger`
- **Alerts:** `.tb-alert` + `--error/--success/--warning/--info`
- **Badges:** `.tb-badge` + `--valid/--invalid/--accent/--warning`
- **Card:** `.tb-card` + `--clickable/--hover/--raised/--selected/--accent/--sectioned` (with `.tb-card__header/body`)
- **Code:** `.tb-code-block`, `.tb-code-editor` + `--readonly`
- **Chip:** `.tb-chip` + `--active`
- **Tag:** `.tb-tag` + `--sm/--copyable/--copied`
- **Toggle group:** `.tb-toggle-group` + `--sm`, `.tb-toggle-group__btn` + `--active`
- **Expandable:** `.tb-expandable` + `__header/body`, `.tb-chevron` + `--down/--open`
- **Spacing:** `.tb-stack-{1..6}` (flex column + gap), `.tb-grid-2/3/4` (responsive), `.tb-row` + `--gap-1/2/3/4` + `--between` + `--wrap`
- **Module layout:** `.tb-module-root`, `.tb-module-body`
- **App layout:** `.tb-app-layout`, `.tb-app-main`, `.tb-app-header`, `.tb-app-content`, `.tb-sidebar*`, `.tb-split-view`, `.tb-scroll-panel`
- **Text color:** `.tb-text-primary/secondary/muted/accent/success/error`
- **Text size:** `.tb-text-xs/sm/lg/xl`, `.tb-text-tiny`
- **Semantic typography:** `.tb-text-description` (sm + secondary), `.tb-hint` (xs + muted), `.tb-section-title` (sm + semibold + primary), `.tb-section-subtitle` (xs + semibold + primary), `.tb-code-inline` (mono + xs), `.tb-empty-text` (xs + muted + centered + padded)
- **Text semantic:** `.tb-text-jwt-header/payload/signature`, `.tb-text-http-get/post/put/patch/delete`
- **Font:** `.tb-font-mono`, `.tb-font-sans`, `.tb-font-medium/semibold/bold`, `.tb-italic`, `.tb-leading-relaxed`
- **Icons:** `.tb-icon-xs` (0.75rem), `.tb-icon-sm` (0.875rem), `.tb-icon-md` (1rem), `.tb-icon-lg` (1.25rem), `.tb-icon-xl` (2rem)
- **Avatar / icon badge:** `.tb-avatar`, `.tb-icon-badge`
- **Checkbox:** `.tb-checkbox` + `__input/label`
- **Copy:** `.tb-copy-button` + `--copied/--idle`, `.tb-copy-row` + `__feedback`, `.tb-stat-card__copied`
- **Tables:** `.tb-table__wrapper` + `.tb-table`, `.tb-kv-table` + `__row/key/value` + `__row--copyable` + `__copied`, `.tb-kv-table--form`
- **Tabs:** `.tb-tab-bar` + `__tab` + `--active` + `__badge`
- **Empty state:** `.tb-empty-state` + `__icon/description/text`, `--full`
- **HTTP:** `.tb-http-method-badge` + `--sm/get/post/put/patch/delete/head/options`
- **Status:** `.tb-status-valid/expired/not-yet`
- **Info bar:** `.tb-info-bar` + `--accent`
- **Drop zone:** `.tb-drop-zone` + `__input/subtitle` + `--active`
- **Slider:** `.tb-slider__value/description`
- **Progress bar:** `.tb-progress-bar`
- **Dropdown:** `.tb-dropdown` + `--fixed-width`, `.tb-dropdown__search-input/list/item/no-match`
- **Link:** `.tb-link`
- **Responsive:** `.tb-sm-show` (shown ≥640px)
- **Display:** `.tb-block`, `.tb-inline-block`
- **Sizing:** `.tb-w-full`, `.tb-w-third`, `.tb-w-20`, `.tb-w-40`, `.tb-max-w-64`, `.tb-h-{8,12,80}`, `.tb-h-full`, `.tb-max-h-32`
- **Text utilities:** `.tb-break-all`, `.tb-nowrap`, `.tb-text-center`, `.tb-uppercase`, `.tb-truncate`
- **Spacing:** `.tb-pb-8`, `.tb-pt-12`, `.tb-mt-{1,2,20}`, `.tb-mb-{4,6}`, `.tb-ml-{2,3,4,auto}`
- **Layout utilities:** `.tb-flex-fill` (flex: 1 + min-w: 0), `.tb-flex-1`, `.tb-flex-shrink-0`, `.tb-min-w-0`, `.tb-flex-center`, `.tb-relative`, `.tb-overlay-tr`, `.tb-items-start`, `.tb-list-reset`
- **Patterns:** `.tb-group` + `.tb-group-hover-visible`, `.tb-error-text`, `.tb-stat-card`, `.tb-copy-row`, `.tb-sr-only`, `.tb-disabled`, `.tb-truncate`

**Reusable Vue components** (`src/components/`): `TbInput` (`size: 'default' | 'sm'`), `TbFieldInput` (`multiline` prop for textarea), `TbButton`, `TbSelect`, `TbOptionGroup` (variants: `pill`, `segmented`, `tab`), `TbCard` (`sectioned` prop, `#actions` slot), `TbCodeBlock`, `TbCodeEditor` (CodeMirror 6 — `v-model`, `language`, `readonly`, `placeholder`, `extensions`; theme in `codemirror-theme.ts`), `TbSlider`, `TbCheckbox`, `TbDropZone`, `TbSearchableDropdown`, `TbProgressBar`, `TbEmptyState` (`full` prop), `TbExpandable` (`chevron: 'right' | 'down'`), `TbStatusBanner`, `TbHttpMethodBadge`, `TbKvTable`, `TbStatCard`, `TbTag` (`copyable` prop), `TbSwatch`, `TbCopyButton`, `TbCopyId`, `TbCopyRow`. Each has a `.stories.ts` file for Storybook.

**Responsive breakpoints:** `sm` = 640px, `md` = 768px. Mobile-first. Grids stack on mobile, go multi-column at sm. Sidebar shows at md.

**Styling approach:** Global design system classes (`tb-` BEM naming) — component `.vue` files must have **no** `<style scoped>` blocks. Never hardcode colors, spacing, font-sizes, border-radii, or transition durations — always use `var(--token)`. Inline `:style` bindings are **only** for truly dynamic/computed values (e.g. colors from user input, progress bar widths); static design decisions must always use design system classes. Prefer semantic classes (e.g. `tb-code-inline`, `tb-hint`, `tb-flex-fill`) over stacking 3+ utility classes.

**Accessibility:** `:focus-visible` outlines on all interactive elements. `prefers-reduced-motion` disables transitions. `:disabled` states on buttons. Dark-themed scrollbars.

## Code style

Enforced by Biome: single quotes, 2-space indent, 140-char line width, sorted imports, no unused variables. Additional rules:

### General

- No semicolons at end of statements
- Use `null` instead of `undefined`
- No non-null assertions (`!`) where avoidable
- Full, descriptive names — never abbreviate: `currentUser` not `usr`, `itemIndex` not `idx`

### Control flow

**Guard clauses** are allowed only at the very start of a function, and must always be multi-line:
```typescript
// Good
if (!user) {
  return null
}

// Bad — single-line guard
if (!user) { return null }
```

**Core logic must use explicit `if/else`** — no early returns in the middle of a function, no mutable accumulator variables:
```typescript
// Good
if (condition) {
  return valueA
} else {
  return valueB
}

// Bad — sawtooth / mid-function early return
if (condition) {
  return valueA
}
return valueB
```

**Void functions** should not use guard clauses. Wrap the execution in a single `if` block instead:
```typescript
// Good
function doSomething() {
  if (isReady) {
    execute()
  }
}

// Bad
function doSomething() {
  if (!isReady) return
  execute()
}
```

**Simple value mapping** — prefer ternary over if/else:
```typescript
return condition ? valueA : valueB
```

**Union/enum dispatch** — use `switch/case`, never a chain of `if/else if`. Every case must be explicit:
```typescript
switch (mode) {
  case 'a': return handleA()
  case 'b': return handleB()
}
```

Do not use curly braces for `case` blocks that contain a single statement.

**String defaults** — use `||` to fall back from empty strings:
```typescript
return value.trim() || null
```

### Functions & arrow functions

- Prefer small, named private functions over IIFEs
- Single-argument arrow functions: no parentheses — `x => x * 2`
- Single-expression arrow functions: no curly braces — `items.map(item => item.name)`

### Braces

Always use curly braces, always on separate lines — never inline:
```typescript
// Good
if (condition) {
  doSomething()
}

// Bad
if (condition) doSomething()
```

## Components & Storybook

All reusable components live in `src/components/` as `Tb*.vue` with a matching `Tb*.stories.ts`. Storybook auto-discovers `src/components/**/*.stories.ts`.

### Creating a component

Every component needs two files: `TbFoo.vue` + `TbFoo.stories.ts`.

**Props & models:**
- Use `defineModel<T>()` for two-way binding (preferred over `@update:modelValue`)
- Use `withDefaults(defineProps<{ ... }>(), { ... })` for typed props with defaults
- Use `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` on form components that wrap native inputs
- Union types for variants: `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'`

**Styling layers** (in order of preference):
1. Design system classes (`.tb-*` BEM) from `src/css/` — components must not use `<style scoped>`
2. Add new global classes to `src/css/` when a pattern is reusable
3. Inline `:style` only for dynamic/computed values
4. Never hardcode colors — always use `var(--color-*)` tokens

**Slots & composition:**
- Use `<slot>` for content insertion, named slots for specific regions (e.g. `actions`, `icon`)
- Compose from existing `Tb*` components (e.g. `TbFieldInput` wraps `TbInput` + `TbCopyButton`)
- Use `useCopy()` composable for any copy-to-clipboard behavior

### Story format

Strictly CSF3 with autodocs. Every story file follows this structure:

```typescript
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbFoo from './TbFoo.vue'

const meta: Meta<typeof TbFoo> = {
  component: TbFoo,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbFoo>

export const Default: Story = {
  args: { label: 'Example' },
}
```

**Patterns by component type:**
- **Static components** (badges, alerts, cards): use `args` only
- **Stateful components** (inputs, toggles, sliders): use `render()` with `ref()` + `setup()` for live `v-model` binding
- **Variant showcases**: one story per variant, or a single story with multiple instances in the template
- Cover states: default, error, disabled, empty, interactive

## SCIM module

The SCIM tool (`src/modules/scim/` + `server/modules/scim/`) is a full SCIM 2.0 server backed by Cloudflare D1 (SQLite). It is significantly more complex than other tools because it has a database, a public API, scheduled jobs, and bearer token authentication.

### Dual API surface

| Surface | Prefix | Auth | Purpose |
|---------|--------|------|---------|
| Management API | `/api/scim-servers/...` | None (UI backend) | CRUD for servers, users, groups from the Vue frontend |
| SCIM API | `/scim/:serverId/v2/...` | Bearer token | RFC 7644 endpoints consumed by identity providers (Okta, Entra ID) |

The management API is the Vue app's backend — it creates/deletes servers and manages data through a simplified JSON interface. The SCIM API is the standards-compliant surface that external IdPs provision against. Both share the same repository layer.

### Database schema (D1)

Four tables: `scim_server`, `scim_user`, `scim_group`, `scim_group_member`. Users and groups cascade-delete when their server is deleted. Group membership is a join table with a composite primary key. Migrations live in `drizzle/migrations/` and are applied by Wrangler on deploy.

### Authentication

Each server gets a bearer token (`crypto.randomUUID()`) at creation time. The token is returned once in the create response and stored in the DB but never returned by `findServer()` (show-once design). All SCIM API requests are validated against the stored token using constant-time comparison. The management API is unauthenticated.

### Stale server cleanup

A Cloudflare cron trigger (`scheduled` handler in `server/index.ts`) calls `deleteStaleServers()`, which deletes servers whose `last_used_at` (or `created_at` if never used) is older than 2 months. `last_used_at` is updated via `waitUntil()` on every SCIM API request.

### Local development

`pnpm run dev` starts Vite with HMR for the frontend. `pnpm run preview` builds and runs a local Wrangler preview with a local D1 database (Miniflare). The D1 binding is configured in `wrangler.jsonc`. Tests for pure logic live in `server/modules/scim/logic.test.ts` and run with Vitest.

## Webhook module

The Webhook Catcher (`src/modules/webhook/` + `server/modules/webhook/`) captures HTTP requests at unique URLs. Backed by Cloudflare KV.

- **Server:** `server/modules/webhook/` — handlers, logic, repository. Uses reversed timestamp keys for newest-first KV listing, TTL-based auto-expiration, and rate limiting via daily counter keys.
- **Client:** `src/modules/webhook/` — landing page, request list/detail, request sender.
- **Shared:** `shared/modules/webhook/` — types and OpenAPI spec.
- **Routes:** `/hooks/:webhookId` captures incoming requests; `/api/webhooks/...` is the management API.

## Shared code

The `shared/` directory contains code used by both client and server:

- `shared/modules/scim/` — types, Valibot schemas, OpenAPI spec builder
- `shared/modules/webhook/` — types, OpenAPI spec builder
- `shared/utils/logger.ts` — structured logger

## Key libraries

| Library | Used in |
|---------|---------|
| `colord` | color module — parsing, conversion, harmonies |
| `jsonrepair` | json-validator module — auto-fix malformed JSON |
| `he` | html-entity module — encode/decode HTML entities |
| `anpr-wiegand` | wiegand module — Wiegand format encode/decode |
| `qrcode` + `qr-scanner` | qr-code module — generation and scanning |
| `valibot` | shared schemas — runtime request validation |
| `drizzle-orm` | server — D1 database access for SCIM |
| `codemirror` | TbCodeEditor + json-validator — code editing, syntax highlighting, linting |

## Node version

v24 (see `.nvmrc`)
