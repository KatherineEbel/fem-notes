import { parseWithZod } from '@conform-to/zod'
import type { AppLoadContext, SessionStorage } from '@remix-run/cloudflare'
import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleProfile, GoogleStrategy } from 'remix-auth-google'
import { TOTPStrategy, TOTPVerifyParams } from 'remix-auth-totp'

import { getForgotPasswordEmail } from '~/components/email/forgot-password-email'
import { AuthUser, compare, hash, requireUser } from '~/services/auth/utils'
import { Database, database, users } from '~/services/db/db.server'
import { EmailService } from '~/services/email/email.server'
import { authSchema } from '~/validation/user-validation'

export class Auth {
  private readonly emailService: EmailService
  public readonly authenticator: Authenticator<AuthUser>
  public readonly sessionStorage: SessionStorage
  public sessionKey: string
  public db: Database

  constructor(context: AppLoadContext) {
    this.emailService = new EmailService(context)
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: 'notes',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        secrets: [context.env.SESSION_SECRET],
      },
    })

    this.authenticator = new Authenticator<AuthUser>(this.sessionStorage, {
      throwOnError: true,
    })
    this.sessionKey = this.authenticator.sessionKey

    this.db = database(context.env.DB)

    this.authenticator.use(
      new FormStrategy(async ({ form }) => {
        const submission = await parseWithZod(form, {
          schema: authSchema.superRefine(async (data, ctx) => {
            if (data.intent === 'signup') {
              const user = await this.db
                .select({ id: users.id, email: users.email })
                .from(users)
                .where(eq(users.email, data.email))
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
        if (submission.status !== 'success') {
          throw submission.reply()
        }

        let user: AuthUser | null
        switch (submission.value.intent) {
          case 'login':
            user = await this.loginEmailPassword(
              submission.value.email,
              submission.value.password,
            )
            break
          case 'signup':
            user = await this.signupEmailPassword(
              submission.value.email,
              submission.value.password,
            )
        }
        if (!user) {
          throw submission.reply({ formErrors: ['Invalid credentials'] })
        }
        return user
      }),
      'user-pass',
    )

    this.authenticator.use(
      new TOTPStrategy(
        {
          totpGeneration: {
            digits: 6,
            period: 60 * 5, // expire in 5 minutes
          },
          secret: context.env.TOTP_SECRET,
          sendTOTP: async ({ magicLink, email, code }) => {
            await this.emailService.sendAuthEmail({
              react: getForgotPasswordEmail(code, magicLink),
              subject: 'Your password reset code',
              to: email,
            })
          },
        },
        async ({ email, context }: TOTPVerifyParams) => {
          if (!context) {
            throw new Error('Context is required')
          }
          const user = await this.db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, email))
            .get()
          if (!user) {
            throw new Error('User not found')
          }
          return user
        },
      ),
      'TOTP',
    )

    this.authenticator.use(
      new GoogleStrategy(
        {
          clientID: context.env.GOOGLE_CLIENT_ID,
          clientSecret: context.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${context.env.HOST_URL}/auth/google/callback`,
        },
        async ({ profile, context }) => {
          if (!context) {
            throw new Error('Context is required')
          }
          return this.loginWithGoogle(profile)
        },
      ),
      'google',
    )
  }

  public async clear(request: Request) {
    const session = await this.sessionStorage.getSession(
      request.headers.get('cookie'),
    )
    return this.sessionStorage.destroySession(session)
  }

  public static async resetPassword(
    context: AppLoadContext,
    email: string,
    newPassword: string,
  ) {
    const db = database(context.env.DB)
    const user = await requireUser(db, email)
    const passwordHash = await hash(newPassword)
    return await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id))
      .returning({ id: users.id, email: users.email })
      .run()
  }

  public async loginWithGoogle(profile: GoogleProfile) {
    const email = profile.emails[0].value
    const existingUser = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (existingUser) {
      return existingUser
    }
    try {
      return await this.db
        .insert(users)
        .values({ email })
        .returning({ id: users.id, email: users.email })
        .get()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  public async loginEmailPassword(email: string, password: string) {
    const userWithPassword = await this.db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (!userWithPassword) {
      return null
    }

    const passwordMatch = await compare(
      password,
      userWithPassword.passwordHash!,
    )
    if (!passwordMatch) {
      return null
    }
    const { passwordHash: _, ...user } = userWithPassword
    return user
  }

  public async signupEmailPassword(email: string, password: string) {
    const passwordHash = await hash(password)
    return this.db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email })
      .get()
  }
}
