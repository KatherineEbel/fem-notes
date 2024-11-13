import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const base = './app/db'

export default defineConfig({
  out: `${base}/migrations`,
  schema: `${base}/schema.server.ts`,
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
})
