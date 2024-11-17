import { PlatformProxy } from 'wrangler'

export type Cloudflare = Omit<PlatformProxy<Env>, 'dispose' | 'cf'>

export interface CloudflareLoadContext {
  context: {
    cloudflare: Cloudflare
  }
  request: Request
}
