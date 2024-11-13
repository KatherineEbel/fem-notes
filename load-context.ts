import { AppLoadContext } from '@remix-run/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import { type PlatformProxy } from 'wrangler'

export const connection = (d1: D1Database) => {
  return drizzle(d1)
}

export type Cloudflare = Omit<PlatformProxy<Env>, 'dispose' | 'cf'>

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare
    db: () => ReturnType<typeof connection>
  }
}

interface CloudflareLoadContext {
  context: {
    cloudflare: Cloudflare
  }
  request: Request
}

let dbConnection: ReturnType<typeof connection> | null = null

export function getLoadContext({
  context,
}: CloudflareLoadContext): AppLoadContext {
  return {
    cloudflare: context.cloudflare,
    db() {
      if (!dbConnection) {
        dbConnection = connection(context.cloudflare.env.DB)
      }
      return dbConnection
    },
  }
}
