// Extends the auto-generated Env interface with bindings added after the last `wrangler types` run.
// Run `pnpm run cf-typegen` after creating the D1 database to regenerate worker-configuration.d.ts.
interface Env {
  DB: D1Database
}
