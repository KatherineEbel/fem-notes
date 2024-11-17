import { validateEnv } from './cloudflare'
import { CloudflareLoadContext } from './types'

declare module '@remix-run/cloudflare' {
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {}
}

export function getLoadContext({ context }: CloudflareLoadContext) {
  validateEnv(context.cloudflare.env)
  return {
    env: context.cloudflare.env,
  }
}
