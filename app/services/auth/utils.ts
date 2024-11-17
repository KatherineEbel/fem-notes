import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import { eq } from 'drizzle-orm'

import { Database, SelectUser, users } from '~/services/db/db.server'

const scryptAsync = promisify(scrypt)
const keyLength = 64

export type AuthUser = Pick<SelectUser, 'id' | 'email'>

export async function requireUser(db: Database, email: string) {
  const user = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .get()
  if (!user) {
    throw Error('User not found')
  }
  return user
}

export async function hash(password: string): Promise<string> {
  try {
    const salt = randomBytes(16).toString('hex')

    const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer

    return `${salt}.${derivedKey.toString('hex')}`
  } catch (err) {
    const error = err as Error
    throw new Error(`Error hashing password: ${error.message}`)
  }
}

export async function compare(
  password: string,
  hash: string,
): Promise<boolean> {
  const [salt, hashKey] = hash.split('.')

  if (!salt || !hashKey) {
    throw new Error('Invalid hash format')
  }

  const hashKeyBuff = Buffer.from(hashKey, 'hex')

  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer
  return timingSafeEqual(hashKeyBuff, derivedKey)
}
