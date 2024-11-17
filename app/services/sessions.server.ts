import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { createThemeSessionResolver } from 'remix-themes'

const themeSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_theme',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET ?? 's3cr3t'],
  },
})

export const themeSessionResolver =
  createThemeSessionResolver(themeSessionStorage)
