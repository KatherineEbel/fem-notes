import { faker } from '@faker-js/faker'
import { test as baseTest, expect as baseExpect } from '@playwright/test'
import { eq } from 'drizzle-orm'
import { type SetupServer, setupServer } from 'msw/node'
import { type ViteDevServer, createServer } from 'vite'
import { type PlatformProxy, getPlatformProxy } from 'wrangler'

import { Auth } from '~/services/auth/auth.server'
import { AuthUser } from '~/services/auth/utils'
import { database, users } from '~/services/db/db.server'

type AuthOptions = {
  email: string
  password: string
}

interface TestFixtures {
  userEmail: string
  userPass: string
  signup(options?: AuthOptions): Promise<AuthUser>
  login(options?: AuthOptions): Promise<AuthUser>
}

interface WorkerFixtures {
  port: number
  wrangler: PlatformProxy<Env>
  server: ViteDevServer
  msw: SetupServer
}

export const expect = baseExpect.extend({})

async function clearDB(DB: D1Database) {
  const db = database(DB)
  return db.delete(users)
}

const userEmail = faker.internet.email()
const userPass = faker.internet.password({ length: 8 })

export const test = baseTest.extend<TestFixtures, WorkerFixtures>({
  userPass,
  userEmail,
  signup: async ({ wrangler }, use) => {
    const db = database(wrangler.env.DB)
    let userId: number | undefined = undefined
    await use(async (options) => {
      const auth = new Auth({ env: wrangler.env })
      const email = options?.email ?? userEmail
      const password = options?.password ?? userPass
      const user = await auth.signupEmailPassword(email, password)
      userId = user?.id
      return user
    })
    if (userId) {
      await db.delete(users).where(eq(users.id, userId))
    }
  },
  login: async ({ wrangler }, use) => {
    const db = database(wrangler.env.DB)
    let userId: number | undefined = undefined
    await use(async (options) => {
      const auth = new Auth({ env: wrangler.env })
      const email = options?.email ?? userEmail
      const password = options?.password ?? userPass
      const user = await db.query.users.findFirst({
        columns: { id: true, email: true, passwordHash: true },
        where: eq(users.email, email),
      })
      userId = user?.id
      return await auth.loginPassword(user, password)
    })
    await db.delete(users).where(eq(users.id, userId!))
  },
  port: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      await use(3515 + workerInfo.workerIndex)
    },
    { scope: 'worker' },
  ],

  // Ensure visits works with relative path
  baseURL: ({ port }, use) => {
    return use(`http://localhost:${port}`)
  },

  // Start a Vite dev server for each worker
  // This allows MSW to intercept requests properly
  server: [
    async ({ port }, use) => {
      const server = await createServer({
        configFile: './vite.config.ts',
      })

      await server.listen(port)

      await use(server)

      await server.close()
    },
    { scope: 'worker', auto: true },
  ],

  msw: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const server = setupServer()

      server.listen()

      await use(server)

      server.close()
    },
    { scope: 'worker', auto: true },
  ],

  // To access wrangler bindings similar to Remix / Vite
  wrangler: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const wrangler = await getPlatformProxy<Env>()

      // To access bindings in the tests.
      await use(wrangler)

      // Ensure all caches are cleaned up
      await clearDB(wrangler.env.DB)

      await wrangler.dispose()
    },
    { scope: 'worker', auto: true },
  ],
})

test.beforeEach(({ msw }) => {
  msw.resetHandlers()
})
