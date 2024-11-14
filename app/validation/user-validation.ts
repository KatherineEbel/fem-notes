import { InferSelectModel } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { user as userModel } from '~/db/schema'

export const signupSchema = createInsertSchema(userModel)
  .pick({ email: true })
  .extend({ password: z.string().min(8) })
  .merge(
    z.object({
      intent: z.literal('signup'),
    }),
  )

export const loginSchema = createSelectSchema(userModel)
  .pick({ email: true })
  .extend({ password: z.string().min(1) })
  .merge(
    z.object({
      intent: z.literal('login'),
    }),
  )

export const selectUserSchema = createSelectSchema(userModel)

export type User = InferSelectModel<typeof userModel>

export const authSchema = z.discriminatedUnion('intent', [
  signupSchema,
  loginSchema,
])
