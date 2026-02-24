import { defineConfig } from 'drizzle-kit'

// only used to run the studio locally
export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_PATH || 'db.sqlite',
  },
})
