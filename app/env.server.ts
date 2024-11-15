import { z, TypeOf } from 'zod'

export const zodEnv = z.object({
  CI: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),

  TOTP_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  PORT: z.number().optional().default(5173),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  RESEND_API_KEY: z.string(),
  SUPPORT_EMAIL: z.string().email(),
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

try {
  zodEnv.parse(process.env)
} catch (err) {
  if (err instanceof z.ZodError) {
    const { fieldErrors } = err.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) => {
        if (!errors) return

        return `${field}: ${errors.join(', ')}`
      })
      .filter(Boolean)
      .join('\n  ')

    throw Error(`Missing environment variables:\n  ${errorMessage}`)
  }
}
