import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import { parseWithZod } from '@conform-to/zod'
import { AppLoadContext } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleProfile, GoogleStrategy } from 'remix-auth-google'
import { TOTPStrategy } from 'remix-auth-totp'

import { getForgotPasswordEmail } from '~/components/email/forgot-password-email'
import { user as userModel } from '~/db/schema'
import { sendAuthEmail } from '~/modules/email/email.server'
import { sessionStorage } from '~/session.server'
import { authSchema, User } from '~/validation/user-validation'

export type AuthUser = Pick<User, 'id' | 'email'>

const scryptAsync = promisify(scrypt)
const keyLength = 64
export const authenticator = new Authenticator<AuthUser>(sessionStorage)

const formStrategy = new FormStrategy(async ({ context, form }) => {
  const submission = await parseWithZod(form, {
    schema: authSchema.superRefine(async (data, ctx) => {
      if (data.intent === 'signup') {
        if (!context) return
        const user = await context
          .db()
          .select({ id: userModel.id, email: userModel.email })
          .from(userModel)
          .where(eq(userModel.email, data.email))
          .get()
        if (user) {
          ctx.addIssue({
            code: 'custom',
            path: ['email'],
            message: 'This email is not available.',
          })
          return
        }
      }
    }),
    async: true,
  })
  if (!context || submission.status !== 'success') {
    throw submission.reply()
  }

  let user: AuthUser | null
  switch (submission.value.intent) {
    case 'login':
      user = await loginEmailPassword(
        context,
        submission.value.email,
        submission.value.password,
      )
      break
    case 'signup':
      user = await signupEmailPassword(
        context,
        submission.value.email,
        submission.value.password,
      )
  }
  if (!user) {
    throw submission.reply({ formErrors: ['Invalid credentials'] })
  }
  return user
})

authenticator.use(formStrategy, 'user-pass')

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackURL: process.env.HOST_URL
      ? `${process.env.HOST_URL}/google/callback`
      : 'http://localhost:5173/google/callback',
  },
  async ({ profile, context }) => {
    if (!context) {
      throw new Error('Context is required')
    }
    return loginWithGoogle(context, profile)
  },
)

authenticator.use(googleStrategy, 'google')

const totpStrategy = new TOTPStrategy(
  {
    totpGeneration: {
      digits: 6,
      period: 60 * 5, // expire in 5 minutes
    },
    secret: process.env.TOTP_SECRET,
    sendTOTP: async ({ magicLink, email, code }) => {
      await sendAuthEmail({
        react: getForgotPasswordEmail(code, magicLink),
        subject: 'Your password reset code',
        to: email,
      })
    },
  },
  async ({ email, context }) => {
    if (!context) {
      throw new Error('Context is required')
    }
    const user = await context
      .db()
      .select({ id: userModel.id, email: userModel.email })
      .from(userModel)
      .where(eq(userModel.email, email))
      .get()
    if (!user) {
      throw new Error('User not found')
    }
    return user
  },
)

authenticator.use(totpStrategy, 'TOTP')

async function hash(password: string): Promise<string> {
  try {
    const salt = randomBytes(16).toString('hex')

    const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer

    return `${salt}.${derivedKey.toString('hex')}`
  } catch (err) {
    const error = err as Error
    throw new Error(`Error hashing password: ${error.message}`)
  }
}

async function compare(password: string, hash: string): Promise<boolean> {
  const [salt, hashKey] = hash.split('.')

  if (!salt || !hashKey) {
    throw new Error('Invalid hash format')
  }

  const hashKeyBuff = Buffer.from(hashKey, 'hex')

  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer
  return timingSafeEqual(hashKeyBuff, derivedKey)
}

export async function signupEmailPassword(
  context: AppLoadContext,
  email: string,
  password: string,
) {
  const passwordHash = await hash(password)
  return context
    .db()
    .insert(userModel)
    .values({
      email,
      passwordHash,
    })
    .returning({ id: userModel.id, email: userModel.email })
    .get()
}

export async function loginEmailPassword(
  context: AppLoadContext,
  email: string,
  password: string,
) {
  const userWithPassword = await context
    .db()
    .select({
      id: userModel.id,
      email: userModel.email,
      passwordHash: userModel.passwordHash,
    })
    .from(userModel)
    .where(eq(userModel.email, email))
    .get()

  if (!userWithPassword) {
    return null
  }

  const passwordMatch = await compare(password, userWithPassword.passwordHash!)
  if (!passwordMatch) {
    return null
  }
  const { passwordHash: _, ...user } = userWithPassword
  return user
}

export async function loginWithGoogle(
  context: AppLoadContext,
  profile: GoogleProfile,
) {
  const email = profile.emails[0].value
  const existingUser = await context
    .db()
    .select({ id: userModel.id, email: userModel.email })
    .from(userModel)
    .where(eq(userModel.email, email))
    .get()

  if (existingUser) {
    return existingUser
  }
  try {
    const user = await context
      .db()
      .insert(userModel)
      .values({ email })
      .returning({ id: userModel.id, email: userModel.email })
      .get()
    console.log(user)
    return user
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function resetPassword(
  context: AppLoadContext,
  email: string,
  newPassword: string,
) {
  const user = await requireUser(context, email)
  const passwordHash = await hash(newPassword)
  return await context
    .db()
    .update(userModel)
    .set({ passwordHash })
    .where(eq(userModel.id, user.id))
    .returning({ id: userModel.id, email: userModel.email })
    .run()
}

async function requireUser(context: AppLoadContext, email: string) {
  const user = await context
    .db()
    .select({ id: userModel.id, email: userModel.email })
    .from(userModel)
    .where(eq(userModel.email, email))
    .get()
  if (!user) {
    throw Error('User not found')
  }
  return user
}
