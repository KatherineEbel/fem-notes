import { parseWithZod } from '@conform-to/zod'
import {
  AppLoadContext,
  SessionStorage,
  createCookieSessionStorage,
} from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleProfile, GoogleStrategy } from 'remix-auth-google'
import { TOTPStrategy, TOTPVerifyParams } from 'remix-auth-totp'

import { getForgotPasswordEmail } from '~/components/email/forgot-password-email'
import { AuthUser, compare, hash, requireUser } from '~/services/auth/utils'
import { Database, database, SelectUser, users } from '~/services/db/db.server'
import { EmailService } from '~/services/email/email.server'
import { authSchema } from '~/validation/user-validation'

export class Auth {
  private readonly emailService: EmailService
  protected readonly authenticator: Authenticator<AuthUser>
  public authenticate: Authenticator<AuthUser>['authenticate']
  public isAuthenticated: Authenticator<AuthUser>['isAuthenticated']
  public readonly sessionStorage: SessionStorage
  public sessionKey: string
  public sessionErrorKey: string
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
    this.authenticate = this.authenticator.authenticate.bind(this.authenticator)
    this.isAuthenticated = this.authenticator.isAuthenticated.bind(
      this.authenticator,
    )
    this.sessionKey = this.authenticator.sessionKey
    this.sessionErrorKey = this.authenticator.sessionErrorKey

    this.db = database(context.env.DB)

    this.authenticator.use(
      new FormStrategy(async ({ form }) => {
        const submission = parseWithZod(form, { schema: authSchema })
        if (submission.status !== 'success') {
          throw new AuthorizationError('Unable to authenticate.')
        }

        const { intent, ...userData } = submission.value

        const existingUser = await this.db.query.users.findFirst({
          columns: { id: true, email: true, passwordHash: true },
          where: eq(users.email, userData.email),
        })

        switch (intent) {
          case 'login':
            return {
              ...(await this.loginPassword(existingUser, userData.password)),
              passwordHash: undefined,
            }
          case 'signup':
            if (existingUser) {
              throw new AuthorizationError('Unable to authenticate.')
            }
            return this.signupEmailPassword(userData.email, userData.password)
        }
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
        async ({ email }: TOTPVerifyParams) => {
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
        async ({ profile }) => {
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
    const existingUser = await this.db.query.users.findFirst({
      columns: { id: true, email: true },
      where: eq(users.email, email),
    })

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

  public async loginPassword(
    user: Pick<SelectUser, 'id' | 'email' | 'passwordHash'> | undefined,
    tryPass: string,
  ) {
    if (!user || !user.passwordHash) {
      throw new AuthorizationError(
        'Check your credentials or log in with your third-party provider.',
      )
    }
    const passwordMatch = await compare(tryPass, user.passwordHash)
    if (!passwordMatch) {
      throw new AuthorizationError('Invalid credentials')
    }
    return user
  }

  public async signupEmailPassword(email: string, password: string) {
    const passwordHash = await hash(password)
    try {
      return this.db
        .insert(users)
        .values({
          email,
          passwordHash,
        })
        .returning({ id: users.id, email: users.email })
        .onConflictDoNothing({ target: users.email })
        .get()
    } catch (e) {
      console.error(e)
      throw new AuthorizationError('Signup Failed', e as Error)
    }
  }
}
