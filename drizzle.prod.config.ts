import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: process.env.TOOLBOX_CF_DATABASE_ID,
    accountId: process.env.TOOLBOX_CF_ACCOUNT_ID,
    token: process.env.TOOLBOX_CF_TOKEN,
    url: '',
  },
})
