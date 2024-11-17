import { defineConfig } from 'drizzle-kit'

import { validateEnv } from './cloudflare'

validateEnv(process.env)

export default defineConfig({
  out: './app/drizzle/migrations',
  schema: './app/services/db.server.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID,
    token: process.env.CLOUDFLARE_D1_TOKEN,
  },
})
