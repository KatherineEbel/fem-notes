/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />

interface IncomingRequestCfProperties extends IncomingRequestCfProperties {}

declare let process: {
  env: {
    NODE_ENV: 'production' | 'development'
    CI: string
    CLOUDFLARE_ACCOUNT_ID: string
    CLOUDFLARE_DATABASE_ID: string
    CLOUDFLARE_D1_TOKEN: string
    HOST_URL: string | undefined
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    RESEND_API_KEY: string
    SUPPORT_EMAIL: string
    SESSION_SECRET: string
    TOTP_SECRET: string
    DB: D1Database
    PORT: string
  }
}
