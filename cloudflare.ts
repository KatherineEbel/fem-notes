import { z } from 'zod'

const envSchema = z.object({
  CI: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),

  HOST_URL: z.string().default('http://localhost:5173'),
  TOTP_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  PORT: z.string().optional().default('5173'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  RESEND_API_KEY: z.string().optional(),
  SUPPORT_EMAIL: z.string().email(),
})

export type Environment = z.infer<typeof envSchema>

type NotesEnv = Env | Environment

export function validateEnv(env: NotesEnv) {
  try {
    envSchema.parse(env ?? process.env)
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
}
