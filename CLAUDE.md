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
```

## Architecture

Vue 3 SPA (Composition API, `<script setup>`) with Vue Router, TypeScript (strict), Tailwind CSS 4. Deployed as a Cloudflare Worker serving static assets from `dist/`, with a thin API layer in `server/index.ts`.

### Module pattern

Every tool lives in `src/modules/<name>/` with exactly 4 files:

| File | Role |
|------|------|
| `types.ts` | TypeScript interfaces for the module's data |
| `logic.ts` | Pure functions — no Vue imports, all business logic |
| `<Name>.vue` | UI layer using Composition API |
| `index.ts` | Barrel: `export { default as Name } from './Name.vue'` |

The `sidebar` module (`src/modules/sidebar/`) follows the same pattern and owns the navigation data (`sections`, `allTools`) and helpers (`isToolActive`, `findActiveTool`).

### Adding a new tool

1. Create the 4-file module under `src/modules/<name>/`
2. Import and add the route in `src/main.ts`
3. Add a nav entry in `src/modules/sidebar/logic.ts` → `sections` array (pick the right category, set `abbreviation`)

### Bidirectional converter pattern

Several tools (Number, Epoch, Base64, URL, HTML Entity) sync multiple inputs using:

- One `ref` and one `watch` per input field
- A shared `updating` flag to prevent watcher loops
- `requestAnimationFrame(() => { updating.value = false })` to reset the flag after all watchers fire

### Shared composables

- `useCopy()` in `src/composables/useCopy.ts` — clipboard helper with `copiedKey` reactive feedback (auto-clears after 1.5 s)
- `useBidirectionalConverter(options)` in `src/composables/useBidirectionalConverter.ts` — syncs two text fields bidirectionally. Pass `forward(value)` and `backward(value)` conversion functions; the composable manages the watcher loop guard internally. `forward` may return `null` to leave the right field unchanged (e.g. when input is invalid mid-type). Pass `initial` to seed both fields without triggering watchers. Call `recompute()` when an external parameter (e.g. encoding variant) changes to re-run the forward conversion. Used by Base64, URL, HTML Entity, and Color converters.

### Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@/` | `src/` |
| `@modules/` | `src/modules/` |
| `@components/` | `src/components/` |
| `@composables/` | `src/composables/` |
| `@utils/` | `src/utils/` |

## Theme

Dark-only. CSS variables are defined in `src/style.css` and consumed as Tailwind utility classes:

**Backgrounds:** `bg-surface`, `bg-surface-raised`, `bg-surface-overlay`
**Borders:** `border-border`, `border-border-focus`
**Text:** `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-accent`, `text-success`, `text-error`
**Fonts:** `font-sans` (Inter), `font-mono` (JetBrains Mono)

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

## Key libraries

| Library | Used in |
|---------|---------|
| `colord` | color module — parsing, conversion, harmonies |
| `jsonrepair` | json-validator module — auto-fix malformed JSON |
| `he` | html-entity module — encode/decode HTML entities |
| `anpr-wiegand` | wiegand module — Wiegand format encode/decode |

## Node version

v24 (see `.nvmrc`)
